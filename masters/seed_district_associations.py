from masters.models import (
    DistrictMaster,
    Association
)
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

            "district": district,

            "state": district.state,

            "is_active": True

        }

    )

print(
    "District associations created successfully!"
)