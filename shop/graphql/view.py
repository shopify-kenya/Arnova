from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from strawberry.django.views import GraphQLView


@method_decorator(csrf_exempt, name="dispatch")
class CSRFExemptGraphQLView(GraphQLView):
    """GraphQL view with CSRF exemption for JWT-based API calls."""
