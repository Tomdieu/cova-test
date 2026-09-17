from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from drf_yasg.utils import swagger_auto_schema

from . import selectors, services
from .serializers import (
	LoginResponseSerializer,
	LoginSerializer,
	RegisterSerializer,
	TokenRefreshResponseSerializer,
	UserSerializer,
)


class RegisterView(APIView):
	permission_classes = (AllowAny,)

	@swagger_auto_schema(
		operation_summary="Register a user",
		operation_description="Create a new user account.",
		request_body=RegisterSerializer,
		responses={201: UserSerializer, 400: "Invalid registration data."},
		tags=["Authentication"],
	)
	def post(self, request):
		serializer = RegisterSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		user = services.create_user(**serializer.validated_data)
		return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
	permission_classes = (AllowAny,)

	@swagger_auto_schema(
		operation_summary="Log in",
		operation_description=(
			"Authenticate with email and password. Returns the user profile, "
			"a short-lived access token, and a refresh token."
		),
		request_body=LoginSerializer,
		responses={
			200: LoginResponseSerializer,
			401: "Invalid email or password.",
		},
		tags=["Authentication"],
	)
	def post(self, request):
		serializer = LoginSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		user = services.authenticate_user(**serializer.validated_data)
		if user is None:
			return Response(
				{"detail": "Invalid email or password."},
				status=status.HTTP_401_UNAUTHORIZED,
			)

		return Response({"user": UserSerializer(user).data, **services.create_tokens(user)})


class ProfileView(APIView):
	permission_classes = (IsAuthenticated,)

	@swagger_auto_schema(
		operation_summary="Get the current user profile",
		operation_description="Return the profile belonging to the authenticated JWT user.",
		responses={200: UserSerializer, 401: "Authentication credentials were not provided."},
		tags=["Authentication"],
	)
	def get(self, request):
		user = selectors.get_user_by_id(request.user.id)
		return Response(UserSerializer(user).data)


class TokenRefreshView(APIView):
	permission_classes = (AllowAny,)

	@swagger_auto_schema(
		operation_summary="Refresh an access token",
		operation_description="Exchange a valid refresh token for a new access token.",
		request_body=TokenRefreshSerializer,
		responses={
			200: TokenRefreshResponseSerializer,
			401: "The refresh token is invalid or expired.",
		},
		tags=["Authentication"],
	)
	def post(self, request):
		serializer = TokenRefreshSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		return Response(serializer.validated_data)
