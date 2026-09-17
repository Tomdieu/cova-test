from .models import Task


def create_task(*, user, validated_data):
	return Task.objects.create(user=user, **validated_data)


def update_task(*, task, validated_data):
	for field, value in validated_data.items():
		setattr(task, field, value)
	task.save()
	return task


def delete_task(*, task):
	task.delete()