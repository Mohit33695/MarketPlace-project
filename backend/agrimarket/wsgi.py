"""
WSGI config for agrimarket project.
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrimarket.settings')
application = get_wsgi_application()
