from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.urls import (
    path,
    include
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth APIs
    path('api/auth/', include('users.urls')),

    # Meets APIs
    path('api/meets/', include('meets.urls')),

    path('api/users/', include('users.urls')),

    # Events APIs
    path('api/events/', include('events.urls')),

    # Registrations APIs
    path('api/registrations/', include('registrations.urls')),

path(
    'api/admin/',
    include(
        'admin_portal.urls'
    )
),


    # Heats APIs
    path('api/heats/', include('heats.urls')),

    # Results APIs
    path('api/results/', include('results.urls')),

    # Championships APIs
    path('api/championships/', include('championships.urls')),
    path("api/masters/",include("masters.urls")),
    path('api/certificates/',include('certificates.urls')),

]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
