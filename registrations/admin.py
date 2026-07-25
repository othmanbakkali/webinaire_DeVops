from django.contrib import admin
from .models import Registration

@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'role', 'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('full_name', 'email')

