from django.core.management.base import BaseCommand

from masters.models import (
    DistrictMaster,
    Association
)


class Command(BaseCommand):
    help = "Seed District Associations"

    def handle(self, *args, **kwargs):

        districts = DistrictMaster.objects.all()

        for district in districts:

            association_name = (
                f"{district.district_name} District Swimming Association"
            )

            association_code = (
                f"DIST_{district.id}"
            )

            Association.objects.get_or_create(

                association_name=association_name,

                defaults={
                    "association_code": association_code,
                    "association_type": Association.DISTRICT,
                    "district": district,
                    "state": district.state,
                    "is_active": True,
                }

            )

        self.stdout.write(
            self.style.SUCCESS(
                "District associations seeded successfully."
            )
        )