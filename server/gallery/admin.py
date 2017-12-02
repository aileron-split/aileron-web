from django.contrib import admin

from .models import Album, Image


# Galleries administration
class ImageInline(admin.TabularInline):
    model = Image
    prepopulated_fields = {'slug': ('title',)}

    fields = ('image_tag', 'slug', 'title', 'summary', 'image', 'created_date', 'modified_date',)
    readonly_fields = ('image_tag', 'created_date', 'modified_date',)


@admin.register(Album)
class GalleryAdmin(admin.ModelAdmin):
    date_hierarchy = 'created_date'

    list_display = ('title', 'images_count', 'created_date', 'modified_date')
    search_fields = ('title', 'summary')
    list_display_links = ('title',)

    inlines = [
        ImageInline,
    ]

    def images_count(self, obj):
        return obj.images.count()