from rest_framework import serializers
from users.models import AppUser


class OrganizerApprovalSerializer(
    serializers.ModelSerializer
):

    approved_by_email = serializers.CharField(
        source='approved_by.email',
        read_only=True
    )

    class Meta:

        model = AppUser

        fields = [

            'id',

            'first_name',

            'middle_name',

            'last_name',

            'email',

            'phone_number',

            'association_name',

            'association_type',

            'contact_information',

            'organizer_document',

            'organizer_status',

            'approved_at',

            'approved_by_email',

            'rejection_reason'

        ]