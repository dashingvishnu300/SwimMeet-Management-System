from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Seed initial lookup data'

    def handle(self, *args, **kwargs):
        from meets.models import MeetLevel, MeetStatus, GenderCategory, AgeGroup, DocumentType
        from users.models import Role

        # Roles
        for role in ['organizer', 'coach', 'swimmer']:
            Role.objects.get_or_create(name=role)
        self.stdout.write('✅ Roles seeded')

        # Meet Levels
        for level in ['district', 'state', 'national']:
            MeetLevel.objects.get_or_create(name=level)
        self.stdout.write('✅ Meet levels seeded')

        # Meet Statuses
        statuses = [
            'draft', 'scheduled', 'registration_open',
            'registration_closed', 'in_progress',
            'completed', 'cancelled', 'rescheduled'
        ]
        for status in statuses:
            MeetStatus.objects.get_or_create(name=status)
        self.stdout.write('✅ Meet statuses seeded')

        # Gender Categories
        for gender in ['men', 'women', 'boys', 'girls', 'mixed']:
            GenderCategory.objects.get_or_create(name=gender)
        self.stdout.write('✅ Gender categories seeded')

        # Age Groups
        age_groups = [
            {'label': 'sub_junior', 'min_age': 0, 'max_age': 11},
            {'label': 'junior_g1', 'min_age': 12, 'max_age': 14},
            {'label': 'junior_g2', 'min_age': 14, 'max_age': 17},
            {'label': 'senior', 'min_age': 18, 'max_age': 99},
        ]
        for ag in age_groups:
            AgeGroup.objects.get_or_create(
                label=ag['label'],
                defaults={
                    'min_age': ag['min_age'],
                    'max_age': ag['max_age']
                }
            )
        self.stdout.write('✅ Age groups seeded')

        # Document Types
        for doc in ['schedule', 'rules', 'heat_list', 'results']:
            DocumentType.objects.get_or_create(name=doc)
        self.stdout.write('✅ Document types seeded')

        self.stdout.write(self.style.SUCCESS(
            '\n🎉 All lookup data seeded successfully!'
        ))