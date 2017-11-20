from rest_framework import serializers

from server import settings
from .models import Article


class ArticleSerializer(serializers.ModelSerializer):
    card_sm_image = serializers.SerializerMethodField()
    card_mat_image = serializers.SerializerMethodField()
    card_lg_image = serializers.SerializerMethodField()
    card_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = (
            'id',
            'published',
            'published_date',
            'slug',
            'title',
            'subtitle',
            'summary',
            'card_sm_image',
            'card_mat_image',
            'card_lg_image',
            'author',
            'card_avatar',
            'created_date',
            'modified_date',
        )

    def get_card_sm_image(self, obj):
        return settings.MEDIA_URL + obj.card_sm_image.name if obj.card_sm_image.name else None

    def get_card_mat_image(self, obj):
        return settings.MEDIA_URL + obj.card_mat_image.name if obj.card_mat_image.name else None

    def get_card_lg_image(self, obj):
        return settings.MEDIA_URL + obj.card_lg_image.name if obj.card_lg_image.name else None

    def get_card_avatar(self, obj):
        return settings.MEDIA_URL + obj.card_avatar.name if obj.card_avatar.name else None


class ArticleDetailSerializer(serializers.ModelSerializer):
    card_sm_image = serializers.SerializerMethodField()
    card_mat_image = serializers.SerializerMethodField()
    card_lg_image = serializers.SerializerMethodField()
    card_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = (
            'id',
            'published',
            'published_date',
            'slug',
            'title',
            'subtitle',
            'summary',
            'content',
            'card_sm_image',
            'card_mat_image',
            'card_lg_image',
            'author',
            'card_avatar',
            'created_date',
            'modified_date',
        )

    def get_card_sm_image(self, obj):
        return settings.MEDIA_URL + obj.card_sm_image.name if obj.card_sm_image.name else None

    def get_card_mat_image(self, obj):
        return settings.MEDIA_URL + obj.card_mat_image.name if obj.card_mat_image.name else None

    def get_card_lg_image(self, obj):
        return settings.MEDIA_URL + obj.card_lg_image.name if obj.card_lg_image.name else None

    def get_card_avatar(self, obj):
        return settings.MEDIA_URL + obj.card_avatar.name if obj.card_avatar.name else None

