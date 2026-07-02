from rest_framework import serializers
from masters.models import Association


class AssociationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Association
        fields = [
            'id',
            'association_name'
        ]