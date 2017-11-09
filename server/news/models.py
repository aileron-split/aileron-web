import datetime

from django.db import models
from django.utils import timezone

# News app models.

class Article(models.Model):
    published = models.BooleanField(default=False)
    published_date = models.DateTimeField(null=True, blank=True)
    title = models.CharField(max_length=80, default='Test Article')
    subtitle = models.CharField(max_length=200, null=True, blank=True)
    summary = models.TextField(default='Test summary.')
    content = models.TextField(default='Test content.')
    card_sm_image = models.ImageField(upload_to='images/cards/', null=True, blank=True)
    card_mat_image = models.ImageField(upload_to='images/cards/', null=True, blank=True)
    card_lg_image = models.ImageField(upload_to='images/cards/', null=True, blank=True)
    author = models.CharField(max_length=80, null=True, blank=True)
    card_avatar = models.ImageField(upload_to='images/avatars/', null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


    

