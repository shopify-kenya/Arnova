from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from strawberry.django.views import GraphQLView


@method_decorator(csrf_exempt, name="dispatch")
@method_decorator(csrf_exempt, name="post")
class CSRFExemptGraphQLView(GraphQLView):
    """GraphQL view with CSRF exemption for JWT-based API calls."""

    @csrf_exempt
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)
