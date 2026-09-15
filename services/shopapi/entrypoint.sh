#!/bin/sh
set -e

echo "Running migrations..."
python manage.py migrate --noinput

echo "Running collectstatic..."
python manage.py collectstatic --noinput

# Idempotent: only creates the account the first time. Leaves it alone on
# every later boot so a password changed by hand in /admin/ is never
# clobbered by a redeploy. No-ops entirely if the env vars aren't set.
echo "Ensuring admin superuser..."
python manage.py shell -c "
import os
from django.contrib.auth import get_user_model

User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', '')

if username and password:
    if User.objects.filter(username=username).exists():
        print(f'Superuser {username!r} already exists, leaving it as-is.')
    else:
        User.objects.create_superuser(username=username, email=email, password=password)
        print(f'Created superuser {username!r}.')
else:
    print('DJANGO_SUPERUSER_USERNAME/PASSWORD not set, skipping superuser bootstrap.')
" || true

echo "Starting server..."
exec gunicorn shopapi.wsgi:application --bind "0.0.0.0:${PORT:-8000}" --workers 4 --threads 2 --timeout 120 --access-logfile - --error-logfile -
