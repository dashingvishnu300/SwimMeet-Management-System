from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from users.models import AppUser
from users.services.swimmer_timeline_service import (
    SwimmerTimelineService
)


class SwimmerCareerView(APIView):

    def get(self, request, swimmer_id):

        try:

            swimmer = AppUser.objects.get(
                id=swimmer_id
            )

        except AppUser.DoesNotExist:

            return Response(
                {
                    "error": "Swimmer not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        data = (
            SwimmerTimelineService
            .get_timeline(swimmer)
        )

        return Response(data)