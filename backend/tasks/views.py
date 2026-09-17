from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from . import selectors, services
from .serializers import TaskSerializer


class TaskListCreateView(APIView):
	permission_classes = (IsAuthenticated,)

	@swagger_auto_schema(
		operation_summary="List the current user's tasks",
		operation_description="Return only tasks owned by the authenticated user.",
		responses={200: TaskSerializer(many=True), 401: "Authentication required."},
		tags=["Tasks"],
	)
	def get(self, request):
		serializer = TaskSerializer(selectors.list_user_tasks(request.user), many=True)
		return Response(serializer.data)

	@swagger_auto_schema(
		operation_summary="Create a task",
		operation_description="Create a task owned by the authenticated user.",
		request_body=TaskSerializer,
		responses={201: TaskSerializer, 400: "Invalid task data.", 401: "Authentication required."},
		tags=["Tasks"],
	)
	def post(self, request):
		serializer = TaskSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		task = services.create_task(
			user=request.user,
			validated_data=serializer.validated_data,
		)
		return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)


class TaskDetailView(APIView):
	permission_classes = (IsAuthenticated,)
	task_id_parameter = openapi.Parameter(
		"task_id",
		openapi.IN_PATH,
		description="ID of a task owned by the authenticated user.",
		type=openapi.TYPE_INTEGER,
		required=True,
	)

	def get_task(self, request, task_id):
		return get_object_or_404(
			selectors.list_user_tasks(request.user),
			id=task_id,
		)

	@swagger_auto_schema(
		operation_summary="Update a task",
		operation_description="Replace a task owned by the authenticated user.",
		manual_parameters=[task_id_parameter],
		request_body=TaskSerializer,
		responses={
			200: TaskSerializer,
			400: "Invalid task data.",
			401: "Authentication required.",
			404: "Task not found for this user.",
		},
		tags=["Tasks"],
	)
	def put(self, request, task_id):
		task = self.get_task(request, task_id)
		serializer = TaskSerializer(task, data=request.data)
		serializer.is_valid(raise_exception=True)
		task = services.update_task(
			task=task,
			validated_data=serializer.validated_data,
		)
		return Response(TaskSerializer(task).data)

	@swagger_auto_schema(
		operation_summary="Delete a task",
		operation_description="Delete a task owned by the authenticated user.",
		manual_parameters=[task_id_parameter],
		responses={
			204: "Task deleted.",
			401: "Authentication required.",
			404: "Task not found for this user.",
		},
		tags=["Tasks"],
	)
	def delete(self, request, task_id):
		task = self.get_task(request, task_id)
		services.delete_task(task=task)
		return Response(status=status.HTTP_204_NO_CONTENT)
