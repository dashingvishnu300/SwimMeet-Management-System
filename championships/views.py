from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import (
    Championship,
    ChampionshipPoint,
    Record,
    RecordType,
    Qualification
)
from .serializers import (
    ChampionshipSerializer,
    ChampionshipPointSerializer,
    RecordSerializer
)
from meets.models import Meet
from events.models import EventDetail
from results.models import Final, FinalResult
from django.db.models import Count, Sum, Min
from users.models import AppUser
from collections import defaultdict



# ── SFI STANDARD POINTS SCALE ───────────────────────────
# Individual events
INDIVIDUAL_POINTS = {
    1: 7,
    2: 5,
    3: 4,
    4: 3,
    5: 2,
    6: 1
}

# Relay events (double points)
RELAY_POINTS = {
    1: 14,
    2: 10,
    3: 8,
    4: 6,
    5: 4,
    6: 2
}


def get_points(placement, is_relay):
    """Get SFI points based on placement and event type"""
    scale = RELAY_POINTS if is_relay else INDIVIDUAL_POINTS
    return scale.get(placement, 0)


def calculate_world_aquatics_points(base_time_seconds, swimmer_time_seconds):
    """
    World Aquatics Performance Points formula
    P = 1000 × (B / T)³
    B = world standard base time
    T = swimmer's time
    Higher points = better performance
    """
    if swimmer_time_seconds <= 0:
        return 0
    return round(1000 * (base_time_seconds / swimmer_time_seconds) ** 3, 2)

def check_records(
        swimmer,
        event,
        meet,
        finish_time
):

    record_levels = [

        'MEET',

        'DISTRICT',

        'STATE',

        'NATIONAL',

        'OPEN'

    ]

    for level in record_levels:

        record_type, created = (

            RecordType.objects.get_or_create(

                name=level

            )

        )

        existing_record = (

            Record.objects

            .filter(

                event_list=event.event_list,

                record_type=record_type

            )

            .order_by(

                'new_time'

            )

            .first()

        )

        if (

                existing_record is None

                or

                finish_time < existing_record.new_time

        ):

            Record.objects.create(

                swimmer=swimmer,

                event_list=event.event_list,

                record_type=record_type,

                old_time=(
                    existing_record.new_time
                    if existing_record
                    else None
                ),

                new_time=finish_time,

                meet=meet

            )


