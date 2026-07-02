from rest_framework import serializers
from .models import Championship, ChampionshipPoint, Record, RecordType


class RecordTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecordType
        fields = ['id', 'name']


class ChampionshipSerializer(serializers.ModelSerializer):
    swimmer_name = serializers.CharField(
        source='swimmer.username', read_only=True
    )
    event_name = serializers.CharField(
        source='event.name', read_only=True
    )
    meet_name = serializers.CharField(
        source='meet.name', read_only=True
    )

    class Meta:
        model = Championship
        fields = [
            'id', 'swimmer', 'swimmer_name',
            'event', 'event_name',
            'meet', 'meet_name',
            'total_points', 'placement'
        ]


class ChampionshipPointSerializer(serializers.ModelSerializer):
    swimmer_name = serializers.CharField(
        source='swimmer.username', read_only=True
    )
    meet_name = serializers.CharField(
        source='meet.name', read_only=True
    )

    class Meta:
        model = ChampionshipPoint
        fields = [
            'id', 'meet', 'meet_name',
            'swimmer', 'swimmer_name', 'points'
        ]


class RecordSerializer(serializers.ModelSerializer):
    swimmer_name = serializers.CharField(
        source='swimmer.username', read_only=True
    )
    event_name = serializers.CharField(
        source='event_list.__str__', read_only=True
    )
    record_type_name = serializers.CharField(
        source='record_type.name', read_only=True
    )

    class Meta:
        model = Record
        fields = [
            'id', 'swimmer', 'swimmer_name',
            'event_list', 'event_name',
            'record_type', 'record_type_name',
            'old_time', 'new_time', 'record_date',
            'meet'
        ]