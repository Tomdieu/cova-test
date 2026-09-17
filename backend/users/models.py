from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """Application user model used instead of Django's default User model."""

    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username