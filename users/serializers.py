from rest_framework import serializers
from .models import AppUser, Role
from masters.models import (
    Association,
    StateMaster,
    DistrictMaster
)
from users.services.temporary_password_service import (
    TemporaryPasswordService
)

from users.services.email_service import (
    EmailService
)
class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=False
    )
    role_name = serializers.CharField(write_only=True)
    association = serializers.PrimaryKeyRelatedField(
        queryset=Association.objects.all(),
        required=False,
        allow_null=True
    )
    state_master = serializers.PrimaryKeyRelatedField(
        queryset=StateMaster.objects.all(),
        required=False,
        allow_null=True
    )

    district_master = serializers.PrimaryKeyRelatedField(
        queryset=DistrictMaster.objects.all(),
        required=False,
        allow_null=True
    )

    association_name = serializers.CharField(
        required=False,
        allow_blank=True
    )

    association_type = serializers.CharField(
        required=False,
        allow_blank=True
    )

    contact_information = serializers.CharField(
        required=False,
        allow_blank=True
    )

    organizer_document = serializers.FileField(
        required=False,
        allow_null=True
    )

    class Meta:
        model = AppUser
        fields = [
            'id',

'first_name',
'middle_name',
'last_name',

'username',

'email',
'phone_number',
            'password', 'role_name', 'date_of_birth','gender',
            'address_line1', 'address_line2',
            'city','state','postal_code','association_name','association_type',
            'contact_information','organizer_document','association','state_master',
             'district_master','coach_level',
'organizer_level',
]

    def validate(self, data):

        if not data.get('email') and not data.get('phone_number'):
            raise serializers.ValidationError(
                "Either email or phone number is required"
            )

        role_name = data.get("role_name")

        if role_name == "swimmer":
            if not data.get("first_name"):
                raise serializers.ValidationError(
                    "First name is required."
                )

            if not data.get("last_name"):
                raise serializers.ValidationError(
                    "Last name is required."
                )

            if not data.get("date_of_birth"):
                raise serializers.ValidationError(
                    "Date of birth is required for swimmers."
                )

            if not data.get("gender"):
                raise serializers.ValidationError(
                    "Gender is required for swimmers."
                )

            if not data.get("state_master"):
                raise serializers.ValidationError(
                    "State is required for swimmers."
                )

            if not data.get("district_master"):
                raise serializers.ValidationError(
                    "District is required for swimmers."
                )

            if not data.get("association"):
                raise serializers.ValidationError(
                    "Association is required for swimmers."
                )


        elif role_name == "coach":

            coach_level = data.get("coach_level")

            if coach_level == "district":

                if not data.get("state_master"):
                    raise serializers.ValidationError(

                        "State is required for district coach."

                    )

                if not data.get("district_master"):
                    raise serializers.ValidationError(

                        "District is required for district coach."

                    )

                if not data.get("association"):
                    raise serializers.ValidationError(

                        "District association is required."

                    )


            elif coach_level == "state":

                if not data.get("state_master"):
                    raise serializers.ValidationError(

                        "State is required for state coach."

                    )

                if not data.get("association"):
                    raise serializers.ValidationError(

                        "State association is required."

                    )


            elif coach_level == "national":

                pass


        elif role_name == "organizer":

            organizer_level = data.get("organizer_level")

            if organizer_level == "district":

                if not data.get("state_master"):
                    raise serializers.ValidationError(

                        "State is required."

                    )

                if not data.get("district_master"):
                    raise serializers.ValidationError(

                        "District is required."

                    )

                if not data.get("association"):
                    raise serializers.ValidationError(

                        "District association is required."

                    )


            elif organizer_level == "state":

                if not data.get("state_master"):
                    raise serializers.ValidationError(

                        "State is required."

                    )

                if not data.get("association"):
                    raise serializers.ValidationError(

                        "State association is required."

                    )


            elif organizer_level == "national":

                pass

            if not data.get("organizer_document"):
                raise serializers.ValidationError(

                    "Organizer document is required."

                )

        return data

    def create(self, validated_data):
        role_name = validated_data.pop('role_name')
        validated_data.pop(
            'password',
            None
        )
        coach_level = validated_data.pop(
            'coach_level',
            None
        )

        organizer_level = validated_data.pop(
            'organizer_level',
            None
        )

        temporary_password = (
            TemporaryPasswordService.generate_password()
        )

        association_name = validated_data.pop(
            'association_name',
            None
        )

        association_type = validated_data.pop(
            'association_type',
            None
        )

        contact_information = validated_data.pop(
            'contact_information',
            None
        )

        organizer_document = validated_data.pop(
            'organizer_document',
            None
        )

        try:
            role = Role.objects.get(name=role_name)
        except Role.DoesNotExist:
            raise serializers.ValidationError(
                f"Role '{role_name}' does not exist"
            )

        first_name = validated_data.get(
            'first_name',
            ''
        )

        last_name = validated_data.get(
            'last_name',
            ''
        )

        username = (
                first_name.lower()
                +
                last_name.lower()
        )

        validated_data['username'] = username

        user = AppUser.objects.create_user(
            password=temporary_password,
            role=role,
            coach_level=coach_level,

            organizer_level=organizer_level,

            association_name=association_name,
            association_type=association_type,
            contact_information=contact_information,
            organizer_document=organizer_document,

            **validated_data
        )
        if role.name != "organizer":
            user.must_change_password = True

            user.temporary_password_sent = True

            user.save()

            EmailService.send_temporary_password(
                user,
               temporary_password
            )
        if role.name != "organizer":
            user.must_change_password = True

            user.temporary_password_sent = True

            user.save()

            print(
                "TEMP PASSWORD:",
                temporary_password
            )

        return user


class UserProfileSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)

    association_name_display = serializers.CharField(
        source='association.association_name',
        read_only=True
    )

    district_name = serializers.CharField(
        source='district_master.district_name',
        read_only=True
    )

    state_name = serializers.CharField(
        source='state_master.state_name',
        read_only=True
    )

    class Meta:
        model = AppUser
        fields = [
            'id',

            'first_name',
            'middle_name',
            'last_name',

            'username',

            'email',
            'phone_number',

            'role',

            'date_of_birth',
            'gender',

            'address_line1',
            'address_line2',

            'city',
            'state',
            'postal_code',

            'created_at',

            'association',
            'state_master',
            'district_master',

            'association_name_display',
            'district_name',
            'state_name',

            'coach_level',
            'organizer_level',

            # Organizer fields
            'association_name',
            'association_type',
            'contact_information',
            'organizer_document',
            'organizer_status',
            'approved_at',
            'rejection_reason',
        ]
        read_only_fields = ['id', 'created_at']