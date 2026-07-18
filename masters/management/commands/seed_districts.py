from django.core.management.base import BaseCommand
from masters.models import (
    StateMaster,
    DistrictMaster
)

district_data = {
    1: [  # Andaman and Nicobar Islands

        "North and Middle Andaman",
        "South Andaman",
        "Nicobar"

    ],

    2: [  # Andhra Pradesh

        "Visakhapatnam",
        "Vijayawada",
        "Guntur",
        "Tirupati",
        "Kurnool",
        "Nellore",
        "Rajahmundry",
        "Anantapur"

    ],

    3: [  # Arunachal Pradesh

        "Itanagar",
        "Tawang",
        "Pasighat",
        "Ziro",
        "Bomdila",
        "Roing",
        "Tezu",
        "Changlang"

    ],

    4: [  # Assam

        "Guwahati",
        "Dibrugarh",
        "Silchar",
        "Jorhat",
        "Nagaon",
        "Tezpur",
        "Tinsukia",
        "Bongaigaon"

    ],

    5: [  # Bihar

        "Patna",
        "Gaya",
        "Muzaffarpur",
        "Bhagalpur",
        "Darbhanga",
        "Purnia",
        "Ara",
        "Begusarai"

    ],

    6: [  # Chhattisgarh

        "Raipur",
        "Bilaspur",
        "Durg",
        "Korba",
        "Rajnandgaon",
        "Jagdalpur",
        "Ambikapur",
        "Raigarh"

    ],

    7: [  # Chandigarh

        "Chandigarh"

    ],

    8: [  # Dadra and Nagar Haveli and Daman and Diu

        "Daman",
        "Diu",
        "Silvassa"

    ],

    9: [  # Delhi

        "Delhi"

    ],

    10: [  # Goa

        "Panaji",
        "Margao",
        "Vasco da Gama",
        "Mapusa",
        "Ponda",
        "Bicholim",
        "Quepem",
        "Canacona"

    ],

    11: [  # Gujarat

        "Ahmedabad",
        "Surat",
        "Vadodara",
        "Rajkot",
        "Bhavnagar",
        "Jamnagar",
        "Junagadh",
        "Gandhinagar"

    ],

    12: [  # Haryana

        "Gurugram",
        "Faridabad",
        "Panipat",
        "Hisar",
        "Rohtak",
        "Ambala",
        "Karnal",
        "Sonipat"

    ],

    13: [  # Himachal Pradesh

        "Shimla",
        "Dharamshala",
        "Mandi",
        "Solan",
        "Kullu",
        "Hamirpur",
        "Bilaspur",
        "Una"

    ],

    14: [  # Jammu and Kashmir

        "Srinagar",
        "Jammu",
        "Anantnag",
        "Baramulla",
        "Pulwama",
        "Kupwara",
        "Kathua",
        "Udhampur"

    ],

    15: [  # Jharkhand

        "Ranchi",
        "Jamshedpur",
        "Dhanbad",
        "Bokaro",
        "Hazaribagh",
        "Deoghar",
        "Giridih",
        "Ramgarh"

    ],

    16: [  # Karnataka

        "Bengaluru",
        "Mysuru",
        "Mangaluru",
        "Hubballi",
        "Belagavi",
        "Ballari",
        "Shivamogga",
        "Tumakuru"

    ],

    17: [  # Kerala

        "Thiruvananthapuram",
        "Kochi",
        "Kozhikode",
        "Thrissur",
        "Kannur",
        "Kollam",
        "Alappuzha",
        "Palakkad"

    ],

    18: [  # Ladakh

        "Leh",
        "Kargil"

    ],

    19: [  # Lakshadweep

        "Kavaratti"

    ],

    20: [  # Madhya Pradesh

        "Bhopal",
        "Indore",
        "Jabalpur",
        "Gwalior",
        "Ujjain",
        "Sagar",
        "Rewa",
        "Satna"

    ],

    21: [  # Maharashtra

        "Mumbai",
        "Pune",
        "Nagpur",
        "Nashik",
        "Aurangabad",
        "Kolhapur",
        "Solapur",
        "Thane"

    ],

    22: [  # Manipur

        "Imphal",
        "Bishnupur",
        "Thoubal",
        "Churachandpur",
        "Ukhrul",
        "Senapati",
        "Tamenglong",
        "Kakching"

    ],

    23: [  # Meghalaya

        "Shillong",
        "Tura",
        "Jowai",
        "Nongpoh",
        "Baghmara",
        "Williamnagar",
        "Mawkyrwat",
        "Resubelpara"

    ],

    24: [  # Mizoram

        "Aizawl",
        "Lunglei",
        "Champhai",
        "Kolasib",
        "Serchhip",
        "Saiha",
        "Lawngtlai",
        "Mamit"

    ],

    25: [  # Nagaland

        "Kohima",
        "Dimapur",
        "Mokokchung",
        "Tuensang",
        "Wokha",
        "Zunheboto",
        "Phek",
        "Mon"

    ],

    26: [  # Odisha

        "Bhubaneswar",
        "Cuttack",
        "Rourkela",
        "Sambalpur",
        "Berhampur",
        "Balasore",
        "Puri",
        "Jharsuguda"

    ],

    27: [  # Puducherry

        "Puducherry",
        "Karaikal",
        "Mahe",
        "Yanam"

    ],

    28: [  # Punjab

        "Ludhiana",
        "Amritsar",
        "Jalandhar",
        "Patiala",
        "Bathinda",
        "Mohali",
        "Pathankot",
        "Moga"

    ],

    29: [  # Rajasthan

        "Jaipur",
        "Jodhpur",
        "Udaipur",
        "Ajmer",
        "Kota",
        "Bikaner",
        "Alwar",
        "Sikar"

    ],

    30: [  # Sikkim

        "Gangtok",
        "Namchi",
        "Gyalshing",
        "Mangan"

    ],

    31: [  # Tamil Nadu

        "Chennai",
        "Coimbatore",
        "Madurai",
        "Salem",
        "Tiruchirappalli",
        "Erode",
        "Vellore",
        "Thanjavur"

    ],

    32: [  # Telangana

        "Hyderabad",
        "Warangal",
        "Karimnagar",
        "Nizamabad",
        "Khammam",
        "Mahabubnagar",
        "Adilabad",
        "Siddipet"

    ],

    33: [  # Tripura

        "Agartala",
        "Dharmanagar",
        "Udaipur",
        "Kailashahar",
        "Belonia",
        "Khowai",
        "Ambassa",
        "Sabroom"

    ],

    34: [  # Uttar Pradesh

        "Lucknow",
        "Kanpur",
        "Agra",
        "Varanasi",
        "Prayagraj",
        "Meerut",
        "Ghaziabad",
        "Noida"

    ],

    35: [  # Uttarakhand

        "Dehradun",
        "Haridwar",
        "Haldwani",
        "Roorkee",
        "Rudrapur",
        "Nainital",
        "Almora",
        "Pithoragarh"

    ],

    36: [  # West Bengal

        "Kolkata",
        "Howrah",
        "Durgapur",
        "Siliguri",
        "Asansol",
        "Kharagpur",
        "Malda",
        "Bardhaman"

    ],

}
for state_id, districts in district_data.items():

    state = StateMaster.objects.get(
        id=state_id
    )


    class Command(BaseCommand):
        help = "Seed Districts"

        def handle(self, *args, **kwargs):

            for state_id, districts in district_data.items():

                try:
                    state = StateMaster.objects.get(id=state_id)
                except StateMaster.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(
                            f"State ID {state_id} not found."
                        )
                    )
                    continue

                for district_name in districts:
                    DistrictMaster.objects.get_or_create(
                        district_name=district_name,
                        state=state,
                        defaults={
                            "district_code": (
                                                     f"{state_id}_"
                                                     + district_name.upper().replace(" ", "_")
                                             )[:50]
                        }
                    )

            self.stdout.write(
                self.style.SUCCESS("Districts seeded successfully.")
            )
