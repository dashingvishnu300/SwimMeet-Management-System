from rest_framework import serializers
from .models import HeatList, HeatSwimmer, HeatResult


class HeatSwimmerSerializer(serializers.ModelSerializer):
    swimmer_name = serializers.CharField(
        source='swimmer.username', read_only=True
    )

    class Meta:
        model = HeatSwimmer
        fields = [
            'id', 'heat', 'swimmer', 'swimmer_name',
            'lane_number', 'seed_time'
        ]


class HeatResultSerializer(serializers.ModelSerializer):
    swimmer_name = serializers.CharField(
        source='swimmer.username', read_only=True
    )

    class Meta:
        model = HeatResult
        fields = [
            'id', 'heat', 'swimmer', 'swimmer_name',
            'finish_time', 'status'
        ]


class HeatListSerializer(serializers.ModelSerializer):
    swimmers = HeatSwimmerSerializer(many=True, read_only=True)
    results = HeatResultSerializer(many=True, read_only=True)
    event_name = serializers.CharField(
        source='event.name', read_only=True
    )

    class Meta:
        model = HeatList
        fields = [
            'id', 'event', 'event_name',
            'heat_number', 'heat_status',
            'swimmers', 'results'
        ]