from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from core.auth import APIKeyAuthentication
from agent.brain import AgentBrain, QuotaExceededError
from api.serializers import ChatRequestSerializer

class ChatExecutionView(APIView):
    """
    Primary runtime endpoint for voice & text action execution.
    Accepts speech transcript / text message, calls LLM, triggers tools,
    enforces accounting quotas, and returns speech audio response + UI update events.
    """
    authentication_classes = [APIKeyAuthentication]

    @extend_schema(
        tags=['Acoustic Action Engine'],
        summary='Execute Voice / Text Command',
        description=(
            'Processes human utterance through the Agent Brain. Orchestrates Llama 3.3 reasoning, '
            'auto-detects tool intents, dispatches authenticated HTTP actions to developer endpoints, '
            'enforces monthly unit quotas (with 10% grace buffer), and returns synthesized spoken response.'
        ),
        request=ChatRequestSerializer,
        parameters=[
            OpenApiParameter(
                name='Authorization',
                type=str,
                location=OpenApiParameter.HEADER,
                description='Bearer API Key: Bearer tas_live_...',
                required=True
            ),
            OpenApiParameter(
                name='X-Service-Key',
                type=str,
                location=OpenApiParameter.HEADER,
                description='Developer secret service key passed for high-privilege backend-to-backend operations.',
                required=False
            ),
        ],
        examples=[
            OpenApiExample(
                'Task Creation Example',
                value={
                    'client_user_id': 'user_102',
                    'session_id': 'sess_acme_8812',
                    'message': 'Create a high priority task to review Q3 budget by 5 PM',
                    'passphrase': 'blue_phoenix_alpha',
                    'is_voice': True
                },
                request_only=True
            )
        ],
        responses={
            200: dict,
            429: dict
        }
    )
    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        application = request.application

        brain = AgentBrain(application=application)
        try:
            result = brain.process_utterance(
                client_user_id=data['client_user_id'],
                session_id=data['session_id'],
                user_message=data['message'],
                service_key=request.headers.get('X-Service-Key', ''),
                is_voice=data.get('is_voice', True)
            )
        except QuotaExceededError as qe:
            return Response({
                'error': 'QUOTA_EXHAUSTED',
                'message': str(qe),
                'quota_status': qe.quota_status,
                'upgrade_url': f'/api/v1/apps/{application.id}/upgrade/'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)

        response = Response(result, status=status.HTTP_200_OK)
        if result.get('grace_buffer_active'):
            response['X-TATS-Grace-Buffer'] = 'active'
        return response

