from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Task


class TaskApiTests(APITestCase):
	def setUp(self):
		self.user = get_user_model().objects.create_user(
			username="ivan",
			email="ivan@example.com",
			password="strong-password-123",
		)
		self.other_user = get_user_model().objects.create_user(
			username="other",
			email="other@example.com",
			password="strong-password-123",
		)
		self.client.force_authenticate(self.user)

	def test_task_crud_and_user_scoping(self):
		create_response = self.client.post(
			"/api/tasks/",
			{
				"title": "Prepare test",
				"description": "Implement the task API",
				"status": "TODO",
			},
			format="json",
		)

		self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
		task_id = create_response.data["id"]
		self.assertEqual(Task.objects.get(id=task_id).user, self.user)

		list_response = self.client.get("/api/tasks/")
		self.assertEqual(list_response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(list_response.data), 1)

		update_response = self.client.put(
			f"/api/tasks/{task_id}/",
			{
				"title": "Finish test",
				"description": "Complete and verify the task API",
				"status": "DONE",
			},
			format="json",
		)
		self.assertEqual(update_response.status_code, status.HTTP_200_OK)
		self.assertEqual(update_response.data["status"], "DONE")

		Task.objects.create(
			user=self.other_user,
			title="Private task",
			description="Must not be visible",
		)
		other_task = Task.objects.get(user=self.other_user)
		forbidden_response = self.client.put(
			f"/api/tasks/{other_task.id}/",
			{
				"title": "Should not update",
				"description": "Must remain private",
				"status": "DONE",
			},
			format="json",
		)
		self.assertEqual(forbidden_response.status_code, status.HTTP_404_NOT_FOUND)

		delete_response = self.client.delete(f"/api/tasks/{task_id}/")
		self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
		self.assertFalse(Task.objects.filter(id=task_id).exists())
