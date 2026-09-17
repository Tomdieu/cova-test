from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ("id", "username", "email", "first_name", "last_name")


class RegisterSerializer(serializers.Serializer):
	username = serializers.CharField(max_length=150)
	email = serializers.EmailField()
	password = serializers.CharField(write_only=True, min_length=8)
	first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
	last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
	phone_number = serializers.CharField(max_length=20, required=False, allow_blank=True)

	def validate_username(self, value):
		if User.objects.filter(username=value).exists():
			raise serializers.ValidationError("A user with this username already exists.")
		return value

	def validate_email(self, value):
		if User.objects.filter(email__iexact=value).exists():
			raise serializers.ValidationError("A user with this email already exists.")
		return value


class LoginSerializer(serializers.Serializer):
	email = serializers.EmailField()
	password = serializers.CharField(write_only=True)


class LoginResponseSerializer(serializers.Serializer):
	user = UserSerializer()
	refresh = serializers.CharField()
	access = serializers.CharField()


class TokenRefreshResponseSerializer(serializers.Serializer):
	access = serializers.CharField()
	refresh = serializers.CharField(required=False)
