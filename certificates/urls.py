from django.urls import path
from . import views

urlpatterns = [

    path(
        'participation/<int:meet_id>/',
        views.generate_participation_certificate
    ),

    path(
        'participation-pro/<int:registration_id>/',
        views.generate_professional_participation_certificate,
        name='professional-participation-certificate'
    ),

    path(
        "gold/<int:result_id>/",
        views.generate_gold_certificate,
        name="gold-certificate"
    ),

    path(
        "silver/<int:result_id>/",
        views.generate_silver_certificate,
        name="silver-certificate"
    ),

    path(
        "bronze/<int:result_id>/",
        views.generate_bronze_certificate,
        name="bronze-certificate"
    ),
    path(
        "my-certificates/",
        views.my_certificates,
        name="my-certificates"
    ),

]