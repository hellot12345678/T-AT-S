from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.auth import APIKeyAuthentication
from tools.models import RegisteredTool
from api.serializers import ToolRegisterSerializer

class ToolManagementView(APIView):
    """
    Manages application tools.
    Allows developers to list or register/update action endpoints.
    """
    authentication_classes = [APIKeyAuthentication]

    def get(self, request):
        tools = RegisteredTool.objects.filter(application=request.application)
        serializer = ToolRegisterSerializer(tools, many=True)
        return Response({
            'application': request.application.app_name,
            'count': len(serializer.data),
            'tools': serializer.data
        }, status=status.HTTP_200_OK)

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

