from rest_framework import status
from rest_framework.test import APITestCase


class UserAuthApiTests(APITestCase):
	def test_register_login_and_profile_flow(self):
		register_response = self.client.post(
			"/api/auth/register/",
			{
				"username": "ivan",
				"email": "ivan@example.com",
				"password": "strong-password-123",
				"first_name": "Ivan",
				"last_name": "Tom",
			},
			format="json",
		)

		self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)

		login_response = self.client.post(
			"/api/auth/login/",
			{"email": "ivan@example.com", "password": "strong-password-123"},
			format="json",
		)

		self.assertEqual(login_response.status_code, status.HTTP_200_OK)
		self.assertEqual(
			set(login_response.data),
			{"user", "refresh", "access"},
		)
		self.assertEqual(login_response.data["user"]["email"], "ivan@example.com")

		refresh_response = self.client.post(
			"/api/auth/token/refresh/",
			{"refresh": login_response.data["refresh"]},
			format="json",
		)
		self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
		self.assertIn("access", refresh_response.data)

		self.client.credentials(
			HTTP_AUTHORIZATION=f"Bearer {login_response.data['access']}"
		)
		profile_response = self.client.get("/api/auth/profile/")

		self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
		self.assertEqual(profile_response.data["username"], "ivan")
		self.assertEqual(profile_response.data["first_name"], "Ivan")
