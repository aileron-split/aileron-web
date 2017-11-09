# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2017-11-08 22:20
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0003_post_published_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='author',
            field=models.CharField(blank=True, max_length=80, null=True),
        ),
        migrations.AlterField(
            model_name='post',
            name='card_avatar',
            field=models.ImageField(blank=True, null=True, upload_to='images/avatars/'),
        ),
        migrations.AlterField(
            model_name='post',
            name='card_lg_image',
            field=models.ImageField(blank=True, null=True, upload_to='images/cards/'),
        ),
        migrations.AlterField(
            model_name='post',
            name='card_mat_image',
            field=models.ImageField(blank=True, null=True, upload_to='images/cards/'),
        ),
        migrations.AlterField(
            model_name='post',
            name='card_sm_image',
            field=models.ImageField(blank=True, null=True, upload_to='images/cards/'),
        ),
        migrations.AlterField(
            model_name='post',
            name='subtitle',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
    ]
