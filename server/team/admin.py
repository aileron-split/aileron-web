from django.contrib import admin
from django.utils import timezone

from .models import Member


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    date_hierarchy = 'created_date'
    readonly_fields = ('published',)

    list_display = ('published', 'name', 'last_name', 'summary', 'status')
    list_filter = ('status',)
    search_fields = ('name', 'middle_name', 'last_name', 'summary', 'curriculum_vitae')
    list_display_links = ('name',)

    actions = ('make_published', 'make_not_published')

    def make_published(modeladmin, request, queryset):
        queryset.filter(published__exact=False).update(published=True, published_date=timezone.now())

    make_published.short_description = 'Publish selected news articles'

    def make_not_published(modeladmin, request, queryset):
        queryset.update(published=False, published_date=None)

    make_not_published.short_description = 'Unpublish selected news articles'
