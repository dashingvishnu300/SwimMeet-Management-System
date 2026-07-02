from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.lib.units import inch
import os
from results.models import FinalResult
from meets.models import Meet
from users.models import AppUser
from championships.models import Record
from django.conf import settings
from registrations.models import Registration
from .certificate_generator import CertificateGenerator
from django.shortcuts import get_object_or_404

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_participation_certificate(
        request,
        meet_id
):

    swimmer = request.user

    try:

        meet = Meet.objects.get(
            id=meet_id
        )

    except Meet.DoesNotExist:

        return Response(
            {
                'error': 'Meet not found'
            },
            status=404
        )

    # Verify swimmer actually participated in this meet

    participated = Registration.objects.filter(
        swimmer=swimmer,
        meet=meet
    ).exists()

    if not participated:
        return Response(
            {
                "error": "You did not participate in this meet."
            },
            status=403
        )

    response = HttpResponse(
        content_type='application/pdf'
    )

    response[
        'Content-Disposition'
    ] = (
        f'attachment; '
        f'filename=participation_{swimmer.username}.pdf'
    )

    p = canvas.Canvas(response)
    PAGE_WIDTH = 595
    PAGE_HEIGHT = 842

    logo_path = os.path.join(
        settings.MEDIA_ROOT,
        "certificates",
        "assets",
        "sfi_logo.png"
    )

    logo = None

    if os.path.exists(logo_path):
        logo = ImageReader(logo_path)

        if logo:
            p.drawImage(
                logo,
                245,
                700,
                width=100,
                height=100,
                preserveAspectRatio=True,
                mask="auto"
            )

    p.setFont(
        "Helvetica-Bold",
        18
    )

    p.drawString(
        150,
        780,
        "SWIMMING FEDERATION OF INDIA"
    )

    p.setFont(
        "Helvetica",
        16
    )

    p.drawString(
        180,
        720,
        "Participation Certificate"
    )

    p.drawString(
        100,
        650,
        f"Presented to: {swimmer.username}"
    )

    p.drawString(
        100,
        610,
        f"For participating in {meet.name}"
    )

    p.drawString(
        100,
        570,
        f"Venue: {meet.location}"
    )

    p.drawString(
        100,
        530,
        f"Date: {meet.start_date}"
    )

    p.save()

    return response

