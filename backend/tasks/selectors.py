from .models import Task


def list_user_tasks(user):
	return Task.objects.filter(user=user)


def get_user_task(*, user, task_id):
	return Task.objects.get(id=task_id, user=user)