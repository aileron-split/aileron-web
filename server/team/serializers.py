from rest_framework import serializers

from .models import Member


class MemberSerializer(serializers.ModelSerializer):
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


class MemberDetailSerializer(serializers.ModelSerializer):
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