# ── CALCULATE CHAMPIONSHIP POINTS ───────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_points(request, meet_id):
    """
    Calculate championship points for all events in a meet
    Based on final results rankings
    Organizer only
    """
    if request.user.role.name != 'organizer':
        return Response(
            {'error': 'Only organizers can calculate points'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        meet = Meet.objects.get(id=meet_id)
    except Meet.DoesNotExist:
        return Response(
            {'error': 'Meet not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    events = EventDetail.objects.filter(meet=meet)
    total_processed = 0

    for event in events:
        finals = Final.objects.filter(event=event)
        for final in finals:
            results = FinalResult.objects.filter(
                final=final,
                status='swam'
            ).order_by('rank')

            for result in results:
                if result.rank and result.rank <= 6:
                    is_relay = event.event_list.is_relay
                    points = get_points(result.rank, is_relay)

                    # Save championship per event
                    Championship.objects.update_or_create(
                        swimmer=result.swimmer,
                        event=event,
                        meet=meet,
                        defaults={
                            'total_points': points,
                            'placement': result.rank
                        }
                    )

                    # Update cumulative points
                    champ_point, created = ChampionshipPoint.objects.get_or_create(
                        meet=meet,
                        swimmer=result.swimmer,
                        defaults={'points': 0}
                    )
                    champ_point.points += points
                    champ_point.save()
                    total_processed += 1

    return Response({
        'message': f'Championship points calculated for {total_processed} results',
        'meet': meet.name
    })


# ── MEDAL TALLY ──────────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def medal_tally(request, meet_id):

    try:
        meet = Meet.objects.get(id=meet_id)
        if not meet.results_published:
            return Response(
                {"error": "Results have not been published yet"},
                status=status.HTTP_403_FORBIDDEN
            )
    except Meet.DoesNotExist:
        return Response(
            {'error': 'Meet not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    points_table = ChampionshipPoint.objects.filter(
        meet=meet
    )

    leaderboard = []

    for row in points_table:

        gold = FinalResult.objects.filter(
            swimmer=row.swimmer,
            final__event__meet=meet,
            medal='gold'
        ).count()

        silver = FinalResult.objects.filter(
            swimmer=row.swimmer,
            final__event__meet=meet,
            medal='silver'
        ).count()

        bronze = FinalResult.objects.filter(
            swimmer=row.swimmer,
            final__event__meet=meet,
            medal='bronze'
        ).count()

        leaderboard.append({
            "team_name": row.swimmer.username,
            "gold_count": gold,
            "silver_count": silver,
            "bronze_count": bronze,
            "total_medals": gold + silver + bronze,
            "points": row.points
        })

    return Response({
        "meet": meet.name,
        "leaderboard": leaderboard
    })

# ── PODIUM ───────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def podium(request, meet_id):
    """
    Get top 3 per event (public)
    """
    try:
        meet = Meet.objects.get(id=meet_id)
        if not meet.results_published:
            return Response(
                {"error": "Results have not been published yet"},
                status=status.HTTP_403_FORBIDDEN
            )
    except Meet.DoesNotExist:
        return Response(
            {'error': 'Meet not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    events = EventDetail.objects.filter(meet=meet)
    podium_data = []

    for event in events:
        top3 = Championship.objects.filter(
            meet=meet,
            event=event,
            placement__lte=3
        ).order_by('placement')

        if top3.exists():
            podium_data.append({
                'event': event.name,
                'podium': ChampionshipSerializer(top3, many=True).data
            })

    return Response(podium_data)


# ── RECORDS ──────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def records(request):
    """
    Get all records
    Filter by level: ?level=national
    """
    all_records = Record.objects.all().order_by('-record_date')
    level = request.query_params.get('level')
    if level:
        all_records = all_records.filter(record_type__name=level)
    serializer = RecordSerializer(all_records, many=True)
    return Response(serializer.data)

# ── SWIMMER PROFILE ──────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def swimmer_championships(request, swimmer_id):
    """Get all championship results for a swimmer"""
    championships = Championship.objects.filter(
        swimmer_id=swimmer_id
    ).order_by('-meet__start_date')
    serializer = ChampionshipSerializer(championships, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def swimmer_dashboard(request):
    """
    Dashboard for logged in swimmer
    """

    swimmer = request.user

    published_meets = Meet.objects.filter(
        results_published=True
    )

    gold_medals = FinalResult.objects.filter(
        swimmer=swimmer,
        medal='gold',
        final__event__meet__in=published_meets
    ).count()

    silver_medals = FinalResult.objects.filter(
        swimmer=swimmer,
        medal='silver',
        final__event__meet__in=published_meets
    ).count()

    bronze_medals = FinalResult.objects.filter(
        swimmer=swimmer,
        medal='bronze',
        final__event__meet__in=published_meets
    ).count()

    total_points = ChampionshipPoint.objects.filter(
        swimmer=swimmer,
        meet__results_published=True
    ).aggregate(
        total=Sum('points')
    )['total'] or 0

    events_participated = Championship.objects.filter(
        swimmer=swimmer,
        meet__results_published=True
    ).count()

    leaderboard = ChampionshipPoint.objects.values(
        'swimmer'
    ).annotate(
        total=Sum('points')
    ).order_by('-total')

    overall_rank = None

    for idx, row in enumerate(leaderboard, start=1):
        if row['swimmer'] == swimmer.id:
            overall_rank = idx
            break

    recent_results = FinalResult.objects.filter(
        swimmer=swimmer,
        final__event__meet__results_published=True
    ).select_related(
        'final',
        'final__event'
    ).order_by('-id')[:10]

    recent_data = []

    for r in recent_results:
        recent_data.append({
            "event": r.final.event.name,
            "rank": r.rank,
            "medal": r.medal,
            "time": str(r.finish_time) if r.finish_time else None
        })

    personal_bests = []

    championships = Championship.objects.filter(
        swimmer=swimmer,
        meet__results_published=True
    ).select_related('event')

    for champ in championships:

        best = FinalResult.objects.filter(
            swimmer=swimmer,
            final__event=champ.event,
            status='swam'
        ).order_by('finish_time').first()

        if best:
            personal_bests.append({
                "event": champ.event.name,
                "best_time": str(best.finish_time)
            })

    achievements = []

    if gold_medals >= 1:
        achievements.append("Gold Medal Winner")

    if gold_medals >= 3:
        achievements.append("Triple Gold Winner")

    if total_points >= 20:
        achievements.append("Championship Contender")

    if overall_rank == 1:
        achievements.append("Meet Champion")

    return Response({
        "swimmer": swimmer.username,

        "stats": {
            "events_participated": events_participated,
            "gold_medals": gold_medals,
            "silver_medals": silver_medals,
            "bronze_medals": bronze_medals,
            "points": total_points,
            "overall_rank": overall_rank
        },

        "personal_bests": personal_bests,

        "recent_results": recent_data,

        "achievements": achievements
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def swimmer_personal_bests(
        request,
        swimmer_id
):

    swimmer = AppUser.objects.get(
        id=swimmer_id
    )

    events = EventDetail.objects.all()

    pbs = []

    for event in events:

        best = (

            FinalResult.objects

            .filter(
                swimmer=swimmer,
                final__event=event,
                status='swam'
            )

            .order_by(
                'finish_time'
            )

            .first()

        )

        if best:

            pbs.append({

                'event':

                    event.name,

                'best_time':

                    str(best.finish_time)

            })

    return Response(pbs)

@api_view(['GET'])
@permission_classes([AllowAny])
def overall_rankings(request):

    leaderboard = (

        ChampionshipPoint.objects

        .values(
            'swimmer__username'
        )

        .annotate(
            total_points=Sum('points')
        )

        .order_by(
            '-total_points'
        )

    )

    rankings = []

    for rank, row in enumerate(
            leaderboard,
            start=1
    ):

        rankings.append({

            'rank': rank,

            'swimmer':

                row['swimmer__username'],

            'points':

                row['total_points']

        })

    return Response(rankings)

@api_view(['GET'])
@permission_classes([AllowAny])
def top_medalists(request):

    swimmers = AppUser.objects.all()

    response = []

    for swimmer in swimmers:

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

        total = gold + silver + bronze

        if total > 0:

            response.append({

                'swimmer':
                    swimmer.username,

                'gold':
                    gold,

                'silver':
                    silver,

                'bronze':
                    bronze,

                'total':
                    total

            })

    response.sort(
        key=lambda x:
        (
            -x['gold'],
            -x['silver'],
            -x['bronze']
        )
    )

    return Response(response)

@api_view(['GET'])
@permission_classes([AllowAny])
def meet_rankings(request, meet_id):

    rankings = (

        ChampionshipPoint.objects

        .filter(
            meet_id=meet_id
        )

        .order_by(
            '-points'
        )

    )

    serializer = ChampionshipPointSerializer(

        rankings,

        many=True

    )

    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def records_center(request):

    records = []

    events = EventDetail.objects.all()
    for event in events:

        best = (

            FinalResult.objects

            .filter(

                final__event=event,

                status='swam'

            )
            .select_related(
                'swimmer',
                'final__event__meet'
            )
            .order_by('finish_time')
            .first()
        )

        if best:

            records.append({
                'event': event.name,
                'swimmer': best.swimmer.username,
                'meet': best.final.event.meet.name,
                'time': str(best.finish_time),
                'year': best.final.event.meet.start_date.year
            })

    return Response({
        'records': records
    })
@api_view(['GET'])
@permission_classes([AllowAny])
def meet_records(request, meet_id):

    try:
        meet = Meet.objects.get(id=meet_id)

    except Meet.DoesNotExist:

        return Response(
            {'error': 'Meet not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    records = []

    events = EventDetail.objects.filter(meet=meet)
    for event in events:

        best = (

            FinalResult.objects

            .filter(

                final__event=event,

                status='swam'

            )
            .select_related('swimmer')
            .order_by('finish_time')
            .first()
        )

        if best:

            records.append({
                'event': event.name,
                'swimmer': best.swimmer.username,
                'time': str(best.finish_time)
            })

    return Response({
        'meet': meet.name,
        'records': records
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def national_records(request):

    records = Record.objects.filter(

        record_type__name='NATIONAL'

    ).order_by(

        'new_time'

    )

    serializer = RecordSerializer(

        records,

        many=True

    )

    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def state_records(request):

    records = Record.objects.filter(

        record_type__name='STATE'

    ).order_by(

        'new_time'

    )

    serializer = RecordSerializer(

        records,

        many=True

    )

    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def district_records(request):

    records = Record.objects.filter(

        record_type__name='DISTRICT'

    ).order_by(

        'new_time'

    )

    serializer = RecordSerializer(

        records,

        many=True

    )

    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def promote_swimmers(request, meet_id):
    try:

        meet = Meet.objects.get(id=meet_id)

    except Meet.DoesNotExist:

        return Response(
            {'error': 'Meet not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    top_count = (
            meet.qualifying_position
            or 3
    )

    results = (

        FinalResult.objects

        .filter(
            final__event__meet_id=meet_id,
            status='swam'
        )

        .select_related(
            'swimmer',
            'final',
            'final__event',
            'final__event__meet'
        )

        .order_by(
            'final__event',
            'finish_time'
        )

    )

    grouped_results = defaultdict(list)

    for result in results:

        grouped_results[
            result.final.event_id
        ].append(result)

    promoted = []

    for event_id, event_results in grouped_results.items():

        top_swimmers = event_results[:top_count]

        for rank, result in enumerate(
                top_swimmers,
                start=1
        ):

            meet = result.final.event.meet
            current_level = (
                meet.level.name.upper()
            )
            if current_level == 'DISTRICT':
                qualified_to = 'STATE'
            elif current_level == 'STATE':
                qualified_to = 'NATIONAL'
            else:
                continue
            already_exists = Qualification.objects.filter(
                swimmer=result.swimmer,
                event=result.final.event,
                qualified_to=qualified_to
            ).exists()
            if already_exists:
                continue

            Qualification.objects.create(
                swimmer=result.swimmer,
                meet=meet,
                event=result.final.event,
                qualified_from=current_level,
                qualified_to=qualified_to,
                rank=rank,
                qualification_time=result.finish_time
            )
            from users.tasks import send_qualification_email
            send_qualification_email(

                result.swimmer.email,

                result.swimmer.username,

                qualified_to

            )
            promoted.append({
                "swimmer":
                    result.swimmer.username,
                "event":
                    result.final.event.name,
                "rank":
                    rank,
                "qualified_to":
                    qualified_to
            })

    return Response({
        "message":

        "Promotion completed",

        "qualified_swimmers":
            promoted
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def state_qualifiers(request):

    qualifiers = (
        Qualification.objects
        .filter(
            qualified_to='STATE'
        )
        .select_related(
            'swimmer',
            'event',
            'meet'
        )
    )

    response = []

    for q in qualifiers:

        response.append({

            'swimmer':
                q.swimmer.username,

            'event':
                q.event.name,

            'qualified_from':
                q.meet.name,

            'rank':
                q.rank,

            'time':
                str(q.qualification_time)

        })

    return Response(response)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def national_qualifiers(request):

    qualifiers = (
        Qualification.objects
        .filter(
            qualified_to='NATIONAL'
        )
        .select_related(
            'swimmer',
            'event',
            'meet'
        )
    )

    response = []

    for q in qualifiers:

        response.append({

            'swimmer':
                q.swimmer.username,

            'event':
                q.event.name,

            'qualified_from':
                q.meet.name,

            'rank':
                q.rank,

            'time':
                str(q.qualification_time)

        })

    return Response(response)

@api_view(['GET'])
@permission_classes([AllowAny])
def top_swimmers(request):
    leaderboard = (
        ChampionshipPoint.objects
        .values(
            'swimmer__username'
        )
        .annotate(
            total_points=Sum('points')
        )
        .order_by(
            '-total_points'
        )
    )
    return Response(
        leaderboard
    )

@api_view(['GET'])
@permission_classes([AllowAny])
def top_events(request):
    events = (
        Championship.objects
        .values(
            'event__name'
        )
        .annotate(
            total_entries=Count('id')
        )
        .order_by(
            '-total_entries'
        )
    )
    return Response(
        events
    )

@api_view(['GET'])
@permission_classes([AllowAny])
def statistics_dashboard(request):
    return Response({
        'total_swimmers':
            AppUser.objects.filter(
                role__name='swimmer'
            ).count(),
        'total_meets':
            Meet.objects.count(),
        'total_results':
            FinalResult.objects.count(),
        'total_records':
            Record.objects.count(),
        'total_points_awarded':
            ChampionshipPoint.objects.aggregate(
                total=Sum('points')
            )['total'] or 0
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def team_rankings(request):
    rankings = (
        ChampionshipPoint.objects
        .values(
            'swimmer__association__name'
        )
        .annotate(
            total_points=Sum('points')
        )
        .order_by(
            '-total_points'
        )
    )
    return Response(
        rankings
    )

@api_view(['GET'])
@permission_classes([AllowAny])
def medal_table(request):

    swimmers = AppUser.objects.all()

    response = []

    for swimmer in swimmers:

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

        total = gold + silver + bronze

        if total > 0:

            response.append({

                'swimmer':
                    swimmer.username,

                'gold':
                    gold,

                'silver':
                    silver,

                'bronze':
                    bronze,

                'total':
                    total

            })

    response.sort(
        key=lambda x:
        (
            -x['gold'],
            -x['silver'],
            -x['bronze']
        )
    )

    return Response(
        response
    )




