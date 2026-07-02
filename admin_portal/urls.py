from django.urls import path

from .views import (
    pending_organizers,
    approved_organizers,
    rejected_organizers,
    approve_organizer,
    reject_organizer
)

urlpatterns = [

    path(
        'organizers/pending/',
        pending_organizers
    ),

    path(
        'organizers/approved/',
        approved_organizers
    ),

    path(
        'organizers/rejected/',
        rejected_organizers
    ),

    path(
        'organizers/<int:pk>/approve/',
        approve_organizer
    ),

    path(
        'organizers/<int:pk>/reject/',
        reject_organizer
    ),

]