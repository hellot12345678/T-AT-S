from rest_framework.throttling import SimpleRateThrottle

class ApplicationRateThrottle(SimpleRateThrottle):
    """
    Throttles runtime requests per Application cluster.
    Free tier allows 60 req/min, Starter tier allows 300 req/min.
    """
    scope = 'application'

    def get_cache_key(self, request, view):
        app = getattr(request, 'application', None)
        if app:
            return f"throttle_app_{app.id}"
        # Fallback to IP if unauthenticated
        return self.get_ident(request)

    def get_rate(self):
        # We can dynamically vary rate based on application's plan_tier
        return '60/minute'


class BurstRateThrottle(SimpleRateThrottle):
    """
    Burst protection: Prevents infinite loops / flood attacks.
    Limits to 10 requests per second.
    """
    scope = 'burst'

    def get_cache_key(self, request, view):
        app = getattr(request, 'application', None)
        if app:
            return f"throttle_burst_{app.id}"
        return self.get_ident(request)

    def get_rate(self):
        return '10/second'

