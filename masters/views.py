from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

from masters.models import (
    StateMaster,
    DistrictMaster,
    Association
)

from masters.serializers import (
    StateSerializer,
    DistrictSerializer,
    AssociationSerializer
)


@api_view(['GET'])
def state_list(request):

    states = StateMaster.objects.filter(
        is_active=True
    )

    serializer = StateSerializer(
        states,
        many=True
    )

    return Response(serializer.data)


@api_view(['GET'])
def district_list(
    request,
    state_id
):

    districts = DistrictMaster.objects.filter(
        state_id=state_id,
        is_active=True
    )

    serializer = DistrictSerializer(
        districts,
        many=True
    )

    return Response(serializer.data)


@api_view(['GET'])
def association_list(
    request,
    district_id
):

    associations = Association.objects.filter(
        district_id=district_id,
        is_active=True
    )

    serializer = AssociationSerializer(
        associations,
        many=True
    )

    return Response(serializer.data)