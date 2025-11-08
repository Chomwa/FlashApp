from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

def health_check(request):
    return JsonResponse({
        'status': 'healthy',
        'app': 'Flash Payment App',
        'version': '1.0.0',
        'database': 'connected',
        'environment': 'production' if not settings.DEBUG else 'development'
    })

urlpatterns = [
    path('', health_check, name='health'),  # Root health check
    path('health/', health_check, name='health-check'),  # Explicit health check
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API endpoints
    path('api/auth/', include('users.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/transactions/', include('transactions.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)