from django.contrib import admin
from django.utils import timezone

from .models import Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    date_hierarchy = 'created_date'
    readonly_fields = ('published',)
    prepopulated_fields = {'slug': ('title',)}

    list_display = ('published', 'title', 'author', 'created_date', 'modified_date', 'published_date', 'subtitle')
    list_filter = ('author',)
    search_fields = ('title', 'subtitle', 'author__name', 'author__last_name', 'author__middle_name', 'summary', 'content')
    list_display_links = ('title',)

    actions = ('make_published', 'make_not_published')

    def make_published(modeladmin, request, queryset):
        queryset.filter(published__exact=False).update(published=True, published_date=timezone.now())
    make_published.short_description = 'Publish selected blog posts'

    def make_not_published(modeladmin, request, queryset):
        queryset.update(published=False, published_date=None)
    make_not_published.short_description = 'Unpublish selected blog posts'