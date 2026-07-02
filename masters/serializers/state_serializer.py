from rest_framework import serializers
from masters.models import StateMaster


class StateSerializer(serializers.ModelSerializer):

    class Meta:
        model = StateMaster
        fields = [
            'id',
            'state_name'
        ]