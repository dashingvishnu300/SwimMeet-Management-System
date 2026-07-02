from rest_framework import serializers
from .models import Final, FinalSwimmer, FinalResult


class FinalSwimmerSerializer(serializers.ModelSerializer):
    swimmer_name = serializers.CharField(
        source='swimmer.username', read_only=True
    )

    class Meta:
        model = FinalSwimmer
        fields = [
            'id', 'final', 'swimmer', 'swimmer_name',
            'lane_number', 'swimmer_type'
        ]


class FinalResultSerializer(serializers.ModelSerializer):
    swimmer_name = serializers.CharField(
        source='swimmer.username', read_only=True
    )

    class Meta:
        model = FinalResult
        fields = [
            'id', 'final', 'swimmer', 'swimmer_name',
            'finish_time', 'status', 'rank', 'medal'
        ]


class FinalSerializer(serializers.ModelSerializer):
    swimmers = FinalSwimmerSerializer(many=True, read_only=True)
    results = FinalResultSerializer(many=True, read_only=True)
    event_name = serializers.CharField(
        source='event.name', read_only=True
    )

    class Meta:
        model = Final
        fields = [
            'id', 'event', 'event_name',
            'final_number', 'swimmers', 'results'
        ]