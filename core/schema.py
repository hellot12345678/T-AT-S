from drf_spectacular.extensions import OpenApiAuthenticationExtension

class APIKeyAuthScheme(OpenApiAuthenticationExtension):
    target_class = 'core.auth.APIKeyAuthentication'
    name = 'ApiKeyAuth'

    def get_security_definition(self, auto_schema):
        return {
            'type': 'http',
            'scheme': 'bearer',
            'bearerFormat': 'tas_live_*',
            'description': 'Bearer tas_live_... for Application & Agent Chat calls.'
        }


class DeveloperTokenAuthScheme(OpenApiAuthenticationExtension):
    target_class = 'core.auth.DeveloperTokenAuthentication'
    name = 'DevTokenAuth'

    def get_security_definition(self, auto_schema):
        return {
            'type': 'http',
            'scheme': 'bearer',
            'bearerFormat': 'tas_dev_*',
            'description': 'Bearer tas_dev_... for Developer account & app administration.'
        }

