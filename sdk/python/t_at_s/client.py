import os
import requests
from typing import Dict, Any, Optional, List
from .registry import registry

class TATSClient:
    """
    Python client for interacting with the T@S Acoustic Action Engine.
    Enables programmatic chat execution, tool registration, and agent configuration.
    """
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        service_key: Optional[str] = None,
        timeout: float = 10.0
    ):
        self.api_key = api_key or os.getenv('T_AT_S_API_KEY', '')
        self.base_url = (base_url or os.getenv('T_AT_S_ENGINE_URL', 'http://127.0.0.1:8000')).rstrip('/')
        self.service_key = service_key or os.getenv('T_AT_S_SERVICE_KEY', '')
        self.timeout = timeout

    @property
    def headers(self) -> Dict[str, str]:
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'T@S-Python-SDK/1.0.0',
        }
        if self.api_key:
            headers['Authorization'] = f'Bearer {self.api_key}'
        if self.service_key:
            headers['X-Service-Key'] = self.service_key
        return headers

    def health(self) -> Dict[str, Any]:
        """Checks the health of the T@S Engine."""
        url = f"{self.base_url}/api/v1/health/"
        res = requests.get(url, headers=self.headers, timeout=self.timeout)
        res.raise_for_status()
        return res.json()

    def chat(
        self,
        client_user_id: str,
        session_id: str,
        message: str,
        passphrase: str = "",
        is_voice: bool = True
    ) -> Dict[str, Any]:
        """
        Sends an end-user voice or text query to the T@S Agent Brain.
        Returns spoken response, events, and token/unit accounting.
        """
        url = f"{self.base_url}/api/v1/chat/"
        payload = {
            'client_user_id': str(client_user_id),
            'session_id': str(session_id),
            'message': message,
            'passphrase': passphrase,
            'is_voice': is_voice,
        }
        res = requests.post(url, json=payload, headers=self.headers, timeout=self.timeout)
        res.raise_for_status()
        return res.json()

    def register_tool(
        self,
        name: str,
        description: str,
        endpoint: str,
        parameters_schema: Dict[str, Any],
        method: str = "POST"
    ) -> Dict[str, Any]:
        """
        Registers a single action tool with the T@S Engine.
        """
        url = f"{self.base_url}/api/v1/tools/register/"
        payload = {
            'name': name,
            'description': description,
            'endpoint': endpoint,
            'method': method.upper(),
            'parameters_schema': parameters_schema,
            'is_active': True,
        }
        res = requests.post(url, json=payload, headers=self.headers, timeout=self.timeout)
        res.raise_for_status()
        return res.json()

    def list_tools(self) -> Dict[str, Any]:
        """Lists all registered tools for the authenticated application."""
        url = f"{self.base_url}/api/v1/tools/"
        res = requests.get(url, headers=self.headers, timeout=self.timeout)
        res.raise_for_status()
        return res.json()

    def get_user_config(self, client_user_id: str) -> Dict[str, Any]:
        """Retrieves user-level voice preferences (wake-word, tier)."""
        url = f"{self.base_url}/api/v1/users/{client_user_id}/config/"
        res = requests.get(url, headers=self.headers, timeout=self.timeout)
        res.raise_for_status()
        return res.json()

    def update_user_config(
        self,
        client_user_id: str,
        wake_word: Optional[str] = None,
        voice_tier: Optional[str] = None,
        passphrase: Optional[str] = None
    ) -> Dict[str, Any]:
        """Updates user-level voice preferences."""
        url = f"{self.base_url}/api/v1/users/{client_user_id}/config/"
        payload = {}
        if wake_word:
            payload['wake_word'] = wake_word
        if voice_tier:
            payload['voice_tier'] = voice_tier
        if passphrase:
            payload['passphrase'] = passphrase

        res = requests.post(url, json=payload, headers=self.headers, timeout=self.timeout)
        res.raise_for_status()
        return res.json()

    def sync_registry(self, host_base_url: Optional[str] = None) -> Dict[str, Any]:
        """
        Synchronizes all local @tats_action functions from ActionRegistry to the T@S Engine.
        """
        actions = registry.list_actions()
        synced = []
        errors = []

        for name, meta in actions.items():
            endpoint = meta.endpoint
            if host_base_url and not endpoint.startswith(('http://', 'https://')):
                endpoint = f"{host_base_url.rstrip('/')}/{endpoint.lstrip('/')}"

            try:
                result = self.register_tool(
                    name=meta.name,
                    description=meta.description,
                    endpoint=endpoint,
                    parameters_schema=meta.parameters_schema,
                    method=meta.method
                )
                synced.append(meta.name)
            except Exception as e:
                errors.append({'action': meta.name, 'error': str(e)})

        return {
            'total_actions': len(actions),
            'synced_count': len(synced),
            'synced': synced,
            'errors': errors
        }

