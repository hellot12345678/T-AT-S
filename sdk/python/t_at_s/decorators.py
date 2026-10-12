import functools
from typing import Callable, Optional, Dict, Any, Union
from .registry import registry, ActionMeta

def tats_action(
    func_or_name: Optional[Union[Callable, str]] = None,
    description: Optional[str] = None,
    endpoint: Optional[str] = None,
    method: str = "POST",
    parameters: Optional[Dict[str, Any]] = None
):
    """
    Decorator that registers a Python function or view as a T@S AI Action.
    Automatically extracts JSON Schema definitions from Python type annotations and docstrings.

    Usage:
        @tats_action
        def create_task(title: str, priority: str = 'medium') -> dict:
            return {'status': 'created', 'title': title}

        @tats_action(
            name='book_ride',
            description='Books a taxi from pickup to dropoff destination'
        )
        def book_ride(pickup: str, destination: str) -> dict:
            return {'ride_id': 'rd_123', 'status': 'confirmed'}
    """
    def decorator(fn: Callable) -> Callable:
        # Determine action name
        action_name = None
        if isinstance(func_or_name, str):
            action_name = func_or_name

        meta = registry.register(
            func=fn,
            name=action_name,
            description=description,
            endpoint=endpoint,
            method=method,
            parameters=parameters
        )

        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            return fn(*args, **kwargs)

        wrapper._tats_meta = meta
        return wrapper

    if callable(func_or_name):
        # Called as @tats_action without parenthesis
        return decorator(func_or_name)
    else:
        # Called as @tats_action(...)
        return decorator

