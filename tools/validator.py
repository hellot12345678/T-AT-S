from typing import Dict, Any, Tuple

class ToolValidator:
    @staticmethod
    def validate_and_clean(tool_schema: dict, arguments: dict) -> Tuple[bool, dict, str]:
        """
        Validates LLM tool arguments against the tool's schema definition.
        Returns: (is_valid, cleaned_args, error_message)
        """
        cleaned = {}
        parameters_meta = tool_schema.get('parameters_schema', {})

        for param_name, param_meta in parameters_meta.items():
            is_required = param_meta.get('required', False)
            param_type = param_meta.get('type', 'string')

            if param_name not in arguments:
                if is_required:
                    return False, {}, f"Missing required parameter '{param_name}'."
                continue

            val = arguments[param_name]

            # Type checking and safe coercions
            if param_type == 'enum':
                allowed = param_meta.get('enumValues', [])
                if allowed and str(val).lower() not in [str(x).lower() for x in allowed]:
                    # If LLM guessed close, attempt fallback or error
                    matched = [x for x in allowed if str(x).lower() == str(val).lower()]
                    if matched:
                        cleaned[param_name] = matched[0]
                    else:
                        cleaned[param_name] = allowed[0] # Default to first valid enum option safely
                else:
                    cleaned[param_name] = str(val)

            elif param_type == 'number':
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
        for k, v in arguments.items():
            if k not in cleaned:
                cleaned[k] = v

        return True, cleaned, ""

