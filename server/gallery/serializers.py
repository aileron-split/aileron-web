from server import settings
from rest_framework import serializers

from .models import Album, Image


class ImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Image
        fields = (
            'slug',
            'title',
            'summary',
            'image',
            'created_date',
            'modified_date',
        )

    def get_image(self, obj):
        return settings.MEDIA_URL + obj.image.name if obj.image.name else None


class ImageShortSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Image
        fields = (
            'slug',
            'title',
            'summary',
            'image',
        )

    def get_image(self, obj):
        return settings.MEDIA_URL + obj.image.name if obj.image.name else None


class AlbumSerializer(serializers.ModelSerializer):
    images = ImageShortSerializer(many=True)

    class Meta:
        model = Album
        fields = (
            'title',
            'summary',
            'images',
            'created_date',
            'modified_date',
        )
