from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.auth import APIKeyAuthentication
from agent.brain import AgentBrain
from api.serializers import ChatRequestSerializer

class ChatExecutionView(APIView):
    """
    Primary runtime endpoint for voice & text action execution.
    Accepts speech transcript / text message, calls LLM, triggers tools,
    and returns speech audio response + UI update events.
    """
    authentication_classes = [APIKeyAuthentication]

    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        application = request.application

        brain = AgentBrain(application=application)
        result = brain.process_utterance(
            client_user_id=data['client_user_id'],
            session_id=data['session_id'],
            user_message=data['message'],
            service_key=request.headers.get('X-Service-Key', ''),
            is_voice=data.get('is_voice', True)
        )

        return Response(result, status=status.HTTP_200_OK)