@api_view(['GET'])
@permission_classes([AllowAny])
def generate_professional_participation_certificate(
    request,
    registration_id
):
    try:

        registration = Registration.objects.select_related(
            "meet",
            "event",
            "event__event_list",
            "swimmer",
            "swimmer__association"
        ).get(
            id=registration_id
        )

    except Registration.DoesNotExist:

        return Response(
            {
                "error": "Registration not found."
            },
            status=404
        )

    swimmer = registration.swimmer

    response = HttpResponse(
        content_type="application/pdf"
    )

    response[
        "Content-Disposition"
    ] = (
        f'attachment; filename="{swimmer.username}_certificate.pdf"'
    )

    pdf = canvas.Canvas(response)

    generator = CertificateGenerator(pdf)

    # Background Template
    generator.draw_background(
        "participation_template.png"
    )

    # Category
    category = (
        f"{registration.event.event_list.age_group} "
        f"{registration.event.event_list.gender}"
    ).title()

    # Association
    association = (
        swimmer.association.association_name
        if swimmer.association
        else "Swimming Association"
    )

    # Full Name
    name_parts = [
        swimmer.first_name,
        swimmer.middle_name,
        swimmer.last_name,
    ]

    full_name = " ".join(
        part
        for part in name_parts
        if part and str(part).lower() != "none"
    )

    if not full_name:
        full_name = swimmer.username

    # Certificate Number
    certificate_no = (
        f"SMMS/{registration.meet.start_date.year}/"
        f"PRT/{registration.id:06d}"
    )

    # -------------------------
    # Dynamic Text
    # -------------------------

    generator.write_name(full_name)

    generator.write_association(association)

    generator.write_meet(
        registration.meet.name
    )

    generator.write_event(
        registration.event.name
    )

    generator.write_category(
        category
    )

    generator.write_date(
        registration.meet.start_date.strftime("%d %B %Y")
    )

    generator.write_certificate_number(
        certificate_no
    )

    pdf.save()

    return response

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def generate_gold_certificate(request, result_id):

    result = get_object_or_404(
        FinalResult,
        id=result_id
    )
    if result.swimmer != request.user:
        return Response(
            {
                "error": "You are not allowed to download this certificate."
            },
            status=403
        )

    if result.medal != "gold":
        return Response(
            {
                "error": "Gold certificate can only be generated for Gold medal winners."
            },
            status=400
        )

    response = HttpResponse(
        content_type="application/pdf"
    )

    response["Content-Disposition"] = (
        f'attachment; filename="gold_certificate_{result.id}.pdf"'
    )

    pdf = canvas.Canvas(response)

    generator = CertificateGenerator(pdf)

    generator.draw_background(
        "gold_template.png"
    )

    swimmer = result.swimmer

    name_parts = [
        swimmer.first_name,
        swimmer.middle_name,
        swimmer.last_name,
    ]

    full_name = " ".join(
        part
        for part in name_parts
        if part
    )

    if not full_name:
        full_name = swimmer.username

    association = (
        swimmer.association.association_name
        if swimmer.association
        else "Swimming Association"
    )

    category = (
        f"{result.final.event.event_list.age_group} "
        f"{result.final.event.event_list.gender}"
    ).title()

    certificate_no = (
        f"SMMS/{result.final.event.meet.start_date.year}/"
        f"GOLD/{result.id:06d}"
    )

    generator.write_medal_name(full_name)

    generator.write_medal_association(association)

    generator.write_medal_meet(
        result.final.event.meet.name
    )

    generator.write_medal_event(
        result.final.event.name
    )

    generator.write_medal_category(category)

    generator.write_medal_date(
        result.final.event.meet.start_date.strftime(
            "%d %B %Y"
        )
    )

    generator.write_medal_certificate_number(
        certificate_no
    )

    pdf.save()

    return response

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def generate_silver_certificate(request, result_id):

    result = get_object_or_404(
        FinalResult,
        id=result_id
    )
    if result.swimmer != request.user:
        return Response(
            {
                "error": "You are not allowed to download this certificate."
            },
            status=403
        )

    if result.medal != "silver":
        return Response(
            {
                "error": "Silver certificate can only be generated for Silver medal winners."
            },
            status=400
        )

    response = HttpResponse(
        content_type="application/pdf"
    )

    response["Content-Disposition"] = (
        f'attachment; filename="silver_certificate_{result.id}.pdf"'
    )

    pdf = canvas.Canvas(response)

    generator = CertificateGenerator(pdf)

    generator.draw_background(
        "silver_template.png"
    )

    swimmer = result.swimmer

    name_parts = [
        swimmer.first_name,
        swimmer.middle_name,
        swimmer.last_name,
    ]

    full_name = " ".join(
        part
        for part in name_parts
        if part
    )

    if not full_name:
        full_name = swimmer.username

    association = (
        swimmer.association.association_name
        if swimmer.association
        else "Swimming Association"
    )

    category = (
        f"{result.final.event.event_list.age_group} "
        f"{result.final.event.event_list.gender}"
    ).title()

    certificate_no = (
        f"SMMS/{result.final.event.meet.start_date.year}/"
        f"SILVER/{result.id:06d}"
    )

    generator.write_medal_name(full_name)

    generator.write_medal_association(association)

    generator.write_medal_meet(
        result.final.event.meet.name
    )

    generator.write_medal_event(
        result.final.event.name
    )

    generator.write_medal_category(category)

    generator.write_medal_date(
        result.final.event.meet.start_date.strftime(
            "%d %B %Y"
        )
    )

    generator.write_medal_certificate_number(
        certificate_no
    )

    pdf.save()

    return response

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def generate_bronze_certificate(request, result_id):

    result = get_object_or_404(
        FinalResult,
        id=result_id
    )
    if result.swimmer != request.user:
        return Response(
            {
                "error": "You are not allowed to download this certificate."
            },
            status=403
        )

    if result.medal != "bronze":
        return Response(
            {
                "error": "Bronze certificate can only be generated for Bronze medal winners."
            },
            status=400
        )

    response = HttpResponse(
        content_type="application/pdf"
    )

    response["Content-Disposition"] = (
        f'attachment; filename="bronze_certificate_{result.id}.pdf"'
    )

    pdf = canvas.Canvas(response)

    generator = CertificateGenerator(pdf)

    generator.draw_background(
        "bronze_template.png"
    )

    swimmer = result.swimmer

    name_parts = [
        swimmer.first_name,
        swimmer.middle_name,
        swimmer.last_name,
    ]

    full_name = " ".join(
        part
        for part in name_parts
        if part
    )

    if not full_name:
        full_name = swimmer.username

    association = (
        swimmer.association.association_name
        if swimmer.association
        else "Swimming Association"
    )

    category = (
        f"{result.final.event.event_list.age_group} "
        f"{result.final.event.event_list.gender}"
    ).title()

    certificate_no = (
        f"SMMS/{result.final.event.meet.start_date.year}/"
        f"BRONZE/{result.id:06d}"
    )

    generator.write_medal_name(full_name)

    generator.write_medal_association(association)

    generator.write_medal_meet(
        result.final.event.meet.name
    )

    generator.write_medal_event(
        result.final.event.name
    )

    generator.write_medal_category(category)

    generator.write_medal_date(
        result.final.event.meet.start_date.strftime(
            "%d %B %Y"
        )
    )

    generator.write_medal_certificate_number(
        certificate_no
    )

    pdf.save()


    return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def meet_results_pdf(request, meet_id):
    try:
        meet = Meet.objects.get(
            id=meet_id
        )
    except Meet.DoesNotExist:
        return Response(
            {
                'error': 'Meet not found'
            },
            status=404
        )
    results = (
        FinalResult.objects
        .filter(
            final__event__meet=meet
        )
        .select_related(
            'swimmer',
            'final',
            'final__event'
        )
        .order_by(
            'final__event__name',
            'rank'
        )
    )
    response = HttpResponse(
        content_type='application/pdf'
    )
    response[
        'Content-Disposition'
    ] = (
        f'attachment; filename={meet.name}_results.pdf'
    )
    p = canvas.Canvas(response)
    y = 800
    p.setFont(
        "Helvetica-Bold",
        18
    )
    p.drawString(
        130,
        y,
        "SWIMMING FEDERATION OF INDIA"
    )
    y -= 40

    p.drawString(
        170,
        y,
        f"{meet.name} Results"
    )

    y -= 50

    p.setFont(
        "Helvetica",
        10
    )

    for result in results:

        if y < 50:
            p.showPage()

            y = 800

        p.drawString(
            40,
            y,
            result.final.event.name[:20]
        )

        p.drawString(
            220,
            y,
            f"Rank {result.rank}"
        )

        p.drawString(
            300,
            y,
            result.swimmer.username
        )

        p.drawString(
            430,
            y,
            str(result.finish_time)
            if result.finish_time
            else "-"
        )

        p.drawString(
            520,
            y,
            result.medal or "-"
        )

        y -= 20

    p.save()

    return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def record_certificate(request, record_id):
    try:
        record = Record.objects.select_related(
            'swimmer',
            'record_type','meet'
        ).get(
            id=record_id
        )
    except Record.DoesNotExist:
        return Response(
        {
            'error': 'Record not found'
        },
        status=404
    )
    response = HttpResponse(
        content_type='application/pdf'
    )
    response[
        'Content-Disposition'
    ] = (
        f'attachment; filename=record_certificate.pdf'
    )
    p = canvas.Canvas(response)
    p.setFont(
    "Helvetica-Bold",
    18
    )
    p.drawString(
        120,
        780,
        "SWIMMING FEDERATION OF INDIA"
    )

    p.drawString(
        180,
        730,
        "Record Certificate"
    )

    p.drawString(
        100,
        650,
        f"Swimmer : {record.swimmer.username}"
    )

    p.drawString(
        100,
        610,
        f"Record Type : {record.record_type.name}"
    )

    p.drawString(
        100,
        570,
        f"Meet : {record.meet.name}"
    )

    p.drawString(
        100,
        530,
        f"New Time : {record.new_time}"
    )

    p.save()

    from users.tasks import send_certificate_email
    send_certificate_email(

        request.user.email,

        request.user.username

    )

    return response

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_certificates(request):

    swimmer = request.user

    participation = []

    registrations = (
        Registration.objects
        .select_related(
            "meet",
            "event"
        )
        .filter(
            swimmer=swimmer
        )
    )

    for registration in registrations:

        participation.append({

            "registration_id": registration.id,

            "meet": registration.meet.name,

            "event": registration.event.name,

            "certificate_type": "Participation",

            "download_url":
                f"/api/certificates/participation-pro/{registration.id}/"

        })

    gold = []

    silver = []

    bronze = []

    results = (
        FinalResult.objects
        .select_related(
            "final",
            "final__event"
        )
        .filter(
            swimmer=swimmer
        )
    )

    for result in results:

        certificate = {

            "result_id": result.id,

            "event": result.final.event.name,

            "rank": result.rank,

            "download_url": ""

        }

        if result.medal == "gold":

            certificate["download_url"] = (
                f"/api/certificates/gold/{result.id}/"
            )

            gold.append(certificate)

        elif result.medal == "silver":

            certificate["download_url"] = (
                f"/api/certificates/silver/{result.id}/"
            )

            silver.append(certificate)

        elif result.medal == "bronze":

            certificate["download_url"] = (
                f"/api/certificates/bronze/{result.id}/"
            )

            bronze.append(certificate)

    return Response({

        "participation": participation,

        "gold": gold,

        "silver": silver,

        "bronze": bronze

    })




