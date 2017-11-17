from rest_framework import serializers

from .models import Post


class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
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


class PostDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
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

