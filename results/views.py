from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Final, FinalSwimmer, FinalResult
from .serializers import FinalSerializer, FinalResultSerializer
from events.models import EventDetail
from meets.models import Meet
from heats.models import HeatList, HeatResult
from championships.models import Championship, ChampionshipPoint
from django.db.models import Sum

# ── LANE ASSIGNMENT (reuse same algorithm) ───────────────
def assign_lanes(swimmers_count, pool_lanes):
    if pool_lanes >= 8:

        lane_order = [
            4, 5, 3, 6, 2, 7, 1, 8
        ]

    elif pool_lanes == 6:

        lane_order = [
            3, 4, 2, 5, 1, 6
        ]

    else:

        lane_order = [
            3, 4, 2, 5, 1
        ]
    lane_map = {}
    for rank, lane in enumerate(lane_order[:swimmers_count], start=1):
        lane_map[rank] = lane
    return lane_map


# ── GENERATE FINALS ──────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_finals(request, meet_id, event_id):
    """
    Generate finals from heat results
    Top 8 → finalists, rank 9-10 → reserves
    Organizer only
    """
    if request.user.role.name != 'organizer':
        return Response(
            {'error': 'Only organizers can generate finals'},
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

    # Check all heats are completed
    heats = HeatList.objects.filter(event=event)
    if not heats.exists():
        return Response(
            {'error': 'No heats found for this event'},
            status=status.HTTP_400_BAD_REQUEST
        )

    incomplete = heats.exclude(heat_status='completed')
    if incomplete.exists():
        return Response(
            {'error': 'All heats must be completed before generating finals'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Get all heat results sorted by finish time
    all_results = HeatResult.objects.filter(
        heat__event=event,
        status='swam'
    ).order_by('finish_time')

    if not all_results.exists():
        return Response(
            {'error': 'No valid results found'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Don't regenerate finals

    existing_final = Final.objects.filter(
        event=event
    ).first()

    if existing_final:
        return Response(
            {
                'message':
                    'Final already generated'
            }
        )

    # Create final
    final = Final.objects.create(
        event=event,
        final_number=1
    )

    # Top 8 finalists + 2 reserves
    top_10 = list(all_results[:10])
    pool_lanes = meet.lanes
    finalist_count = min(
        pool_lanes,
        len(top_10)
    )
    lane_map = assign_lanes(finalist_count, pool_lanes)

    for rank, result in enumerate(top_10, start=1):
        swimmer_type = (
            'finalist'
            if rank <= finalist_count
            else 'reserve'
        )
        lane = lane_map.get(rank) if swimmer_type == 'finalist' else None

        FinalSwimmer.objects.create(
            final=final,
            swimmer=result.swimmer,
            lane_number=lane,
            swimmer_type=swimmer_type
        )

    return Response({
        'message': 'Finals generated successfully',
        'final': FinalSerializer(final).data
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_all_finals(request, meet_id):

    if request.user.role.name != 'organizer':
        return Response(
            {'error': 'Only organizers can generate finals'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        meet = Meet.objects.get(id=meet_id)

    except Meet.DoesNotExist:

        return Response(
            {'error': 'Meet not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    events = EventDetail.objects.filter(
        meet=meet
    )

    finals_created = 0

    for event in events:

        # Skip if final already exists
        if Final.objects.filter(
            event=event
        ).exists():

            continue

        heats = HeatList.objects.filter(
            event=event
        )

        if not heats.exists():

            continue

        incomplete = heats.exclude(
            heat_status='completed'
        )

        if incomplete.exists():

            continue

        all_results = HeatResult.objects.filter(
            heat__event=event,
            status='swam'
        ).order_by(
            'finish_time'
        )

        if not all_results.exists():

            continue

        final = Final.objects.create(
            event=event,
            final_number=1
        )

        top_10 = list(
            all_results[:10]
        )

        pool_lanes = meet.lanes

        finalist_count = min(
            pool_lanes,
            len(top_10)
        )

        lane_map = assign_lanes(
            finalist_count,
            pool_lanes
        )

        for rank, result in enumerate(
                top_10,
                start=1
        ):

            swimmer_type = (
                'finalist'
                if rank <= finalist_count
                else 'reserve'
            )

            lane = (
                lane_map.get(rank)
                if swimmer_type == 'finalist'
                else None
            )

            FinalSwimmer.objects.create(
                final=final,
                swimmer=result.swimmer,
                lane_number=lane,
                swimmer_type=swimmer_type
            )

        finals_created += 1

    return Response({

        'message':

            f'{finals_created} finals generated successfully'

    })


# ── GET FINALS ───────────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def event_finals(request, meet_id, event_id):
    """Get finals for an event (public)"""
    try:
        meet = Meet.objects.get(id=meet_id)
        event = EventDetail.objects.get(id=event_id, meet=meet)
    except (Meet.DoesNotExist, EventDetail.DoesNotExist):
        return Response(
            {'error': 'Not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    finals = Final.objects.filter(event=event)
    serializer = FinalSerializer(finals, many=True)
    return Response(serializer.data)


# ── ENTER FINAL RESULTS ──────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enter_final_results(request, final_id):
    """
    Enter results for a final
    Auto calculates ranks
    Organizer only
    """
    if request.user.role.name != 'organizer':
        return Response(
            {'error': 'Only organizers can enter results'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        final = Final.objects.get(id=final_id)

        existing_results = FinalResult.objects.filter(
            final=final
        )

        if existing_results.exists():
            return Response(
                {
                    'error':
                        'Final results already locked.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    except Final.DoesNotExist:
        return Response(
            {'error': 'Final not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    results_data = request.data.get('results', [])
    if not results_data:
        return Response(
            {'error': 'No results provided'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Save results
    for result in results_data:
        if (
                result.get('status') == 'swam'
                and
                not result.get('finish_time')
        ):
            return Response(
                {
                    'error':
                        'Finish time is required for swimmers marked as SWAM.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        FinalResult.objects.update_or_create(
            final=final,
            swimmer_id=result.get('swimmer_id'),
            defaults={
                'finish_time': result.get('finish_time'),
                'status': result.get('status', 'swam')
            }
        )

    # Auto calculate ranks (only for swimmers who swam)
    # Auto calculate ranks and assign medals
    swam_results = FinalResult.objects.filter(
        final=final,
        status='swam'
    ).order_by('finish_time')

    from championships.models import Qualification

    meet_level = final.event.meet.level.name.upper()

    if meet_level == 'DISTRICT':

        Qualification.objects.filter(

            event=final.event,

            qualified_to='STATE'

        ).delete()

    elif meet_level == 'STATE':

        Qualification.objects.filter(

            event=final.event,

            qualified_to='NATIONAL'

        ).delete()

    POINTS_SCALE = {
        1: 7,
        2: 5,
        3: 4,
        4: 3,
        5: 2,
        6: 1
    }

    for rank, result in enumerate(swam_results, start=1):

        result.rank = rank

        from championships.models import Qualification

        meet_level = final.event.meet.level.name.upper()

        if rank <= 2:

            if meet_level == 'DISTRICT':

                Qualification.objects.create(

                    swimmer=result.swimmer,

                    event=final.event,

                    qualified_to='STATE',

                    meet=final.event.meet,

                    qualified_from='DISTRICT',

                    rank=rank,

                    qualification_time=result.finish_time

                )

            elif meet_level == 'STATE':

                Qualification.objects.create(

                    swimmer=result.swimmer,

                    event=final.event,

                    qualified_to='NATIONAL',

                    meet=final.event.meet,

                    qualified_from='STATE',

                    rank=rank,

                    qualification_time=result.finish_time

                )

        if rank == 1:
            result.medal = 'gold'
        elif rank == 2:
            result.medal = 'silver'
        elif rank == 3:
            result.medal = 'bronze'
        else:
            result.medal = 'none'

        result.save()
        from users.tasks import send_result_email

        try:

            send_result_email(

                result.swimmer.email,

                result.swimmer.username,

                result.rank

            )

        except Exception as e:

            print(
                "Result email failed:",
                e
            )


        from championships.views import check_records

        check_records(

            swimmer=result.swimmer,

            event=final.event,

            meet=final.event.meet,

            finish_time=result.finish_time

        )

        points = POINTS_SCALE.get(rank, 0)

        Championship.objects.update_or_create(
            swimmer=result.swimmer,
            event=final.event,
            meet=final.event.meet,
            defaults={
                'total_points': points,
                'placement': rank
            }
        )

        champ_point, created = ChampionshipPoint.objects.get_or_create(
            meet=final.event.meet,
            swimmer=result.swimmer,
            defaults={'points': 0}
        )

        champ_point.points = (
                Championship.objects.filter(
                    meet=final.event.meet,
                    swimmer=result.swimmer
                ).aggregate(
                    total=Sum('total_points')
                )['total'] or 0
        )

        champ_point.save()

        #from championships.views import promote_swimmers

        #meet_id = final.event.meet.id

        #promote_swimmers(
            #request,
            #meet_id
        #)

    # Return updated final
    return Response({
        'message': 'Final results saved and ranked successfully',
        'final': FinalSerializer(final).data
    })


# ── GET MEET RESULTS (PUBLIC) ────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def meet_results(request, meet_id):
    """Get all final results for a meet (public)"""
    try:
        meet = Meet.objects.get(id=meet_id)
    except Meet.DoesNotExist:
        return Response(
            {'error': 'Meet not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    events = EventDetail.objects.filter(meet=meet)
    all_results = []

    for event in events:
        finals = Final.objects.filter(event=event)
        for final in finals:
            results = FinalResult.objects.filter(
                final=final
            ).order_by('rank')
            all_results.append({
                'event': event.name,
                'results': FinalResultSerializer(results, many=True).data
            })

    return Response(all_results)

@api_view(['GET'])
@permission_classes([AllowAny])
def final_details(request, final_id):

    try:

        final = Final.objects.get(
            id=final_id
        )

    except Final.DoesNotExist:

        return Response(
            {'error': 'Final not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    swimmers = FinalSwimmer.objects.filter(
        final=final
    ).select_related(
        'swimmer'
    )

    data = []

    for swimmer in swimmers:

        data.append({

            'lane':

                swimmer.lane_number,

            'swimmer':

                swimmer.swimmer.username,

            'type':

                swimmer.swimmer_type

        })

    return Response({

        'event':

            final.event.name,

        'final_number':

            final.final_number,

        'swimmers':

            data

    })