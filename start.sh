#!/bin/bash

echo "🏂 Запускаем приложение 'Уже лучше'..."

# Останавливаем предыдущие контейнеры
echo "Останавливаем предыдущие контейнеры..."
docker compose down

# Пересобираем контейнеры
echo "Собираем контейнеры..."
docker compose build

# Запускаем приложение
echo "Запускаем приложение..."
docker compose up

echo "✅ Приложение запущено!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "API документация: http://localhost:8000/docs"
