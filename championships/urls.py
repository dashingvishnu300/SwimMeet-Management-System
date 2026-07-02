from django.urls import path
from . import views


urlpatterns = [
    # Championship points
    path('meets/<int:meet_id>/calculate/', views.calculate_points, name='calculate_points'),
    path('meets/<int:meet_id>/tally/', views.medal_tally, name='medal_tally'),
    path('meets/<int:meet_id>/podium/', views.podium, name='podium'),

    # Records
    path(
        'records/',
        views.records_center,
        name='records_center'
    ),

    path(
        'meets/<int:meet_id>/records/',
        views.meet_records,
        name='meet_records'
    ),

    # Swimmer profile
    path(
        'swimmers/<int:swimmer_id>/',
        views.swimmer_championships,
        name='swimmer_championships'
    ),

    # Swimmer dashboard
    path(
        'dashboard/',
        views.swimmer_dashboard,
        name='swimmer-dashboard'
    ),
    path(
        'promote/<int:meet_id>/',
        views.promote_swimmers
    ),

    path(
        'state-qualifiers/',
        views.state_qualifiers
    ),

    path(
        'national-qualifiers/',
        views.national_qualifiers
    ),

    path(
        'records/national/',
        views.national_records
    ),
    path(
        'records/state/',
        views.state_records
    ),

    path(
        'records/district/',
        views.district_records
    ),

    path(
        'rankings/',
        views.overall_rankings
    ),
    path(
        'top-medalists/',
        views.top_medalists
    ),
    path(
        'meet-rankings/<int:meet_id>/',
        views.meet_rankings
    ),
    path(
        'swimmer/<int:swimmer_id>/pbs/',
        views.swimmer_personal_bests
    ),

]