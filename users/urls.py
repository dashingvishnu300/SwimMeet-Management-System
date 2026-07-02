from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from users.swimmer_career_view import SwimmerCareerView
from .views import verify_email, qualified_swimmers
urlpatterns = [
    # Auth endpoints
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Profile endpoints
    path('me/', views.profile, name='profile'),
    path('swimmers/', views.swimmer_list, name='swimmer_list'),

path(
    'profile-stats/',
    views.profile_stats,
    name='profile_stats'
),
path(
    'personal-bests/',
    views.personal_bests,
    name='personal_bests'
),
path(
    'recent-results/',
    views.recent_results,
    name='recent_results'
),
path(
    'records-held/',
    views.records_held,
    name='records_held'
),
path(
    'meet-history/',
    views.meet_history,
    name='meet_history'
),
path(
    'registered-events/',
    views.registered_events,
    name='registered_events'
),
path(
    'profile-stats/<int:swimmer_id>/',
    views.profile_stats_by_id
),
path(
    'personal-bests/<int:swimmer_id>/',
    views.personal_bests_by_id
),
path(
    'recent-results/<int:swimmer_id>/',
    views.recent_results_by_id
),
path(
    'records-held/<int:swimmer_id>/',
    views.records_held_by_id
),
path(
    'meet-history/<int:swimmer_id>/',
    views.meet_history_by_id
),
path(
    'registered-events/<int:swimmer_id>/',
    views.registered_events_by_id
),
path(
    'profile/<int:swimmer_id>/',
    views.profile_by_id
),
# ── ADMIN ORGANIZER WORKFLOW ─────────────────────────

path(
    'admin/pending-organizers/',
    views.pending_organizers
),

path(
    'admin/approved-organizers/',
    views.approved_organizers
),

path(
    'admin/rejected-organizers/',
    views.rejected_organizers
),

path(
    'admin/organizers/<int:organizer_id>/approve/',
    views.approve_organizer
),

path(
    'admin/organizers/<int:organizer_id>/reject/',
    views.reject_organizer
),
path(
    "swimmers/<int:swimmer_id>/career/",
    SwimmerCareerView.as_view()
),

path(
    'change-password/',
    views.change_password
),
path(
    'verify-email/<uuid:token>/',
    verify_email
),
path(
    'qualified-swimmers/',
    qualified_swimmers
),
]
