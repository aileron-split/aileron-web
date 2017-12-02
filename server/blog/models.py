from django.db import models


# Blog app models.
class Post(models.Model):
    published = models.BooleanField(default=False)
    published_date = models.DateTimeField(null=True, blank=True)
    slug = models.SlugField(max_length=80)
    title = models.CharField(max_length=80, default='Post Title')
    subtitle = models.CharField(max_length=200, null=True, blank=True)
    summary = models.TextField(default='Post summary.')
    content = models.TextField(default='Post content.')
    card_sm_image = models.ImageField(upload_to='images/cards/', null=True, blank=True)
    card_mat_image = models.ImageField(upload_to='images/cards/', null=True, blank=True)
    card_lg_image = models.ImageField(upload_to='images/cards/', null=True, blank=True)
    video = models.URLField(null=True, blank=True)
    album = models.ForeignKey('gallery.Album', blank=True, null=True)
    author = models.ForeignKey('team.Member', blank=True, null=True)
    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
