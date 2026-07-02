from rest_framework import serializers
from .models import Registration, SwimmerBestTime
from users.serializers import UserProfileSerializer
from events.serializers import EventDetailSerializer
from users.utils import get_age_group
from events.models import EventDetail

class SwimmerBestTimeSerializer(serializers.ModelSerializer):
    event_name = serializers.CharField(
        source='event_list.__str__', read_only=True
    )

    class Meta:
        model = SwimmerBestTime
        fields = ['id', 'event_list', 'event_name', 'best_time', 'recorded_at']
        read_only_fields = ['id', 'recorded_at']


class RegistrationSerializer(serializers.ModelSerializer):
    swimmer_name = serializers.CharField(
        source='swimmer.username', read_only=True
    )
    nominated_by_name = serializers.CharField(
        source='nominated_by.username', read_only=True
    )
    event_name = serializers.CharField(
        source='event.name', read_only=True
    )
    meet_name = serializers.CharField(
        source='meet.name', read_only=True
    )

    class Meta:
        model = Registration
        fields = [
            'id', 'meet', 'meet_name',
            'swimmer', 'swimmer_name',
            'nominated_by', 'nominated_by_name',
            'event', 'event_name',
            'seed_time', 'registered_at',
            'updated_at', 'sent_back', 'recall'
        ]
        read_only_fields = [
            'id', 'registered_at', 'updated_at',
            'sent_back', 'recall'
        ]


class CreateRegistrationSerializer(serializers.Serializer):
    swimmer_id = serializers.IntegerField()
    event_id = serializers.IntegerField()
    seed_time = serializers.DurationField(
        required=True,
        help_text="Format: HH:MM:SS.ffffff e.g. 00:01:23.450000"
    )

    def validate(self, data):

        request = self.context["request"]

        meet = self.context["meet"]

        from users.models import AppUser

        swimmer = AppUser.objects.get(
            id=data["swimmer_id"]
        )

        event = EventDetail.objects.get(
            id=data["event_id"]
        )

        swimmer_age_group = get_age_group(
            swimmer.date_of_birth,
            meet.start_date
        )

        event_age_group = (
            event.event_list.age_group.label.lower()
        )

        base_event_age_group = event_age_group.split("_g")[0]

        if swimmer_age_group != base_event_age_group:
            raise serializers.ValidationError(

                f"{swimmer_age_group.replace('_', ' ').title()} swimmers "
                f"may register only in their own age-group events."

            )

        meet_level = meet.level.name.upper()

        organizer = meet.created_by

        # DISTRICT MEET
        if meet_level == "DISTRICT":

            if (
                    swimmer.district_master
                    !=
                    organizer.district_master
            ):
                raise serializers.ValidationError(
                    "Only swimmers from this district may participate."
                )

        # STATE MEET
        elif meet_level == "STATE":

            if (
                    swimmer.state_master
                    !=
                    organizer.state_master
            ):
                raise serializers.ValidationError(
                    "Only swimmers from this state may participate."
                )

        # NATIONAL MEET
        elif meet_level == "NATIONAL":

            pass

        if not data.get("seed_time"):
            raise serializers.ValidationError(
                {
                    "seed_time":
                        "Seed time is required for event registration."
                }
            )

        return data