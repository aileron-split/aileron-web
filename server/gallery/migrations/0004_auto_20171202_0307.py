# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2017-12-02 03:07
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gallery', '0003_auto_20171201_0607'),
    ]

    operations = [
        migrations.AlterField(
            model_name='image',
            name='summary',
            field=models.TextField(default='Image caption.'),
        ),
        migrations.AlterField(
            model_name='image',
            name='title',
            field=models.CharField(default='Image title', max_length=80),
        ),
    ]
