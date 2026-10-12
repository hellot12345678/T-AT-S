"""
T@S (Talk. Decide. Solve.) — Universal AI Voice Agent SDK for Python & Django.
"You say it. T@S makes it happen."
"""
from .registry import ActionRegistry, registry
from .decorators import tats_action
from .middleware import TATSMiddleware
from .views import TATSDispatchView
from .client import TATSClient
from .sync import sync_actions

__version__ = "1.0.0"

__all__ = [
    "tats_action",
    "ActionRegistry",
    "registry",
    "TATSMiddleware",
    "TATSDispatchView",
    "TATSClient",
    "sync_actions",
    "__version__",
]

