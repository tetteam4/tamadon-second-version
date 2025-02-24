from operator import concat
from django.contrib import admin

from .models import ChatMassage, User, UserProfile, Contact


class ChatAdmin(admin.ModelAdmin):
    list_display = ["id", "sender", "receiver", "is_read", "date"]
    list_filter = ["sender", "receiver", "is_read"]
    list_display_links = ["sender", "receiver"]


admin.site.register(ChatMassage, ChatAdmin)


admin.site.register(UserProfile)


class AdminUser(admin.ModelAdmin):
    list_display = ["id", "email", "is_active"]
    search_fields = ["email"]  # Allows searching users by email
    list_filter = ["is_active"]  # Allows filtering by is_active, remove if unnecessary


admin.site.register(User, AdminUser)


from django.contrib import admin
from .models import Contact


# Custom admin class for the Contact model

class ContactAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'content')

    search_fields = ('email', 'name')


    fieldsets = (
        (None, {
            'fields': ('email', 'name', 'content')
        }),
        ('Date Information', {
            'fields': ('created_at',),
            'classes': ('collapse',),
        }),
    )

    actions = ['delete_selected']

    def delete_selected(self, request, queryset):
        """
        Custom action to delete selected messages
        """
        queryset.delete()
        self.message_user(request, "Selected contact messages deleted successfully.")

    delete_selected.short_description = "Delete selected messages"


admin.site.register(Contact,ContactAdmin)