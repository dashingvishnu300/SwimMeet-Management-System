from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import HeatList, HeatSwimmer, HeatResult
from .serializers import HeatListSerializer, HeatResultSerializer
from events.models import EventDetail
from meets.models import Meet
from registrations.models import Registration


# ── LANE ASSIGNMENT ALGORITHM ────────────────────────────
def assign_lanes(swimmers_count, pool_lanes):
    """
    Assigns lanes based on seed time rank
    8 lane pool: seed rank → lane [4,5,3,6,2,7,1,8]
    5 lane pool: seed rank → lane [3,4,2,5,1]
    Returns dict: {seed_rank: lane_number}
    """
    if pool_lanes >= 8:
        lane_order = [4, 5, 3, 6, 2, 7, 1, 8]
    else:
        lane_order = [3, 4, 2, 5, 1]

    lane_map = {}
    for rank, lane in enumerate(lane_order[:swimmers_count], start=1):
        lane_map[rank] = lane
    return lane_map


# ── GENERATE HEATS ───────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_heats(request, meet_id, event_id):
    """
    Auto generate heats for an event based on seed times
    Organizer only
    """
    if request.user.role.name != 'organizer':
        return Response(
            {'error': 'Only organizers can generate heats'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        meet = Meet.objects.get(id=meet_id)
        event = EventDetail.objects.get(id=event_id, meet=meet)
    except (Meet.DoesNotExist, EventDetail.DoesNotExist):
        return Response(
            {'error': 'Meet or event not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Get all registrations for this event
    # Swimmers WITH seed time first (sorted fastest to slowest)
    # Swimmers WITHOUT seed time go to last heat, least preferred lane
    registrations_with_time = Registration.objects.filter(
        meet=meet, event=event,
        is_active=True,
        seed_time__isnull=False
    ).order_by('seed_time')

    registrations_without_time = Registration.objects.filter(
        meet=meet, event=event,
        is_active=True,
        seed_time__isnull=True
    )

    # Combine — seeded swimmers first, unseeded last
    registrations = list(registrations_with_time) + list(registrations_without_time)

    if not registrations:
        return Response(
            {'error': 'No registrations found for this event'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Delete existing heats if regenerating
    HeatSwimmer.objects.filter(
        heat__event=event
    ).delete()

    # Prevent regeneration
    if HeatList.objects.filter(event=event).exists():
        return Response(
            {
                'message': 'Heats already generated'
            }
        )

    pool_lanes = meet.lanes
    swimmers = list(registrations)
    total_swimmers = len(swimmers)

    # Split swimmers into heats
    heats_data = []

    for i in range(
            0,
            total_swimmers,
            pool_lanes
    ):
        heats_data.append(
            swimmers[i:i + pool_lanes]
        )

    heats_data.reverse()

    created_heats = []

    for heat_number, heat_swimmers in enumerate(heats_data, start=1):
        heat = HeatList.objects.create(
            event=event,
            heat_number=heat_number,
            heat_status='not_swam'
        )

        # Assign lanes based on seed time rank
        lane_map = assign_lanes(len(heat_swimmers), pool_lanes)

        for rank, registration in enumerate(heat_swimmers, start=1):
            lane = lane_map.get(rank, rank)
            HeatSwimmer.objects.create(
                heat=heat,
                swimmer=registration.swimmer,
                lane_number=lane,
                seed_time=registration.seed_time
            )

        created_heats.append(HeatListSerializer(heat).data)

    return Response({
        'message': f'{len(created_heats)} heats generated successfully',
        'heats': created_heats
    }, status=status.HTTP_201_CREATED)


# ── GET HEATS FOR EVENT ──────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def event_heats(request, meet_id, event_id):
    """Get all heats for an event (public)"""
    try:
        meet = Meet.objects.get(id=meet_id)
        event = EventDetail.objects.get(id=event_id, meet=meet)
    except (Meet.DoesNotExist, EventDetail.DoesNotExist):
        return Response(
            {'error': 'Not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    heats = HeatList.objects.filter(event=event)
    serializer = HeatListSerializer(heats, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def heat_details(request, heat_id):

    try:
        heat = HeatList.objects.get(id=heat_id)

        existing_results = HeatResult.objects.filter(
            heat=heat
        )

        if existing_results.exists():
            return Response(
                {
                    'error':
                        'Heat results already locked.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

    except HeatList.DoesNotExist:

        return Response(
            {'error': 'Heat not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    swimmers = HeatSwimmer.objects.filter(
        heat=heat
    ).select_related(
        'swimmer'
    )

    data = []

    for s in swimmers:

        data.append({

            'lane':

                s.lane_number,

            'swimmer':

                s.swimmer.username,

            'seed_time':

                str(s.seed_time)
                if s.seed_time
                else None

        })

    return Response({

        'event':

            heat.event.name,

        'heat_number':

            heat.heat_number,

        'swimmers':

            data

    })

# ── ENTER HEAT RESULTS ───────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enter_heat_results(request, heat_id):
    """
    Enter results for a heat
    Organizer only
    Expected format:
    {
        "results": [
            {"swimmer_id": 1, "finish_time": "00:01:23.45", "status": "swam"},
            {"swimmer_id": 2, "finish_time": null, "status": "dns"}
        ]
    }
    """
    if request.user.role.name != 'organizer':
        return Response(
            {'error': 'Only organizers can enter results'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        heat = HeatList.objects.get(id=heat_id)
    except HeatList.DoesNotExist:
        return Response(
            {'error': 'Heat not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    results_data = request.data.get('results', [])
    if not results_data:
        return Response(
            {'error': 'No results provided'},
            status=status.HTTP_400_BAD_REQUEST
        )

    created_results = []
    for result in results_data:
        swimmer_id = result.get('swimmer_id')
        finish_time = result.get('finish_time')
        result_status = result.get('status', 'swam')

        from datetime import timedelta

        # convert string to timedelta
        parsed_time = None

        if finish_time:
            try:
                h, m, s = finish_time.split(':')
                parsed_time = timedelta(
                    hours=int(h),
                    minutes=int(m),
                    seconds=float(s)
                )
            except Exception:
                parsed_time = None

        heat_result, created = HeatResult.objects.update_or_create(
            heat=heat,
            swimmer_id=swimmer_id,
            defaults={
                'finish_time': parsed_time,
                'status': result_status
            }
        )
        created_results.append(HeatResultSerializer(heat_result).data)

    # Mark heat as completed
    heat.heat_status = 'completed'
    heat.save()

    # Check if all heats for this event are completed
    event = heat.event
    all_heats = HeatList.objects.filter(event=event)
    if all(h.heat_status == 'completed' for h in all_heats):
        # Auto trigger finals generation
        return Response({
            'message': 'Heat completed! All heats done — ready to generate finals!',
            'results': created_results,
            'all_heats_complete': True
        })

    return Response({
        'message': 'Heat results saved successfully',
        'results': created_results,
        'all_heats_complete': False
    })


# ── COMPLETE HEAT ────────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_heat(request, heat_id):
    """Mark a heat as completed"""
    if request.user.role.name != 'organizer':
        return Response(
            {'error': 'Only organizers can complete heats'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        heat = HeatList.objects.get(id=heat_id)
    except HeatList.DoesNotExist:
        return Response(
            {'error': 'Heat not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    heat.heat_status = 'completed'
    heat.save()

    return Response({
        'message': f'Heat {heat.heat_number} marked as completed',
        'heat': HeatListSerializer(heat).data
    })