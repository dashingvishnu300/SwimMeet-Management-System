from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view
from rest_framework.response import Response
from masters.models import StateMaster
from masters.serializers.state_serializer import StateSerializer

@api_view(['GET'])
@permission_classes([AllowAny])

def state_list(request):

    states = StateMaster.objects.filter(
        is_active=True
    )

    serializer = StateSerializer(
        states,
        many=True
    )

    return Response(serializer.data)