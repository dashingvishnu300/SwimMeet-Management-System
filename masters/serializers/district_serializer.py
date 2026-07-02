from rest_framework import serializers
from masters.models import DistrictMaster


class DistrictSerializer(serializers.ModelSerializer):

    class Meta:
        model = DistrictMaster
        fields = [
            'id',
            'district_name'
        ]