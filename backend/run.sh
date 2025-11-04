#!/bin/bash
export DATABASE_URL="postgresql://flashuser:flashpass@localhost:5435/flashdb"
export REDIS_URL="redis://localhost:6381/0"
python manage.py runserver