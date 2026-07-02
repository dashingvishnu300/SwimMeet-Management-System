from django.urls import path
from . import views

urlpatterns = [
    # Generate and view heats
    path('meets/<int:meet_id>/events/<int:event_id>/generate/', views.generate_heats, name='generate_heats'),
    path('meets/<int:meet_id>/events/<int:event_id>/', views.event_heats, name='event_heats'),

    # Heat results
    path('<int:heat_id>/results/', views.enter_heat_results, name='enter_heat_results'),
    path('<int:heat_id>/complete/', views.complete_heat, name='complete_heat'),
    path('heat/<int:heat_id>/',views.heat_details),
]