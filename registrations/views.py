from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Registration, SwimmerBestTime
from .serializers import (
    RegistrationSerializer,
    CreateRegistrationSerializer,
    SwimmerBestTimeSerializer
)
from meets.models import Meet
from events.models import EventDetail
from users.models import AppUser
from championships.models import Qualification


# ── LIST & CREATE REGISTRATIONS ──────────────────────────
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def registrations(request, meet_id):
    """
    GET  - List all registrations for a meet (organizer)
    POST - Register a swimmer for an event

    District meet  → swimmer registers themselves
    State/National → coach nominates a swimmer
    """
    try:
        meet = Meet.objects.get(id=meet_id)
    except Meet.DoesNotExist:
        return Response(
            {'error': 'Meet not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        # Only organizers can see all registrations
        if request.user.role.name != 'organizer':
            return Response(
                {'error': 'Only organizers can view all registrations'},
                status=status.HTTP_403_FORBIDDEN
            )
        regs = Registration.objects.filter(meet=meet)
        serializer = RegistrationSerializer(regs, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        # Check registration is open
        if not meet.registration_open:
            return Response(
                {'error': 'Registration is not open for this meet'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = CreateRegistrationSerializer(
            data=request.data,
            context={
                "request": request,
                "meet": meet
            }
        )
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        swimmer_id = serializer.validated_data['swimmer_id']
        event_id = serializer.validated_data['event_id']
        seed_time = serializer.validated_data.get('seed_time')

        # Get swimmer
        try:
            swimmer = AppUser.objects.get(id=swimmer_id)
        except AppUser.DoesNotExist:
            return Response(
                {'error': 'Swimmer not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get event
        try:
            event = EventDetail.objects.get(id=event_id, meet=meet)
            level = meet.level.name.upper()

            if level == 'DISTRICT':
                pass


            elif level == "STATE":

                qualification = Qualification.objects.filter(

                    swimmer=swimmer,

                    qualified_to="STATE",

                    event__event_list=event.event_list

                ).first()

                if not qualification:
                    return Response(

                        {

                            "error":

                                "Swimmer is not qualified for this State event."

                        },

                        status=status.HTTP_403_FORBIDDEN

                    )


            elif level == "NATIONAL":

                qualification = Qualification.objects.filter(

                    swimmer=swimmer,

                    qualified_to="NATIONAL",

                    event__event_list=event.event_list

                ).first()

                if not qualification:
                    return Response(

                        {

                            "error":

                                "Swimmer is not qualified for this National event."

                        },

                        status=status.HTTP_403_FORBIDDEN

                    )
        except EventDetail.DoesNotExist:
            return Response(
                {'error': 'Event not found for this meet'},
                status=status.HTTP_404_NOT_FOUND
            )

        # ── NOMINATION RULES ─────────────────────────────
        # District: swimmer registers themselves
        if level == 'DISTRICT':
            if request.user.role.name == 'swimmer':
                # Swimmer can only register themselves
                if request.user.id != swimmer_id:
                    return Response(
                        {'error': 'Swimmers can only register themselves'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                nominated_by = request.user
            elif request.user.role.name == 'organizer':
                nominated_by = request.user
            else:
                return Response(
                    {'error': 'Only swimmers or organizers can register for district meets'},
                    status=status.HTTP_403_FORBIDDEN
                )

        # State/National: only coach or organizer can nominate
        # State and National registration
        else:

            if request.user.role.name != 'organizer':
                return Response(

                    {
                        'error':
                            'Only organizers can manage registrations for State and National meets'
                    },

                    status=status.HTTP_403_FORBIDDEN

                )

            nominated_by = request.user

        # Check duplicate registration
        if Registration.objects.filter(
                meet=meet, swimmer=swimmer, event=event
        ).exists():
            return Response(
                {'error': 'Swimmer is already registered for this event'},
                status=status.HTTP_400_BAD_REQUEST
            )

        print("Logged In User:", request.user.username)
        print("Role:", request.user.role.name)
        print("Association:", request.user.association)
        print("Association Type:", repr(request.user.association.association_type))

        print("Qualification Type:", serializer.validated_data.get("qualification_type"))
        print("Qualification Source:", serializer.validated_data.get("qualification_source_meet"))

        # Create registration
        registration = Registration.objects.create(
            meet=meet,
            swimmer=swimmer,
            nominated_by=nominated_by,
            event=event,
            seed_time=seed_time,

            qualification_type=(
                Registration.DISTRICT_TO_STATE
                if level == "STATE"
                else Registration.STATE_TO_NATIONAL
                if level == "NATIONAL"
                else None
            ),

            qualification_source_meet=(
                qualification.meet
                if level == "STATE"
                else qualification.meet
                if level == "NATIONAL"
                else None
            ),
        )

        # Update swimmer best time if seed_time provided
        if seed_time:
            best_time, created = SwimmerBestTime.objects.get_or_create(
                swimmer=swimmer,
                event_list=event.event_list,
                defaults={'best_time': seed_time}
            )
            if not created and seed_time < best_time.best_time:
                best_time.best_time = seed_time
                best_time.save()

        return Response(
            RegistrationSerializer(registration).data,
            status=status.HTTP_201_CREATED
        )


# ── RECALL REGISTRATION ──────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def recall_registration(request, meet_id, registration_id):
    """
    Recall/cancel a registration
    Only valid while registration is open
    """
    try:
        meet = Meet.objects.get(id=meet_id)
        registration = Registration.objects.get(
            id=registration_id, meet=meet
        )
    except (Meet.DoesNotExist, Registration.DoesNotExist):
        return Response(
            {'error': 'Not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if not meet.registration_open:
        return Response(
            {'error': 'Cannot recall registration after registration is closed'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Only the nominator or organizer can recall
    if request.user.id != registration.nominated_by.id and \
            request.user.role.name != 'organizer':
        return Response(
            {'error': 'You are not authorized to recall this registration'},
            status=status.HTTP_403_FORBIDDEN
        )

    registration.recall = True
    registration.is_active = False
    registration.save()

    return Response(
        {'message': 'Registration recalled successfully'},
        status=status.HTTP_200_OK
    )


# ── SEND BACK REGISTRATION ───────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_back_registration(request, meet_id, registration_id):
    """
    Organizer sends back a registration to coach for correction
    Only valid while registration is open
    """
    try:
        meet = Meet.objects.get(id=meet_id)
        registration = Registration.objects.get(
            id=registration_id, meet=meet
        )
    except (Meet.DoesNotExist, Registration.DoesNotExist):
        return Response(
            {'error': 'Not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.user.role.name != 'organizer':
        return Response(
            {'error': 'Only organizers can send back registrations'},
            status=status.HTTP_403_FORBIDDEN
        )

    if not meet.registration_open:
        return Response(
            {'error': 'Cannot send back after registration is closed'},
            status=status.HTTP_400_BAD_REQUEST
        )

    registration.sent_back = True
    registration.save()

    return Response({
        'message': 'Registration sent back for correction',
        'registration': RegistrationSerializer(registration).data
    })


# ── SWIMMER'S OWN REGISTRATIONS ──────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_registrations(request):
    """Get all registrations for the logged in swimmer"""
    regs = Registration.objects.filter(swimmer=request.user)
    serializer = RegistrationSerializer(regs, many=True)
    return Response(serializer.data)


# ── SWIMMER BEST TIMES ───────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def swimmer_best_times(request, swimmer_id):
    """Get all best times for a swimmer"""
    try:
        swimmer = AppUser.objects.get(id=swimmer_id)
    except AppUser.DoesNotExist:
        return Response(
            {'error': 'Swimmer not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    best_times = SwimmerBestTime.objects.filter(swimmer=swimmer)
    serializer = SwimmerBestTimeSerializer(best_times, many=True)
    return Response(serializer.data)