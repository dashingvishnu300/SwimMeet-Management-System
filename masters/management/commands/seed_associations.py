from django.core.management.base import BaseCommand

from masters.models import (
    Association,
    StateMaster
)


class Command(BaseCommand):

    help = "Seed Associations"

    def handle(self, *args, **kwargs):

        # National Association

        Association.objects.get_or_create(
            association_code="SFI",
            defaults={
                "association_name": "Swimming Federation of India",
                "association_type": Association.NATIONAL
            }
        )

        # State Associations

        states = StateMaster.objects.all()

        for state in states:

            Association.objects.get_or_create(
                association_code=f"{state.state_code}SA",
                defaults={
                    "association_name":
                        f"{state.state_name} Swimming Association",

                    "association_type":
                        Association.STATE,

                    "state":
                        state
                }
            )

        self.stdout.write(
            self.style.SUCCESS(
                "Associations seeded successfully."
            )
        )