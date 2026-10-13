from typing import Dict, Any, Tuple

class ToolValidator:
    @staticmethod
    def validate_and_clean(tool_schema: dict, arguments: dict) -> Tuple[bool, dict, str]:
        """
        Validates LLM tool arguments against the tool's schema definition.
        Supports both direct parameter dictionaries and OpenAPI / Function Calling specifications.
        Returns: (is_valid, cleaned_args, error_message)
        """
        cleaned = {}
        schema = tool_schema.get('parameters_schema', {}) if isinstance(tool_schema, dict) else {}

        # Handle OpenAPI / Function Calling formats
        properties = {}
        required_list = []

        if isinstance(schema, dict):
            if 'function' in schema and isinstance(schema['function'], dict):
                params_obj = schema['function'].get('parameters', {})
                if isinstance(params_obj, dict):
                    properties = params_obj.get('properties', {})
                    required_list = params_obj.get('required', [])
            elif 'parameters' in schema and isinstance(schema['parameters'], dict):
                params_obj = schema.get('parameters', {})
                if isinstance(params_obj, dict):
                    properties = params_obj.get('properties', {})
                    required_list = params_obj.get('required', [])
            elif 'properties' in schema and isinstance(schema['properties'], dict):
                properties = schema.get('properties', {})
                required_list = schema.get('required', [])
            else:
                # Direct dictionary format: { 'param_name': { 'type': ..., 'required': ... } }
                properties = schema

        if not isinstance(properties, dict):
            properties = {}

        if not isinstance(required_list, list):
            required_list = []

        # Validate arguments against properties
        for param_name, param_meta in properties.items():
            if not isinstance(param_meta, dict):
                continue

            is_required = (param_name in required_list) or param_meta.get('required', False)
            param_type = param_meta.get('type', 'string')

            if param_name not in arguments:
                if is_required:
                    return False, {}, f"Missing required parameter '{param_name}'."
                continue

            val = arguments[param_name]

            # Type checking and safe coercions
            if param_type == 'enum' or 'enum' in param_meta:
                allowed = param_meta.get('enumValues') or param_meta.get('enum') or []
                if allowed and str(val).lower() not in [str(x).lower() for x in allowed]:
                    matched = [x for x in allowed if str(x).lower() == str(val).lower()]
                    if matched:
                        cleaned[param_name] = matched[0]
                    else:
                        cleaned[param_name] = allowed[0] # Default to first valid enum option safely
                else:
                    cleaned[param_name] = str(val)

            elif param_type == 'number' or param_type == 'integer':
                try:
                    cleaned[param_name] = float(val) if '.' in str(val) else int(val)
                except (ValueError, TypeError):
                    if is_required:
                        return False, {}, f"Parameter '{param_name}' must be a valid number."
                    continue

            elif param_type == 'boolean':
                cleaned[param_name] = str(val).lower() in ('true', '1', 'yes')

            else:
                cleaned[param_name] = str(val)

        # Include any extra arguments that LLM passed if not strictly rejected
        if isinstance(arguments, dict):
            for k, v in arguments.items():
                if k not in cleaned:
                    cleaned[k] = v

        return True, cleaned, ""
