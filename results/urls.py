from django.urls import path
from . import views

urlpatterns = [
    # Finals generation and viewing
    path('meets/<int:meet_id>/events/<int:event_id>/generate-finals/', views.generate_finals, name='generate_finals'),
    path('meets/<int:meet_id>/events/<int:event_id>/finals/', views.event_finals, name='event_finals'),

    # Final results
    path('finals/<int:final_id>/results/', views.enter_final_results, name='enter_final_results'),

    # Public meet results
    path('meets/<int:meet_id>/', views.meet_results, name='meet_results'),

    path(
        'finals/<int:final_id>/',
        views.final_details
    ),
    path(
        'generate-all-finals/<int:meet_id>/',
        views.generate_all_finals,
        name='generate_all_finals'
    ),
]
