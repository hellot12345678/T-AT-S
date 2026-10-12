from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from core.auth import APIKeyAuthentication
from tools.models import RegisteredTool
from api.serializers import ToolRegisterSerializer

class ToolManagementView(APIView):
    """
    Manages application tools.
    Allows developers to list or register/update action endpoints.
    """
    authentication_classes = [APIKeyAuthentication]

    @extend_schema(
        tags=['Tool Registry & Discovery'],
        summary='List Active Application Tools',
        description='Fetches all registered action tools and their schema definitions for the authenticated application.',
        parameters=[
            OpenApiParameter(
                name='Authorization',
                type=str,
                location=OpenApiParameter.HEADER,
                description='Bearer API Key: Bearer tas_live_...',
                required=True
            ),
        ],
        responses={200: ToolRegisterSerializer(many=True)}
    )
    def get(self, request):
        tools = RegisteredTool.objects.filter(application=request.application)
        serializer = ToolRegisterSerializer(tools, many=True)
        return Response({
            'application': request.application.app_name,
            'count': len(serializer.data),
            'tools': serializer.data
        }, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['Tool Registry & Discovery'],
        summary='Register / Update Action Tool',
        description='Registers a new software action endpoint for the application. Automatically generates OpenAPI / function-calling schema for Llama 3.3.',
        parameters=[
            OpenApiParameter(
                name='Authorization',
                type=str,
                location=OpenApiParameter.HEADER,
                description='Bearer API Key: Bearer tas_live_...',
                required=True
            ),
        ],
        request=ToolRegisterSerializer,
        examples=[
            OpenApiExample(
                'Register Create Task Tool',
                value={
                    'name': 'create_task',
                    'description': 'Creates a project task or reminder in workspace',
                    'endpoint': '/api/v1/tasks/create/',
                    'method': 'POST',
                    'parameters_schema': {
                        'title': {'type': 'string', 'required': True, 'guide': 'Title of the task'},
                        'priority': {'type': 'enum', 'enumValues': ['low', 'medium', 'high'], 'required': False},
                        'due_date': {'type': 'datetime', 'required': False, 'guide': 'Target deadline ISO string'}
                    }
                },
                request_only=True
            )
        ],
        responses={201: ToolRegisterSerializer}
    )
    def post(self, request):
        serializer = ToolRegisterSerializer(
            data=request.data,
            context={'application': request.application}
        )
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        tool = serializer.save()
        return Response({
            'message': f"Tool '{tool.name}' registered successfully.",
            'tool': ToolRegisterSerializer(tool).data,
            'function_schema': tool.to_function_schema()
        }, status=status.HTTP_201_CREATED)
