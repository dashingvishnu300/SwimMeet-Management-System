from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import AppUser, Role
from .serializers import RegisterSerializer, UserProfileSerializer
from django.db.models import Sum
from results.models import FinalResult
from championships.models import ChampionshipPoint
from collections import defaultdict
from registrations.models import Registration
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.core.mail import send_mail
import uuid
import random
import string
# ── HELPER ──────────────────────────────────────────────
def get_tokens_for_user(user):
    """Generate JWT access + refresh tokens for a user"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# ── REGISTER ────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user (swimmer, coach, or organizer)
    Required: email OR phone_number, password, role_name
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user.email_verification_token = uuid.uuid4()

        user.save()
        tokens = get_tokens_for_user(user)
        return Response({

            'message':
'Registration submitted successfully. Your organizer account is under administrator review. You will receive an email once your application has been approved or rejected.',

            'verification_link':

                f'http://127.0.0.1:8000/api/users/verify-email/{user.email_verification_token}/',

            'user':

                UserProfileSerializer(user).data,

            'tokens':

                tokens

        }, status=status.HTTP_201_CREATED)

    print("REGISTER ERRORS =", serializer.errors)

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# ── LOGIN ───────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Login with email + password
    Returns JWT access + refresh tokens
    """
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({
            'error': 'Email and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, email=email, password=password)

    if user is None:
        return Response({
            'error': 'Invalid email or password'
        }, status=status.HTTP_401_UNAUTHORIZED)
    if (
            user.role
            and user.role.name == 'organizer'
            and user.organizer_status == 'pending'
    ):
        return Response(

            {
                'error':
                    'Your organizer account is awaiting admin approval.'
            },

            status=status.HTTP_403_FORBIDDEN

        )

    if (
            user.role
            and user.role.name == 'organizer'
            and user.organizer_status == 'rejected'
    ):
        return Response(

            {
                'error':
                    'Your organizer account has been rejected.'
            },

            status=status.HTTP_403_FORBIDDEN

        )

    if not user.is_active:
        return Response({
            'error': 'Account is disabled'
        }, status=status.HTTP_403_FORBIDDEN)


    tokens = get_tokens_for_user(user)
    return Response({

        'message': 'Login successful',

        'user': UserProfileSerializer(user).data,

        'tokens': tokens,

        'must_change_password':
            user.must_change_password,

        'organizer_status':
            user.organizer_status,

    })


# ── PROFILE ─────────────────────────────────────────────
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile(request):
    """
    GET  - returns logged in user profile
    PATCH - updates logged in user profile
    """
    if request.method == 'GET':
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        serializer = UserProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profile updated successfully',
                'user': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── LOGOUT ──────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logout by blacklisting the refresh token
    """
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({
            'message': 'Logged out successfully'
        }, status=status.HTTP_200_OK)
    except Exception:
        return Response({
            'error': 'Invalid token'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def swimmer_list(request):
    """
        GET /users/swimmers/
        Returns all swimmers — only coach and organizer can access
        """
    if request.user.role.name == 'swimmer':
        return Response(
            {'error': 'Access denied'},
            status=status.HTTP_403_FORBIDDEN
        )
    if request.user.role.name not in ['coach', 'organizer']:
        return Response(
            {'error': 'Only coaches and organizers can view swimmer list'},
            status=status.HTTP_403_FORBIDDEN
        )
    swimmer_role = Role.objects.get(name='swimmer')
    swimmers = AppUser.objects.filter(role=swimmer_role)
    serializer = UserProfileSerializer(swimmers, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_stats(request):

    print("User ID =", request.user.id)
    print("Username =", request.user.username)

    swimmer_id = request.user.id

    gold = FinalResult.objects.filter(
        swimmer_id=swimmer_id,
        medal='gold'
    ).count()

    silver = FinalResult.objects.filter(
        swimmer_id=swimmer_id,
        medal='silver'
    ).count()

    bronze = FinalResult.objects.filter(
        swimmer_id=swimmer_id,
        medal='bronze'
    ).count()

    points = ChampionshipPoint.objects.filter(
        swimmer_id=swimmer_id
    ).aggregate(total=Sum('points'))['total'] or 0

    achievements = []

    if points >= 15:
        achievements.append("Champion 2026")

    if gold >= 1:
        achievements.append("Record Holder")

    if gold + silver + bronze >= 3:
        achievements.append("Elite Swimmer")

    return Response({
        "gold_medals": gold,
        "silver_medals": silver,
        "bronze_medals": bronze,
        "championship_points": points,
        "achievements": achievements
    })
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_results(request):

    swimmer = request.user

    results = (
        FinalResult.objects
        .filter(swimmer=swimmer)
        .exclude(medal='none')
        .order_by('-id')[:5]
    )

    response = []

    for result in results:

        response.append({

            "medal": result.medal,

            "event":
            result.final.event.name

        })

    return Response(response)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def personal_bests(request):

    swimmer = request.user

    results = FinalResult.objects.filter(
        swimmer=swimmer,
        status='swam'
    )

    best_times = {}

    for result in results:

        if result.finish_time is None:
            continue

        event_name = result.final.event.name

        if (
            event_name not in best_times
            or result.finish_time < best_times[event_name]
        ):

            best_times[event_name] = result.finish_time

    response = []

    for event, time in best_times.items():

        response.append({

            "event": event,
            "time": str(time)

        })

    return Response(response)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def records_held(request):

    swimmer = request.user

    results = FinalResult.objects.filter(
        swimmer=swimmer
    ).exclude(
        medal='none'
    )

    response = []

    for result in results:

        response.append({

            "event": result.final.event.name,

            "medal": result.medal

        })

    return Response(response)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def meet_history(request):

    swimmer = request.user

    registrations = Registration.objects.filter(
        swimmer=swimmer,
        is_active=True
    )

    seen = set()
    response = []

    for registration in registrations:

        meet_name = registration.meet.name

        if meet_name not in seen:

            seen.add(meet_name)

            response.append({

                "meet": meet_name

            })

    return Response(response)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def registered_events(request):

    swimmer = request.user

    registrations = Registration.objects.filter(
        swimmer=swimmer,
        is_active=True
    )

    response = []

    seen = set()

    for registration in registrations:

        event_name = registration.event.name

        if event_name not in seen:

            seen.add(event_name)

            response.append({

                "event": event_name

            })

    return Response(response)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_stats_by_id(request, swimmer_id):

    swimmer = get_object_or_404(
        AppUser,
        pk=swimmer_id
    )

    gold = FinalResult.objects.filter(
        swimmer=swimmer,
        medal='gold'
    ).count()

    silver = FinalResult.objects.filter(
        swimmer=swimmer,
        medal='silver'
    ).count()

    bronze = FinalResult.objects.filter(
        swimmer=swimmer,
        medal='bronze'
    ).count()

    points = ChampionshipPoint.objects.filter(
        swimmer=swimmer
    ).aggregate(
        total=Sum('points')
    )['total'] or 0

    achievements = []

    if points >= 15:
        achievements.append("Champion 2026")

    if gold >= 1:
        achievements.append("Record Holder")

    if gold + silver + bronze >= 3:
        achievements.append("Elite Swimmer")

    return Response({

        "gold_medals": gold,
        "silver_medals": silver,
        "bronze_medals": bronze,
        "championship_points": points,
        "achievements": achievements

    })
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def personal_bests_by_id(request, swimmer_id):

    swimmer = get_object_or_404(
        AppUser,
        pk=swimmer_id
    )

    results = FinalResult.objects.filter(
        swimmer=swimmer,
        status='swam'
    )

    best_times = {}

    for result in results:

        if result.finish_time is None:
            continue

        event_name = result.final.event.name

        if (
            event_name not in best_times
            or result.finish_time < best_times[event_name]
        ):

            best_times[event_name] = result.finish_time

    response = []

    for event, time in best_times.items():

        response.append({

            "event": event,
            "time": str(time)

        })

    return Response(response)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_results_by_id(request, swimmer_id):

    swimmer = get_object_or_404(
        AppUser,
        pk=swimmer_id
    )

    results = (
        FinalResult.objects
        .filter(swimmer=swimmer)
        .exclude(medal='none')
        .order_by('-id')[:5]
    )

    response = []

    for result in results:

        response.append({

            "medal": result.medal,

            "event":
            result.final.event.name

        })

    return Response(response)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def records_held_by_id(request, swimmer_id):

    swimmer = get_object_or_404(
        AppUser,
        pk=swimmer_id
    )

    results = FinalResult.objects.filter(
        swimmer=swimmer
    ).exclude(
        medal='none'
    )

    response = []

    for result in results:

        response.append({

            "event": result.final.event.name,

            "medal": result.medal

        })

    return Response(response)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def meet_history_by_id(request, swimmer_id):

    swimmer = get_object_or_404(
        AppUser,
        pk=swimmer_id
    )

    registrations = Registration.objects.filter(
        swimmer=swimmer,
        is_active=True
    )

    seen = set()
    response = []

    for registration in registrations:

        meet_name = registration.meet.name

        if meet_name not in seen:

            seen.add(meet_name)

            response.append({

                "meet": meet_name

            })

    return Response(response)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def registered_events_by_id(request, swimmer_id):

    swimmer = get_object_or_404(
        AppUser,
        pk=swimmer_id
    )

    registrations = Registration.objects.filter(
        swimmer=swimmer,
        is_active=True
    )

    seen = set()
    response = []

    for registration in registrations:

        event_name = registration.event.name

        if event_name not in seen:

            seen.add(event_name)

            response.append({

                "event": event_name

            })

    return Response(response)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_by_id(request, swimmer_id):

    swimmer = get_object_or_404(
        AppUser,
        pk=swimmer_id
    )

    serializer = UserProfileSerializer(swimmer)

    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_organizers(request):

    if request.user.role.name != 'admin':
        return Response(
            {'error': 'Access denied'},
            status=status.HTTP_403_FORBIDDEN
        )

    organizers = AppUser.objects.filter(
        role__name='organizer',
        organizer_status='pending'
    )

    serializer = UserProfileSerializer(
        organizers,
        many=True
    )

    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def approved_organizers(request):

    if request.user.role.name != 'admin':
        return Response(
            {'error': 'Access denied'},
            status=status.HTTP_403_FORBIDDEN
        )

    organizers = AppUser.objects.filter(
        role__name='organizer',
        organizer_status='approved'
    )

    serializer = UserProfileSerializer(
        organizers,
        many=True
    )

    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rejected_organizers(request):

    if request.user.role.name != 'admin':
        return Response(
            {'error': 'Access denied'},
            status=status.HTTP_403_FORBIDDEN
        )

    organizers = AppUser.objects.filter(
        role__name='organizer',
        organizer_status='rejected'
    )

    serializer = UserProfileSerializer(
        organizers,
        many=True
    )

    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_organizer(request, organizer_id):

    if request.user.role.name != 'admin':
        return Response(
            {'error': 'Access denied'},
            status=status.HTTP_403_FORBIDDEN
        )

    organizer = get_object_or_404(
        AppUser,
        id=organizer_id,
        role__name='organizer'
    )

    organizer.organizer_status = 'rejected'

    organizer.rejection_reason = request.data.get(
        'reason',
        ''
    )

    organizer.save()

    send_mail(
        subject='Organizer Application Rejected',

        message=f"""
    Dear {organizer.first_name},

    We regret to inform you that your organizer application has been rejected.

    Reason:

    {organizer.rejection_reason}

    Please correct the issue and submit a new application.

    Regards,
    SwimMeet Administration
    """,

        from_email=None,

        recipient_list=[organizer.email],

        fail_silently=False
    )

    return Response({

        'message':
            'Organizer rejected successfully'

    })



def generate_temp_password():

    return ''.join(
        random.choices(
            string.ascii_letters + string.digits,
            k=10
        )
    )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_organizer(request, organizer_id):

    if request.user.role.name != 'admin':
        return Response(
            {'error': 'Access denied'},
            status=status.HTTP_403_FORBIDDEN
        )

    organizer = get_object_or_404(
        AppUser,
        id=organizer_id,
        role__name='organizer'
    )

    temp_password = generate_temp_password()

    organizer.set_password(temp_password)

    organizer.organizer_status = 'approved'

    organizer.approved_by = request.user

    organizer.approved_at = timezone.now()

    organizer.must_change_password = True

    organizer.temporary_password_sent = True

    organizer.save()

    send_mail(
        subject='Organizer Account Approved',

        message=f"""
Congratulations!

Your organizer account has been approved.

Temporary password:

{temp_password}

You must change your password immediately after login.
""",

        from_email=None,

        recipient_list=[organizer.email],

        fail_silently=False
    )

    return Response({

        'message':
            'Organizer approved successfully'

    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):

    current_password = request.data.get(
        'current_password'
    )

    new_password = request.data.get(
        'new_password'
    )

    if not request.user.check_password(
        current_password
    ):

        return Response(

            {
                'error':
                'Current password is incorrect'
            },

            status=status.HTTP_400_BAD_REQUEST

        )

    request.user.set_password(
        new_password
    )

    request.user.must_change_password = False

    request.user.save()

    return Response({

        'message':
        'Password changed successfully'

    })

@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request, token):

    try:

        user = AppUser.objects.get(
            email_verification_token=token
        )

    except AppUser.DoesNotExist:

        return Response(

            {
                'error':
                'Invalid verification link.'
            },

            status=status.HTTP_400_BAD_REQUEST

        )

    user.email_verified = True

    user.email_verification_token = None

    user.save()

    return Response({

        'message':
        'Email verified successfully.'

    })

from championships.models import Qualification
from users.serializers import UserProfileSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def qualified_swimmers(request):

    level = request.query_params.get('level')
    event_id = request.query_params.get('event_id')

    if level == 'STATE':

        from events.models import EventDetail

        current_event = EventDetail.objects.get(
            id=event_id
        )

        qualifications = Qualification.objects.filter(

            qualified_to='STATE',

            swimmer__state_master=request.user.state_master,

            event__event_list=current_event.event_list

        ).select_related('swimmer')

    elif level == 'NATIONAL':

        from events.models import EventDetail

        current_event = EventDetail.objects.get(
            id=event_id
        )

        qualifications = Qualification.objects.filter(

            qualified_to='NATIONAL',

            event__event_list=current_event.event_list

        ).select_related('swimmer')

    else:

        return Response([])

    swimmers = [

        q.swimmer

        for q in qualifications

    ]

    serializer = UserProfileSerializer(

        swimmers,

        many=True

    )

    return Response(serializer.data)

