from django.db import models
from django.conf import settings


class Task(models.Model):
	class Status(models.TextChoices):
		TODO = "TODO", "To do"
		IN_PROGRESS = "IN_PROGRESS", "In progress"
		DONE = "DONE", "Done"

	user = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="tasks",
	)
	title = models.CharField(max_length=255)
	description = models.TextField(blank=True)
	status = models.CharField(
		max_length=20,
		choices=Status.choices,
		default=Status.TODO,
	)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-created_at"]

	def __str__(self):
		return self.title
