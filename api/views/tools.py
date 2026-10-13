from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import models
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from core.auth import APIKeyAuthentication, DeveloperTokenAuthentication
from tools.models import RegisteredTool
from api.serializers import ToolRegisterSerializer

class ToolManagementView(APIView):
    """
    Manages application tools.
    Allows developers to list or register/update action endpoints using either
    an Application API Key (tas_live_...) or Developer Session Token (tas_dev_...).
    """
    authentication_classes = [APIKeyAuthentication, DeveloperTokenAuthentication]

    def _resolve_application(self, request):
        app_id = None
        if hasattr(request, 'data') and isinstance(request.data, dict):
            app_id = request.data.get('app_id')
        if not app_id and hasattr(request, 'query_params'):
            app_id = request.query_params.get('app_id')

        if app_id and str(app_id).strip() not in ['undefined', 'null', 'None', '']:
            import uuid
            try:
                uuid.UUID(str(app_id).strip())
                if hasattr(request, 'developer') and request.developer:
                    app = request.developer.applications.filter(id=app_id, is_active=True).first()
                    if app:
                        return app
                from core.models import Application
                app = Application.objects.filter(id=app_id, is_active=True).first()
                if app:
                    return app
            except (ValueError, AttributeError, TypeError):
                pass

        if hasattr(request, 'application') and request.application:
            return request.application

        if hasattr(request, 'developer') and request.developer:
            app = request.developer.applications.filter(is_active=True).first()
            if not app:
                from core.models import Application, APIKey
                app = Application.objects.create(
                    developer=request.developer,
                    app_name="Default Workspace",
                    base_url="https://api.tats.ai/v1"
                )
                APIKey.generate_for_app(app)
            return app

        return None

    @extend_schema(
        tags=['Tool Registry & Discovery'],
        summary='List Active Application Tools',
        description='Fetches all registered action tools and their schema definitions for the authenticated application.',
        parameters=[
            OpenApiParameter(
                name='Authorization',
                type=str,
                location=OpenApiParameter.HEADER,
                description='Bearer API Key: Bearer tas_live_... or Bearer tas_dev_...',
                required=True
            ),
        ],
        responses={200: ToolRegisterSerializer(many=True)}
    )
    def get(self, request):
        app = self._resolve_application(request)
        if not app:
            return Response({'error': 'Application not found or unauthorized.'}, status=status.HTTP_401_UNAUTHORIZED)
        tools = RegisteredTool.objects.filter(application=app)
        serializer = ToolRegisterSerializer(tools, many=True)
        return Response({
            'application': app.app_name,
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
        app = self._resolve_application(request)
        if not app:
            return Response({'error': 'Application not found or unauthorized.'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = ToolRegisterSerializer(
            data=request.data,
            context={'application': app}
        )
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        tool = serializer.save()
        return Response({
            'message': f"Tool '{tool.name}' registered successfully.",
            'tool': ToolRegisterSerializer(tool).data,
            'function_schema': tool.to_function_schema()
        }, status=status.HTTP_201_CREATED)

    def delete(self, request):
        app = self._resolve_application(request)
        if not app:
            return Response({'error': 'Application not found or unauthorized.'}, status=status.HTTP_401_UNAUTHORIZED)

        tool_id = None
        if hasattr(request, 'data') and isinstance(request.data, dict):
            tool_id = request.data.get('id') or request.data.get('name')
        if not tool_id and hasattr(request, 'query_params'):
            tool_id = request.query_params.get('id') or request.query_params.get('name')

        if not tool_id:
            return Response({'error': 'Tool ID or name is required for deletion.'}, status=status.HTTP_400_BAD_REQUEST)

        # Lookup by UUID id or unique name within application
        tool = None
        import uuid
        try:
            uuid.UUID(str(tool_id).strip())
            tool = RegisteredTool.objects.filter(application=app, id=str(tool_id).strip()).first()
        except (ValueError, TypeError, AttributeError):
            pass
        if not tool:
            tool = RegisteredTool.objects.filter(application=app, name=tool_id).first()

        if not tool:
            return Response({'error': 'Tool not found in this application cluster.'}, status=status.HTTP_404_NOT_FOUND)

        tool_name = tool.name
        tool.delete()
        return Response({
            'success': True,
            'message': f"Tool '{tool_name}' deleted from engine registry."
        }, status=status.HTTP_200_OK)
