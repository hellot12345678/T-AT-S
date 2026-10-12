from typing import Optional, Dict, Any
from .client import TATSClient

def sync_actions(
    api_key: Optional[str] = None,
    engine_url: Optional[str] = None,
    host_url: Optional[str] = None
) -> Dict[str, Any]:
    """
    Utility function to push all local @tats_action functions to the T@S Acoustic Action Engine.
    """
    client = TATSClient(api_key=api_key, base_url=engine_url)
    return client.sync_registry(host_base_url=host_url)
