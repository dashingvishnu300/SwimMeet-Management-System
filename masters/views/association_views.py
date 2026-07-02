from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view
from rest_framework.response import Response

from masters.models import Association
from masters.serializers.association_serializer import AssociationSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def association_list(request, district_id):

    associations = Association.objects.filter(
        district_id=district_id,
        is_active=True
    )

    serializer = AssociationSerializer(
        associations,
        many=True
    )

    return Response(serializer.data)
@api_view(['GET'])
@permission_classes([AllowAny])
def state_association_list(request, state_id):

    associations = Association.objects.filter(
        state_id=state_id,
        association_type='STATE',
        is_active=True
    )

    serializer = AssociationSerializer(
        associations,
        many=True
    )

    return Response(serializer.data)