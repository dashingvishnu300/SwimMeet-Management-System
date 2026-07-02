from rest_framework import serializers
from .models import Meet, MeetLevel, MeetStatus, GenderCategory, AgeGroup, MeetDocument, DocumentType
from users.serializers import UserProfileSerializer


class MeetLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeetLevel
        fields = ['id', 'name']


class MeetStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeetStatus
        fields = ['id', 'name']


class GenderCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GenderCategory
        fields = ['id', 'name']


class AgeGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgeGroup
        fields = ['id', 'label', 'min_age', 'max_age']


class MeetDocumentSerializer(serializers.ModelSerializer):
    type_name = serializers.CharField(source='type.name', read_only=True)
    uploaded_by_name = serializers.CharField(
        source='uploaded_by.username', read_only=True
    )

    class Meta:
        model = MeetDocument
        fields = [
            'id', 'type', 'type_name', 'file_path',
            'uploaded_by_name', 'uploaded_at'
        ]


class MeetSerializer(serializers.ModelSerializer):
    level_name = serializers.CharField(source='level.name', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    gender_name = serializers.CharField(source='gender.name', read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.username', read_only=True
    )
    documents = MeetDocumentSerializer(
        source='meetdocument_set', many=True, read_only=True
    )

    class Meta:
        model = Meet
        fields = [
            'id', 'name', 'level', 'level_name',
            'location', 'start_date', 'end_date',
            'gender', 'gender_name', 'status', 'status_name',
            'pool_length', 'lanes',
            'registration_start_date', 'registration_end_date',
            'registration_open', 'created_by_name',
            'created_at', 'updated_at', 'documents','max_events_per_swimmer',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CreateMeetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meet
        fields = [
    'name',
    'level',
    'location',
    'start_date',
    'end_date',
    'gender',
    'pool_length',
    'lanes',
    'registration_start_date',
    'registration_end_date',
    'max_events_per_swimmer',
]

    def validate(self, data):

        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError(
                "End date must be after start date"
            )

        request = self.context.get("request")

        if request:

            organizer_level = (
                    request.user.organizer_level or ""
            ).upper()

            meet_level = data["level"].name.upper()

            if organizer_level == "DISTRICT":

                if meet_level != "DISTRICT":
                    raise serializers.ValidationError(
                        "District organizers can create only District meets."
                    )

            elif organizer_level == "STATE":

                if meet_level != "STATE":
                    raise serializers.ValidationError(
                        "State organizers can create only State meets."
                    )

            elif organizer_level == "NATIONAL":

                if meet_level != "NATIONAL":
                    raise serializers.ValidationError(
                        "National organizers can create only National meets."
                    )

        return data

    def create(self, validated_data):

        request = self.context["request"]

        user = request.user

        meet = Meet.objects.create(
            association=user.association,
            **validated_data
        )

        return meet