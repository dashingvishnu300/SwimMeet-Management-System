from django.core.management.base import BaseCommand

from meets.models import MeetLevel


class Command(BaseCommand):

    help = "Seed Meet Levels"

    LEVELS = [
        "DISTRICT",
        "STATE",
        "NATIONAL"
    ]

    def handle(self, *args, **kwargs):

        for level in self.LEVELS:

            MeetLevel.objects.get_or_create(
                name=level
            )

        self.stdout.write(
            self.style.SUCCESS(
                "Meet levels seeded successfully."
            )
        )