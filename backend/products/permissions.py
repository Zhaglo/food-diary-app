from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsProductOwnerOrAdmin(BasePermission):
    """
    Читать продукты могут все авторизованные пользователи.
    Изменять и удалять продукт может только создатель или администратор.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        return obj.created_by == request.user or request.user.is_staff
