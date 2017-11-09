from rest_framework import serializers

from .models import Article


class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = (
            'published',
            'title',
            'subtitle',
            'content',
            'card_sm_image',
            'card_mat_image',
            'card_lg_image',
            'author',
            'card_avatar',
            'created_date',
            'modified_date',
            'published_date',
        )

