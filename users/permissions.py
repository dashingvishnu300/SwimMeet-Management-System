from rest_framework.permissions import BasePermission


class IsOrganizer(BasePermission):
    """Only organizers can access this endpoint"""
    message = 'Only organizers are allowed to perform this action'

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role and
            request.user.role.name == 'organizer'
        )


class IsCoach(BasePermission):
    """Only coaches can access this endpoint"""
    message = 'Only coaches are allowed to perform this action'

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role and
            request.user.role.name == 'coach'
        )


class IsSwimmer(BasePermission):
    """Only swimmers can access this endpoint"""
    message = 'Only swimmers are allowed to perform this action'

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role and
            request.user.role.name == 'swimmer'
        )


class IsOrganizerOrCoach(BasePermission):
    """Organizers and coaches can access this endpoint"""
    message = 'Only organizers or coaches are allowed'

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role and
            request.user.role.name in ['organizer', 'coach']
        )


class IsOrganizerOrReadOnly(BasePermission):
    """
    Organizers can do everything.
    Others can only read (GET requests)
    """
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return (
            request.user.is_authenticated and
            request.user.role and
            request.user.role.name == 'organizer'
        )