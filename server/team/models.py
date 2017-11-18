from django.db import models


# Create your models here.
class Member(models.Model):
    FULLTIME = 'FT'
    PARTTIME = 'PT'
    ASSOCIATE = 'AS'
    MEMBER_STATUS = (
        ('FT', 'Full-time'),
        ('PT', 'Part-time'),
        ('AS', 'Associate'),
    )

    published = models.BooleanField(default=False)
    published_date = models.DateTimeField(null=True, blank=True)
    title = models.CharField(max_length=80, null=True, blank=True)
    name = models.CharField(max_length=80, default='Jane')
    middle_name = models.CharField(max_length=80, null=True, blank=True)
    last_name = models.CharField(max_length=80, default='Doe')
    summary = models.TextField(default='The expert.')
    curriculum_vitae = models.TextField(null=True, blank=True)
    avatar = models.ImageField(upload_to='images/avatars/', null=True, blank=True)
    status = models.CharField(max_length=2, choices=MEMBER_STATUS, default=ASSOCIATE)
    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return '%s %s' % (self.name, self.last_name)
