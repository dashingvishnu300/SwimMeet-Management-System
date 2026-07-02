from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Meet, MeetStatus, MeetDocument, DocumentType
from .serializers import MeetSerializer, CreateMeetSerializer, MeetDocumentSerializer
from users.permissions import IsOrganizer
import os
from django.conf import settings


# ── HELPER ──────────────────────────────────────────────
def get_draft_status():
    return MeetStatus.objects.get(name='draft')

def get_status(name):
    return MeetStatus.objects.get(name=name)


# ── LIST & CREATE MEETS ─────────────────────────────────
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def meets(request):
    """
    GET  - List all meets (public)
    POST - Create a new meet (organizer only)
    """
    if request.method == 'GET':

        if (
                request.user.is_authenticated
                and request.user.role.name == 'organizer'
        ):
            all_meets = Meet.objects.filter(
                created_by=request.user
            ).order_by('-created_at')

        else:
            all_meets = Meet.objects.all().order_by('-created_at')

        serializer = MeetSerializer(
            all_meets,
            many=True
        )

        return Response(serializer.data)

    elif request.method == 'POST':
        # Only organizers can create meets
        if (
                not request.user.is_authenticated
                or request.user.role.name != 'organizer'
        ):
            return Response(
                {'error': 'Only organizers can create meets'},
                status=status.HTTP_403_FORBIDDEN
            )

        if request.user.organizer_status != 'approved':
            return Response(
                {
                    'error':
                        'Organizer approval is pending. Please wait for admin approval.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CreateMeetSerializer(
            data=request.data,
            context={
                "request": request
            }
        )
        if serializer.is_valid():
            meet = serializer.save(
                created_by=request.user,
                updated_by=request.user,
                status=get_draft_status(),

            )

            return Response(
                MeetSerializer(meet).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── GET, UPDATE SINGLE MEET ─────────────────────────────
@api_view(['GET', 'PATCH', 'DELETE'])
def meet_detail(request, meet_id):

    try:
        meet = Meet.objects.get(id=meet_id)
        if (
                request.user.is_authenticated
                and request.user.role.name == 'organizer'
                and meet.created_by != request.user
        ):
            return Response(
                {
                    'error': 'You are not authorized to access this meet'
                },
                status=status.HTTP_403_FORBIDDEN
            )


    except Meet.DoesNotExist:
        return Response(
            {'error': 'Meet not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # ---------- GET ----------
    if request.method == 'GET':

        serializer = MeetSerializer(meet)

        return Response(serializer.data)

    # ---------- PATCH ----------
    elif request.method == 'PATCH':

        if (
                not request.user.is_authenticated
                or request.user.role.name != 'organizer'
        ):
            return Response(
                {'error': 'Only organizers can edit meets'},
                status=status.HTTP_403_FORBIDDEN
            )

        if meet.status.name not in ['draft', 'scheduled']:
            return Response(
                {
                    'error':
                    f'Cannot edit a meet with status: {meet.status.name}'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = CreateMeetSerializer(
            meet,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            meet = serializer.save(
                updated_by=request.user
            )

            return Response(
                MeetSerializer(meet).data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # ---------- DELETE ----------
    elif request.method == 'DELETE':

        if (
                not request.user.is_authenticated
                or request.user.role.name != 'organizer'
        ):
            return Response(
                {'error': 'Only organizers can delete meets'},
                status=status.HTTP_403_FORBIDDEN
            )

        meet.delete()

        return Response(
            {
                'message': 'Meet deleted successfully'
            },
            status=status.HTTP_200_OK
        )

# ── MEET STATUS TRANSITIONS ─────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def meet_action(request, meet_id, action):
    """
    Handle meet lifecycle:
    publish, open-registration, close-registration,
    cancel, reschedule, start, complete
    """
    if request.user.role.name != 'organizer':
        return Response(
            {'error': 'Only organizers can perform this action'},
            status=status.HTTP_403_FORBIDDEN
        )
    try:
        meet = Meet.objects.get(id=meet_id)
        if meet.created_by != request.user:
            return Response(
                {
                    'error': 'You are not authorized to modify this meet'
                },
                status=status.HTTP_403_FORBIDDEN
            )
    except Meet.DoesNotExist:
        return Response({'error': 'Meet not found'}, status=status.HTTP_404_NOT_FOUND)

    # Define valid transitions
    transitions = {
        'publish':            ('draft',                'scheduled'),
        'open-registration':  ('scheduled',            'registration_open'),
        'close-registration': ('registration_open',    'registration_closed'),
        'start':              ('registration_closed',  'in_progress'),
        'complete':           ('in_progress',          'completed'),
        'cancel':             (None,                   'cancelled'),
        'reschedule':         (None,                   'rescheduled'),
    }

    if action not in transitions:
        return Response(
            {'error': f'Invalid action: {action}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    required_status, new_status = transitions[action]

    # Check if transition is valid
    if required_status and meet.status.name != required_status:
        return Response(
            {'error': f'Cannot {action} a meet with status: {meet.status.name}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Update registration_open flag
    if new_status == 'registration_open':
        meet.registration_open = True
    elif new_status == 'registration_closed':
        meet.registration_open = False

    meet.status = get_status(new_status)
    meet.updated_by = request.user
    meet.save()

    return Response({
        'message': f'Meet status updated to {new_status}',
        'meet': MeetSerializer(meet).data
    })


# ── DOCUMENT UPLOAD ─────────────────────────────────────
@api_view(['GET', 'POST'])
#@permission_classes([IsAuthenticated])
def meet_documents(request, meet_id):
    """
    GET  - List meet documents
    POST - Upload a document (PDF only, max 10MB, max 5 per meet)
    """
    try:
        meet = Meet.objects.get(id=meet_id)
        if (
                request.user.is_authenticated
                and request.user.role.name == 'organizer'
                and meet.created_by != request.user
        ):
            return Response(
                {
                    'error': 'You are not authorized to access this meet'
                },
                status=status.HTTP_403_FORBIDDEN
            )
    except Meet.DoesNotExist:
        return Response({'error': 'Meet not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        docs = MeetDocument.objects.filter(meet=meet)
        serializer = MeetDocumentSerializer(docs, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        if (
                not request.user.is_authenticated
                or request.user.role.name != 'organizer'
        ):
            return Response(
                {'error': 'Only organizers can upload documents'},
                status=status.HTTP_403_FORBIDDEN
            )
        # Max 5 documents per meet
        if MeetDocument.objects.filter(meet=meet).count() >= 5:
            return Response(
                {'error': 'Maximum 5 documents allowed per meet'},
                status=status.HTTP_400_BAD_REQUEST
            )
        file = request.FILES.get('file')
        if not file:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        # PDF only
        if not file.name.endswith('.pdf'):
            return Response(
                {'error': 'Only PDF files are allowed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Max 10MB
        if file.size > 10 * 1024 * 1024:
            return Response(
                {'error': 'File size must be under 10MB'},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Save file
        doc_type_name = request.data.get('type', 'schedule')
        doc_type = DocumentType.objects.get(name=doc_type_name)
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'meets', str(meet_id))
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, file.name)
        with open(file_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)

        doc = MeetDocument.objects.create(
            meet=meet,
            type=doc_type,
            file_path=file_path,
            uploaded_by=request.user
        )
        return Response(
            MeetDocumentSerializer(doc).data,
            status=status.HTTP_201_CREATED
        )
# ── PUBLISH RESULTS ─────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def publish_results(request, meet_id):

    if request.user.role.name != 'organizer':
        return Response(
            {'error': 'Only organizers can publish results'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        meet = Meet.objects.get(id=meet_id)
        if meet.created_by != request.user:
            return Response(
                {
                    'error': 'You are not authorized to modify this meet'
                },
                status=status.HTTP_403_FORBIDDEN
            )
    except Meet.DoesNotExist:
        return Response(
            {'error': 'Meet not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if meet.status.name != 'completed':
        return Response(
            {
                'error':
                'Meet must be completed before publishing results'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    meet.results_published = True
    meet.save()

    return Response({
        'message': 'Results published successfully',
        'results_published': True
    })


# ── UNPUBLISH RESULTS ───────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unpublish_results(request, meet_id):

    if request.user.role.name != 'organizer':
        return Response(
            {'error': 'Only organizers can unpublish results'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        meet = Meet.objects.get(id=meet_id)
        if meet.created_by != request.user:
            return Response(
                {
                    'error': 'You are not authorized to modify this meet'
                },
                status=status.HTTP_403_FORBIDDEN
            )
    except Meet.DoesNotExist:
        return Response(
            {'error': 'Meet not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    meet.results_published = False
    meet.save()

    return Response({
        'message': 'Results hidden successfully',
        'results_published': False
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_reminders(request, meet_id):

    meet = Meet.objects.get(
        id=meet_id
    )

    registrations = Registration.objects.filter(
        meet=meet
    )

    from users.tasks import send_meet_reminder

    for registration in registrations:

        send_meet_reminder(

            registration.swimmer.email,

            registration.swimmer.username,

            meet.name

        )

    return Response({

        'message':
            'Reminders sent'

    })
