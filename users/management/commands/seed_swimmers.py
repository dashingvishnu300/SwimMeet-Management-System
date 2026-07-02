from django.core.management.base import BaseCommand

from users.models import AppUser, Role

from masters.models import (
    StateMaster,
    DistrictMaster,
    Association,
)

from datetime import date

class Command(BaseCommand):

    help = "Seed swimmers for testing"

    def handle(self, *args, **options):
        swimmer_role = Role.objects.get(name="swimmer")

        self.stdout.write(
            self.style.SUCCESS(
                "Starting swimmer seed..."
            )
        )

        districts = {
            "Meerut": {
                "district": DistrictMaster.objects.get(
                    district_name="Meerut"
                ),
                "association": Association.objects.get(
                    district__district_name="Meerut"
                )
            },

            "Agra": {
                "district": DistrictMaster.objects.get(
                    district_name="Agra"
                ),
                "association": Association.objects.get(
                    district__district_name="Agra"
                )
            },

            "Noida": {
                "district": DistrictMaster.objects.get(
                    district_name="Noida"
                ),
                "association": Association.objects.get(
                    district__district_name="Noida"
                )
            },

            "Ghaziabad": {
                "district": DistrictMaster.objects.get(
                    district_name="Ghaziabad"
                ),
                "association": Association.objects.get(
                    district__district_name="Ghaziabad"
                )
            }
        }

        state = StateMaster.objects.get(
            state_name="Uttar Pradesh"
        )
        COUNT_PER_CATEGORY = 3

        categories = [
            {
                "prefix": "sm",
                "gender": "MALE",
                "dob": date(2006, 3, 15),
                "label": "Senior Men",
            },
            {
                "prefix": "sw",
                "gender": "FEMALE",
                "dob": date(2006, 5, 20),
                "label": "Senior Women",
            },
            {
                "prefix": "jb",
                "gender": "MALE",
                "dob": date(2009, 4, 10),
                "label": "Junior Boys",
            },
            {
                "prefix": "jg",
                "gender": "FEMALE",
                "dob": date(2009, 8, 12),
                "label": "Junior Girls",
            },
            {
                "prefix": "sjb",
                "gender": "MALE",
                "dob": date(2012, 2, 15),
                "label": "Sub Junior Boys",
            },
            {
                "prefix": "sjg",
                "gender": "FEMALE",
                "dob": date(2012, 6, 18),
                "label": "Sub Junior Girls",
            },
        ]
        phone_counter = 9000000001

        for district_name, district_data in districts.items():

            self.stdout.write(
                self.style.SUCCESS(f"\nCreating swimmers for {district_name}...")
            )

            for category in categories:

                for i in range(1, COUNT_PER_CATEGORY + 1):

                    username = (
                        f"{district_name.lower()}_"
                        f"{category['prefix']}{i}"
                    )

                    email = f"{username}@test.com"

                    if AppUser.objects.filter(email=email).exists():
                        continue

                    AppUser.objects.create_user(

                        email=email,

                        password="Temp@123",

                        username=username,

                        first_name=username,

                        last_name="Swimmer",

                        phone_number=str(phone_counter),

                        role=swimmer_role,

                        gender=category["gender"],

                        date_of_birth=category["dob"],

                        state_master=state,

                        district_master=district_data["district"],

                        association=district_data["association"],

                        must_change_password=False,

                        temporary_password_sent=False,

                        current_level="DISTRICT",

                        highest_level_reached="DISTRICT",
                    )

                    phone_counter += 1

            self.stdout.write(
                self.style.SUCCESS(
                    f"{district_name} completed."
                )
            )

            total = AppUser.objects.filter(role=swimmer_role).count()

            self.stdout.write(
                self.style.SUCCESS(
                    f"\nTotal swimmers in database: {total}"
                )
            )