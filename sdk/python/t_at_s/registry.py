import inspect
import re
from enum import Enum
from datetime import datetime, date
from typing import get_type_hints, Callable, Dict, Any, Optional

class ActionMeta:
    """
    Metadata representation of a tool/action registered with T@S.
    """
    def __init__(
        self,
        name: str,
        func: Callable,
        description: str,
        endpoint: str,
        method: str,
        parameters_schema: Dict[str, Any],
        takes_user_id: bool = False,
        takes_request: bool = False
    ):
        self.name = name
        self.func = func
        self.description = description
        self.endpoint = endpoint
        self.method = method.upper()
        self.parameters_schema = parameters_schema
        self.takes_user_id = takes_user_id
        self.takes_request = takes_request

    def to_tool_dict(self) -> Dict[str, Any]:
        return {
            'name': self.name,
            'description': self.description,
            'endpoint': self.endpoint,
            'method': self.method,
            'parameters_schema': self.parameters_schema,
            'is_active': True,
        }


class ActionRegistry:
    """
    Thread-safe registry for actions exposed to the T@S Acoustic Action Engine.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ActionRegistry, cls).__new__(cls)
            cls._instance._actions = {}
        return cls._instance

    def register(
        self,
        func: Callable,
        name: Optional[str] = None,
        description: Optional[str] = None,
        endpoint: Optional[str] = None,
        method: str = "POST",
        parameters: Optional[Dict[str, Any]] = None
    ) -> ActionMeta:
        action_name = name or func.__name__
        action_desc = description or (func.__doc__ or "").strip().split("\n")[0] or f"Executes {action_name}"
        action_endpoint = endpoint or f"/api/tats/actions/{action_name}/"

        # Inspect parameters and auto-generate schema
        sig = inspect.signature(func)
        try:
            type_hints = get_type_hints(func)
        except Exception:
            type_hints = {}

        schema = {}
        takes_user_id = False
        takes_request = False

        # Parse docstring for parameter guides
        doc = func.__doc__ or ""
        doc_guides = self._parse_doc_params(doc)

        for param_name, param in sig.parameters.items():
            if param_name in ('self', 'cls'):
                continue
            if param_name in ('user_id', 'client_user_id', 'tats_user_id'):
                takes_user_id = True
                continue
            if param_name == 'request':
                takes_request = True
                continue

            param_type_hint = type_hints.get(param_name, Any)
            is_required = (param.default == inspect.Parameter.empty)

            # Map Python types to T@S Schema types
            tats_type = 'string'
            enum_values = None

            if isinstance(param_type_hint, type) and issubclass(param_type_hint, Enum):
                tats_type = 'enum'
                enum_values = [e.value for e in param_type_hint]
            elif param_type_hint in (int, float):
                tats_type = 'number'
            elif param_type_hint is bool:
                tats_type = 'boolean'
            elif param_type_hint in (datetime, date):
                tats_type = 'datetime'
            else:
                tats_type = 'string'

            guide = doc_guides.get(param_name, f"{param_name.replace('_', ' ').capitalize()} parameter")

            # Check if explicit override exists in parameters dict
            if parameters and param_name in parameters:
                override = parameters[param_name]
                if isinstance(override, dict):
                    tats_type = override.get('type', tats_type)
                    guide = override.get('guide', override.get('description', guide))
                    is_required = override.get('required', is_required)
                    enum_values = override.get('enumValues', enum_values)

            param_def = {
                'type': tats_type,
                'required': is_required,
                'guide': guide
            }
            if enum_values:
                param_def['enumValues'] = enum_values

            schema[param_name] = param_def

        # Allow explicit parameters not in function signature
        if parameters:
            for p_name, p_meta in parameters.items():
                if p_name not in schema and p_name not in ('user_id', 'client_user_id', 'request'):
                    schema[p_name] = p_meta

        meta = ActionMeta(
            name=action_name,
            func=func,
            description=action_desc,
            endpoint=action_endpoint,
            method=method,
            parameters_schema=schema,
            takes_user_id=takes_user_id,
            takes_request=takes_request
        )

        self._actions[action_name] = meta
        return meta

    def get(self, name: str) -> Optional[ActionMeta]:
        return self._actions.get(name)

    def list_actions(self) -> Dict[str, ActionMeta]:
        return dict(self._actions)

    def clear(self):
        self._actions.clear()

    def _parse_doc_params(self, docstring: str) -> Dict[str, str]:
        """
        Parses Google or Sphinx format docstrings for parameter descriptions:
        :param name: description
        or Args:
           name: description
        """
        guides = {}
        if not docstring:
            return guides

        # Sphinx style :param name: description
        sphinx_matches = re.findall(r":param\s+([a-zA-Z0-9_]+)\s*:\s*(.+)", docstring)
        for name, desc in sphinx_matches:
            guides[name] = desc.strip()

        # Google style (Args:\n  name: description)
        args_match = re.search(r"Args:\s*\n((?:\s+[a-zA-Z0-9_]+:.*?\n)+)", docstring)
        if args_match:
            lines = args_match.group(1).split("\n")
            for line in lines:
                parts = line.strip().split(":", 1)
                if len(parts) == 2:
                    p_name = parts[0].strip()
                    p_desc = parts[1].strip()
                    if p_name and p_desc:
                        guides[p_name] = p_desc

        return guides


# Global registry singleton
registry = ActionRegistry()

