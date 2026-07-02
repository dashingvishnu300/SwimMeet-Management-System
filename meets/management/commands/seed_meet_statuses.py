from django.core.management.base import BaseCommand

from meets.models import MeetStatus


class Command(BaseCommand):

    help = "Seed Meet Statuses"

    STATUSES = [
        "UPCOMING",
        "REGISTRATION_OPEN",
        "REGISTRATION_CLOSED",
        "ONGOING",
        "COMPLETED",
        "CANCELLED"
    ]

    def handle(self, *args, **kwargs):

        for status in self.STATUSES:

            MeetStatus.objects.get_or_create(
                name=status
            )

        self.stdout.write(
            self.style.SUCCESS(
                "Meet statuses seeded successfully."
            )
        )