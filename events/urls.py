from django.urls import path
from . import views

urlpatterns = [
    # Master event list
    path('master/', views.event_master_list, name='event_master_list'),

    # Meet specific events
    path('meets/<int:meet_id>/', views.meet_events, name='meet_events'),
    path('meets/<int:meet_id>/eligible-events/',views.eligible_events,name='eligible_events'),
    path('meets/<int:meet_id>/<int:event_id>/', views.meet_event_detail, name='meet_event_detail'),
]