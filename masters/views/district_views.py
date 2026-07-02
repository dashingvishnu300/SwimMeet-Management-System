from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view
from rest_framework.response import Response

from masters.models import DistrictMaster
from masters.serializers.district_serializer import DistrictSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def district_list(request, state_id):

    districts = DistrictMaster.objects.filter(
        state_id=state_id,
        is_active=True
    )

    serializer = DistrictSerializer(
        districts,
        many=True
    )

    return Response(serializer.data)