from django.utils import timezone

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from users.models import AppUser
from .serializers import OrganizerApprovalSerializer


@api_view(['GET'])
def pending_organizers(request):

    organizers = AppUser.objects.filter(
        organizer_status='pending'
    )

    serializer = OrganizerApprovalSerializer(
        organizers,
        many=True
    )

    return Response(serializer.data)


@api_view(['GET'])
def approved_organizers(request):

    organizers = AppUser.objects.filter(
        organizer_status='approved'
    )

    serializer = OrganizerApprovalSerializer(
        organizers,
        many=True
    )

    return Response(serializer.data)


@api_view(['GET'])
def rejected_organizers(request):

    organizers = AppUser.objects.filter(
        organizer_status='rejected'
    )

    serializer = OrganizerApprovalSerializer(
        organizers,
        many=True
    )

    return Response(serializer.data)


@api_view(['POST'])
def approve_organizer(
        request,
        pk
):

    try:

        organizer = AppUser.objects.get(
            pk=pk
        )

    except AppUser.DoesNotExist:

        return Response(
            {
                'error':
                    'Organizer not found'
            },
            status=status.HTTP_404_NOT_FOUND
        )

    organizer.organizer_status = 'approved'

    organizer.approved_at = timezone.now()

    organizer.approved_by = request.user

    organizer.rejection_reason = ''

    organizer.save()

    return Response(
        {
            'message':
                'Organizer approved successfully'
        }
    )


@api_view(['POST'])
def reject_organizer(
        request,
        pk
):

    try:

        organizer = AppUser.objects.get(
            pk=pk
        )

    except AppUser.DoesNotExist:

        return Response(
            {
                'error':
                    'Organizer not found'
            },
            status=status.HTTP_404_NOT_FOUND
        )

    reason = request.data.get(
        'rejection_reason',
        ''
    )

    organizer.organizer_status = 'rejected'

    organizer.rejection_reason = reason

    organizer.save()

    return Response(
        {
            'message':
                'Organizer rejected successfully'
        }
    )