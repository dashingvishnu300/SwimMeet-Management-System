from django.urls import path
from . import views

urlpatterns = [
    # Meet registrations
    path('meets/<int:meet_id>/', views.registrations, name='registrations'),
    path('meets/<int:meet_id>/<int:registration_id>/recall/', views.recall_registration, name='recall_registration'),
    path('meets/<int:meet_id>/<int:registration_id>/send-back/', views.send_back_registration, name='send_back_registration'),

    # Swimmer specific
    path('my/', views.my_registrations, name='my_registrations'),
    path('swimmers/<int:swimmer_id>/best-times/', views.swimmer_best_times, name='swimmer_best_times'),
]