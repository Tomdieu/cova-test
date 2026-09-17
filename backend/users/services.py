from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


def create_user(*, username, email, password, first_name="", last_name="", phone_number=""):
	return User.objects.create_user(
		username=username,
		email=email,
		password=password,
		first_name=first_name,
		last_name=last_name,
		phone_number=phone_number,
	)


def authenticate_user(*, email, password):
	return authenticate(username=email, password=password)


def create_tokens(user):
	refresh = RefreshToken.for_user(user)
	return {"refresh": str(refresh), "access": str(refresh.access_token)}