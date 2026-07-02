from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Seed swimming events master list'

    def handle(self, *args, **kwargs):
        from events.models import EventList
        from meets.models import GenderCategory, AgeGroup

        # Get lookup data
        boys = GenderCategory.objects.get(name='boys')
        girls = GenderCategory.objects.get(name='girls')
        men = GenderCategory.objects.get(name='men')
        women = GenderCategory.objects.get(name='women')
        mixed = GenderCategory.objects.get(name='mixed')

        sub_junior = AgeGroup.objects.get(label='sub_junior')
        junior_g1 = AgeGroup.objects.get(label='junior_g1')
        junior_g2 = AgeGroup.objects.get(label='junior_g2')
        senior = AgeGroup.objects.get(label='senior')

        events = [
            # Sub Junior Boys
            (25, 'Freestyle', boys, sub_junior, False),
            (50, 'Freestyle', boys, sub_junior, False),
            (100, 'Freestyle', boys, sub_junior, False),
            (50, 'Backstroke', boys, sub_junior, False),
            (50, 'Breaststroke', boys, sub_junior, False),
            (50, 'Butterfly', boys, sub_junior, False),
            (100, 'Individual Medley', boys, sub_junior, False),
            (4*25, 'Freestyle Relay', boys, sub_junior, True),
            # Sub Junior Girls
            (25, 'Freestyle', girls, sub_junior, False),
            (50, 'Freestyle', girls, sub_junior, False),
            (100, 'Freestyle', girls, sub_junior, False),
            (50, 'Backstroke', girls, sub_junior, False),
            (50, 'Breaststroke', girls, sub_junior, False),
            (50, 'Butterfly', girls, sub_junior, False),
            (100, 'Individual Medley', girls, sub_junior, False),
            (4*25, 'Freestyle Relay', girls, sub_junior, True),
            # Junior G1 Boys
            (50, 'Freestyle', boys, junior_g1, False),
            (100, 'Freestyle', boys, junior_g1, False),
            (50, 'Backstroke', boys, junior_g1, False),
            (50, 'Breaststroke', boys, junior_g1, False),
            (50, 'Butterfly', boys, junior_g1, False),
            (100, 'Individual Medley', boys, junior_g1, False),
            (4*50, 'Freestyle Relay', boys, junior_g1, True),
            # Junior G1 Girls
            (50, 'Freestyle', girls, junior_g1, False),
            (100, 'Freestyle', girls, junior_g1, False),
            (50, 'Backstroke', girls, junior_g1, False),
            (50, 'Breaststroke', girls, junior_g1, False),
            (50, 'Butterfly', girls, junior_g1, False),
            (100, 'Individual Medley', girls, junior_g1, False),
            (4*50, 'Freestyle Relay', girls, junior_g1, True),
            # Senior Men
            (50, 'Freestyle', men, senior, False),
            (100, 'Freestyle', men, senior, False),
            (200, 'Freestyle', men, senior, False),
            (100, 'Backstroke', men, senior, False),
            (100, 'Breaststroke', men, senior, False),
            (100, 'Butterfly', men, senior, False),
            (200, 'Individual Medley', men, senior, False),
            (4*100, 'Freestyle Relay', men, senior, True),
            # Senior Women
            (50, 'Freestyle', women, senior, False),
            (100, 'Freestyle', women, senior, False),
            (200, 'Freestyle', women, senior, False),
            (100, 'Backstroke', women, senior, False),
            (100, 'Breaststroke', women, senior, False),
            (100, 'Butterfly', women, senior, False),
            (200, 'Individual Medley', women, senior, False),
            (4*100, 'Freestyle Relay', women, senior, True),
        ]

        count = 0
        for distance, stroke, gender, age_group, is_relay in events:
            EventList.objects.get_or_create(
                distance_m=distance,
                stroke=stroke,
                gender=gender,
                age_group=age_group,
                defaults={'is_relay': is_relay, 'is_marathon': False}
            )
            count += 1

        self.stdout.write(self.style.SUCCESS(
            f'🎉 {count} swimming events seeded successfully!'
        ))