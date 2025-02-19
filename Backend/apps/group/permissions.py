from rest_framework import permissions


class IsSuperDesigner(permissions.BasePermission):

    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and user.role in [
            user.Designer,
            user.SuperDesigner,
            user.Admin,
            user.Printer,
        ]
