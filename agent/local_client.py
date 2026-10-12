import json
import logging
import requests
from typing import List, Dict, Any, Optional
from django.conf import settings

logger = logging.getLogger(__name__)

class OllamaLLMClient:
    """
    Local offline LLM client connecting to Ollama (http://localhost:11434).
    Zero API cost, works without internet.
    """
    def __init__(self, base_url: Optional[str] = None, model: str = 'llama3.3'):
        t_settings = getattr(settings, 'T_AT_S', {})
        self.base_url = (base_url or t_settings.get('OLLAMA_BASE_URL', 'http://localhost:11434')).rstrip('/')
        self.model = model

    def chat_completion(
        self,
        messages: List[Dict[str, Any]],
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.2
    ) -> Dict[str, Any]:
        url = f"{self.base_url}/api/chat"
        payload = {
            'model': self.model,
            'messages': messages,
            'stream': False,
            'options': {'temperature': temperature}
        }
        if tools:
            payload['tools'] = tools

        try:
            res = requests.post(url, json=payload, timeout=30.0)
            if res.status_code == 200:
                data = res.json()
                msg = data.get('message', {})
                tool_calls = []
                for tc in msg.get('tool_calls', []):
                    fn = tc.get('function', {})
                    tool_calls.append({
                        'id': f"call_{fn.get('name')}",
                        'name': fn.get('name'),
                        'arguments': fn.get('arguments', {})
                    })
                return {
                    'success': True,
                    'content': msg.get('content'),
                    'tool_calls': tool_calls if tool_calls else None
                }
            return {
                'success': False,
                'error': f"Ollama HTTP {res.status_code}: {res.text[:100]}",
                'content': None,
                'tool_calls': None
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Could not connect to local Ollama server at {self.base_url}: {e}",
                'content': None,
                'tool_calls': None
            }

