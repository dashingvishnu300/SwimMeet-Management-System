from rest_framework import serializers
from .models import EventList, EventDetail
from meets.serializers import GenderCategorySerializer, AgeGroupSerializer


class EventListSerializer(serializers.ModelSerializer):
    gender_name = serializers.CharField(source='gender.name', read_only=True)
    age_group_label = serializers.CharField(source='age_group.label', read_only=True)

    class Meta:
        model = EventList
        fields = [
            'id', 'distance_m', 'stroke',
            'gender', 'gender_name',
            'age_group', 'age_group_label',
            'is_relay', 'is_marathon'
        ]


class EventDetailSerializer(serializers.ModelSerializer):
    gender_name = serializers.CharField(
        source='event_list.gender.name', read_only=True
    )
    age_group_label = serializers.CharField(
        source='event_list.age_group.label', read_only=True
    )
    distance_m = serializers.IntegerField(
        source='event_list.distance_m', read_only=True
    )
    stroke = serializers.CharField(
        source='event_list.stroke', read_only=True
    )
    is_relay = serializers.BooleanField(
        source='event_list.is_relay', read_only=True
    )

    class Meta:
        model = EventDetail
        fields = [
            'id', 'meet', 'event_list', 'name',
            'distance_m', 'stroke', 'gender_name',
            'age_group_label', 'is_relay'
        ]
        read_only_fields = ['id', 'name']


class AssignEventSerializer(serializers.Serializer):
    """Assign multiple events from master list to a meet"""
    event_list_ids = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="List of event_list IDs to assign to this meet"
    )