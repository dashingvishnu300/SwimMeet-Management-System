from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import EventList, EventDetail
from .serializers import EventListSerializer, EventDetailSerializer, AssignEventSerializer
from meets.models import Meet
from users.utils import get_age_group
from django.shortcuts import get_object_or_404

# ── MASTER EVENT LIST ────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def event_master_list(request):
    """
    Get all events from master list
    Can filter by gender, age_group, is_relay
    """
    events = EventList.objects.all()

    # Filters
    gender = request.query_params.get('gender')
    age_group = request.query_params.get('age_group')
    is_relay = request.query_params.get('is_relay')
    meet_gender = request.query_params.get('meet_gender')

    if gender:
        events = events.filter(gender__name=gender)
    if age_group:
        events = events.filter(age_group__label=age_group)
    if is_relay:
        events = events.filter(is_relay=is_relay.lower() == 'true')

    # -----------------------------
    # Meet Gender Filter
    # -----------------------------

    if meet_gender == "men":

        events = events.filter(
            gender__name__in=[
                "boys",
                "men"
            ]
        )

    elif meet_gender == "women":

        events = events.filter(
            gender__name__in=[
                "girls",
                "women"
            ]
        )

    # mixed -> no filter

    serializer = EventListSerializer(events, many=True)
    return Response(serializer.data)


# ── MEET EVENTS ──────────────────────────────────────────
@api_view(['GET', 'POST'])
def meet_events(request, meet_id):
    """
    GET  - List all events for a meet (public)
    POST - Assign events to a meet (organizer only)
    """
    try:
        meet = Meet.objects.get(id=meet_id)
    except Meet.DoesNotExist:
        return Response(
            {'error': 'Meet not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':

        events = EventDetail.objects.filter(
            meet=meet
        )

        if (
                request.user.is_authenticated
                and
                request.user.role.name == "swimmer"
                and
                request.user.date_of_birth
        ):

            swimmer = request.user

            age_group = get_age_group(

                swimmer.date_of_birth,

                meet.start_date

            )

            if age_group == 'sub_junior':

                events = events.filter(
                    event_list__is_sub_junior=True
                )

            elif age_group == 'junior':

                events = events.filter(
                    event_list__is_junior=True
                )

            else:

                events = events.filter(
                    event_list__is_senior=True
                )

        serializer = EventDetailSerializer(
            events,
            many=True
        )

        return Response(serializer.data)

    elif request.method == 'POST':
        # Only organizers can assign events
        if not request.user.is_authenticated or \
           request.user.role.name != 'organizer':
            return Response(
                {'error': 'Only organizers can assign events'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Only allow in draft or scheduled status
        if meet.status.name not in ['draft', 'scheduled']:
            return Response(
                {'error': 'Can only assign events to draft or scheduled meets'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = AssignEventSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        event_list_ids = serializer.validated_data['event_list_ids']
        created_events = []
        skipped = []

        for event_list_id in event_list_ids:
            try:
                event_list = EventList.objects.get(id=event_list_id)

                meet_gender = meet.gender.name.lower()
                event_gender = event_list.gender.name.lower()

                if meet_gender == "men":
                    if event_gender not in ["boys", "men"]:
                        skipped.append(event_list_id)
                        continue

                elif meet_gender == "women":
                    if event_gender not in ["girls", "women"]:
                        skipped.append(event_list_id)
                        continue

                # mixed -> allow everything
                # Avoid duplicates
                event_detail, created = EventDetail.objects.get_or_create(
                    meet=meet,
                    event_list=event_list,
                    defaults={'name': f"{event_list.distance_m}m {event_list.stroke}"}
                )
                if created:
                    created_events.append(EventDetailSerializer(event_detail).data)
                else:
                    skipped.append(event_list_id)
            except EventList.DoesNotExist:
                skipped.append(event_list_id)

        return Response({
            'message': f'{len(created_events)} events assigned successfully',
            'created': created_events,
            'skipped': skipped
        }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def eligible_events(request, meet_id):

    swimmer = request.user

    meet = get_object_or_404(Meet, id=meet_id)

    age_group = get_age_group(
        swimmer.date_of_birth,
        meet.start_date
    )

    events = EventDetail.objects.filter(
        meet=meet
    )

    # --------------------------
    # Age Group Filter
    # --------------------------

    if age_group == "sub_junior":

        events = events.filter(
            event_list__is_sub_junior=True
        )

    elif age_group == "junior":

        events = events.filter(
            event_list__is_junior=True
        )

    else:

        events = events.filter(
            event_list__is_senior=True
        )

    # --------------------------
    # Swimmer Gender Filter
    # --------------------------

    allowed_gender = None

    if swimmer.gender == "MALE":

        allowed_gender = (
            "men"
            if age_group == "senior"
            else "boys"
        )

    elif swimmer.gender == "FEMALE":

        allowed_gender = (
            "women"
            if age_group == "senior"
            else "girls"
        )

    if allowed_gender:
        events = events.filter(
            event_list__gender__name=allowed_gender
        )

    meet_gender = meet.gender.name.lower()

    serializer = EventDetailSerializer(
        events,
        many=True
    )

    return Response(serializer.data)


# ── SINGLE MEET EVENT ────────────────────────────────────
@api_view(['GET', 'DELETE'])
def meet_event_detail(request, meet_id, event_id):
    """
    GET    - Get single event details (public)
    DELETE - Remove event from meet (organizer only)
    """
    try:
        meet = Meet.objects.get(id=meet_id)
        event = EventDetail.objects.get(id=event_id, meet=meet)
    except (Meet.DoesNotExist, EventDetail.DoesNotExist):
        return Response(
            {'error': 'Not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = EventDetailSerializer(event)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        if not request.user.is_authenticated or \
           request.user.role.name != 'organizer':
            return Response(
                {'error': 'Only organizers can remove events'},
                status=status.HTTP_403_FORBIDDEN
            )
        if meet.status.name not in ['draft', 'scheduled']:
            return Response(
                {'error': 'Cannot remove events from an active meet'},
                status=status.HTTP_400_BAD_REQUEST
            )
        event.delete()
        return Response(
            {'message': 'Event removed successfully'},
            status=status.HTTP_200_OK
        )