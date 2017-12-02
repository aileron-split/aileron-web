from server import settings
from rest_framework import serializers

from .models import Member


class MemberSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = (
            'id',
            'published',
            'published_date',
            'title',
            'name',
            'middle_name',
            'last_name',
            'summary',
            'avatar',
            'status',
            'created_date',
            'modified_date',
        )

    def get_avatar(self, obj):
        return settings.MEDIA_URL + obj.avatar.name if obj.avatar.name else None


class MemberShortSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = (
            'name',
            'avatar',
            'status',
        )

    def get_avatar(self, obj):
        return settings.MEDIA_URL + obj.avatar.name if obj.avatar.name else None


class MemberDetailSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = (
            'id',
            'published',
            'published_date',
            'title',
            'name',
            'middle_name',
            'last_name',
            'summary',
            'curriculum_vitae',
            'avatar',
            'status',
            'created_date',
            'modified_date',
        )

    def get_avatar(self, obj):
        return settings.MEDIA_URL + obj.avatar.name if obj.avatar.name else None

