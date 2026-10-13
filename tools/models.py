import uuid
from django.db import models
from core.models import Application

class RegisteredTool(models.Model):
    METHOD_CHOICES = [
        ('POST', 'POST'),
        ('GET', 'GET'),
        ('PUT', 'PUT'),
        ('DELETE', 'DELETE'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='tools')
    name = models.CharField(max_length=80, help_text="Function identifier, e.g. create_task")
    description = models.TextField(help_text="Clear explanation for the LLM of what this action does")
    endpoint = models.CharField(max_length=255, help_text="Path e.g. /api/v1/tasks/create/ or full URL")
    method = models.CharField(max_length=10, choices=METHOD_CHOICES, default='POST')
    parameters_schema = models.JSONField(
        default=dict,
        help_text="Dictionary of parameters: e.g. {'title': {'type': 'string', 'required': true, 'guide': 'Task title'}}"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('application', 'name')

    def __str__(self):
        return f"{self.application.app_name} -> {self.name}()"

    def to_function_schema(self) -> dict:
        """
        Converts the database tool into a standard OpenAI / Llama 3.3 function-calling definition.
        Handles both:
        1. Full function schema ({'type': 'function', 'function': {...}})
        2. Parameter schema object ({'type': 'object', 'properties': {...}, 'required': [...]})
        3. Flat parameter dictionary ({'title': {'type': 'string', ...}})
        """
        if isinstance(self.parameters_schema, dict):
            # Case 1: Already wrapped as standard function schema
            if 'function' in self.parameters_schema and isinstance(self.parameters_schema['function'], dict):
                return self.parameters_schema
            
            # Case 2: Object-level parameters schema
            if 'properties' in self.parameters_schema and isinstance(self.parameters_schema['properties'], dict):
                return {
                    'type': 'function',
                    'function': {
                        'name': self.name,
                        'description': self.description,
                        'parameters': self.parameters_schema
                    }
                }

        properties = {}
        required = []

        if isinstance(self.parameters_schema, dict):
            for param_name, param_meta in self.parameters_schema.items():
                if not isinstance(param_meta, dict):
                    properties[param_name] = {
                        'type': 'string',
                        'description': str(param_meta) if param_meta else f'{param_name} parameter'
                    }
                    continue

                param_type = param_meta.get('type', 'string')
                p_def = {
                    'description': param_meta.get('guide', param_meta.get('description', f'{param_name} parameter'))
                }

                if param_type == 'enum':
                    p_def['type'] = 'string'
                    p_def['enum'] = param_meta.get('enumValues', ['low', 'medium', 'high'])
                elif param_type == 'datetime':
                    p_def['type'] = 'string'
                    p_def['format'] = 'date-time'
                elif param_type in ('number', 'integer'):
                    p_def['type'] = param_type
                elif param_type == 'boolean':
                    p_def['type'] = 'boolean'
                else:
                    p_def['type'] = 'string'

                properties[param_name] = p_def

                if param_meta.get('required', False):
                    required.append(param_name)

        return {
            'type': 'function',
            'function': {
                'name': self.name,
                'description': self.description,
                'parameters': {
                    'type': 'object',
                    'properties': properties,
                    'required': required
                }
            }
        }

