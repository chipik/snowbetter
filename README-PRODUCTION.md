# 🚀 Production Deployment Guide

Руководство по развертыванию приложения "Уже лучше" в продакшене с SSL сертификатами Let's Encrypt.

## 📋 Предварительные требования

### Системные требования
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: Минимум 2GB (рекомендуется 4GB+)
- **CPU**: 2 ядра (рекомендуется 4+)
- **Диск**: 20GB+ свободного места
- **Домен**: Настроенный DNS с A-записью на IP сервера

### Установленные пакеты
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y docker.io docker-compose curl nginx certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install -y docker docker-compose curl nginx certbot python3-certbot-nginx
```

### Настройка Docker
```bash
# Добавить пользователя в группу docker
sudo usermod -aG docker $USER
sudo systemctl enable docker
sudo systemctl start docker

# Перезайти в систему или выполнить
newgrp docker
```

## 🔧 Настройка

### 1. Клонирование репозитория
```bash
git clone <your-repo-url>
cd ushe_luche
```

### 2. Настройка переменных окружения
```bash
# Скопировать пример файла
cp env.production.example .env

# Отредактировать файл
nano .env
```

**Обязательные переменные:**
```bash
DOMAIN=snowbetter.ru
CERTBOT_EMAIL=admin@snowbetter.ru
POSTGRES_PASSWORD=your_super_secure_password
SECRET_KEY=your_32_char_secret_key
```

### 3. Создание необходимых директорий
```bash
mkdir -p nginx/ssl nginx/webroot logs backups uploads
chmod 755 nginx/ssl nginx/webroot logs backups uploads
```

### 4. Настройка DNS
Убедитесь, что ваш домен указывает на IP сервера:
```bash
# A-запись
snowbetter.ru.     IN  A   YOUR_SERVER_IP
www.snowbetter.ru. IN  A   YOUR_SERVER_IP
```

### 5. Настройка файрвола
```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 🚀 Развертывание

### 1. Первоначальная настройка SSL
```bash
# Сделать скрипты исполняемыми
chmod +x scripts/*.sh

# Установить переменные окружения
export DOMAIN=snowbetter.ru
export CERTBOT_EMAIL=admin@snowbetter.ru

# Запустить первоначальную настройку SSL
./scripts/initial-ssl-setup.sh
```

### 2. Запуск всех сервисов
```bash
# Запустить все сервисы
docker-compose -f docker-compose.prod.yml up -d

# Проверить статус
docker-compose -f docker-compose.prod.yml ps

# Посмотреть логи
docker-compose -f docker-compose.prod.yml logs -f
```

### 3. Проверка работоспособности
```bash
# Проверить HTTP (должен редиректить на HTTPS)
curl -I http://snowbetter.ru

# Проверить HTTPS
curl -I https://snowbetter.ru

# Проверить API
curl -I https://snowbetter.ru/api/health
```

## 🔒 Безопасность

### SSL сертификаты
- **Автоматическое обновление**: Настроено через cron
- **HSTS**: Включен для всех HTTPS соединений
- **Security Headers**: Настроены в Nginx

### База данных
- **Пароли**: Используйте сложные пароли
- **Доступ**: Только из внутренней сети Docker
- **Бэкапы**: Автоматические через volumes

### Файрвол
- **Порты**: Открыты только 22, 80, 443
- **Docker**: Изолированная сеть
- **Rate Limiting**: Настроено для API

## 📊 Мониторинг

### Логи
```bash
# Nginx логи
tail -f logs/nginx/access.log
tail -f logs/nginx/error.log

# Backend логи
docker-compose -f docker-compose.prod.yml logs -f backend

# SSL обновления
tail -f logs/ssl-renewal.log
```

### Health Checks
```bash
# Проверить здоровье сервисов
curl https://snowbetter.ru/health
curl https://snowbetter.ru/api/health

# Docker health checks
docker-compose -f docker-compose.prod.yml ps
```

## 🔄 Обновления

### 1. Остановка сервисов
```bash
docker-compose -f docker-compose.prod.yml down
```

### 2. Обновление кода
```bash
git pull origin main
```

### 3. Пересборка и запуск
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### 4. Проверка
```bash
docker-compose -f docker-compose.prod.yml ps
curl -I https://snowbetter.ru
```

## 🛠️ Устранение неполадок

### Проблемы с SSL
```bash
# Проверить сертификаты
sudo certbot certificates

# Обновить вручную
./scripts/renew-ssl.sh

# Проверить логи
docker-compose -f docker-compose.prod.yml logs certbot
```

### Проблемы с Nginx
```bash
# Проверить конфигурацию
docker-compose -f docker-compose.prod.yml exec nginx nginx -t

# Перезагрузить конфигурацию
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload

# Перезапустить Nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### Проблемы с базой данных
```bash
# Проверить подключение
docker-compose -f docker-compose.prod.yml exec postgres psql -U ushe_luche_user -d ushe_luche_prod

# Проверить логи
docker-compose -f docker-compose.prod.yml logs postgres
```

## 📈 Масштабирование

### Горизонтальное масштабирование
```bash
# Увеличить количество backend инстансов
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Увеличить количество frontend инстансов
docker-compose -f docker-compose.prod.yml up -d --scale frontend=2
```

### Load Balancer
Для продакшена рекомендуется использовать внешний load balancer (HAProxy, Nginx Plus, или облачные решения).

## 🗄️ Бэкапы

### Автоматические бэкапы
```bash
# Создать скрипт для бэкапов
nano scripts/backup.sh

# Добавить в cron
0 2 * * * /path/to/scripts/backup.sh >> /path/to/logs/backup.log 2>&1
```

### Ручные бэкапы
```bash
# Бэкап базы данных
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U ushe_luche_user ushe_luche_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Бэкап загруженных файлов
tar -czf uploads_$(date +%Y%m%d_%H%M%S).tar.gz uploads/
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `docker-compose -f docker-compose.prod.yml logs`
2. Проверьте статус сервисов: `docker-compose -f docker-compose.prod.yml ps`
3. Проверьте SSL сертификаты: `sudo certbot certificates`
4. Обратитесь к документации или создайте issue

## 🎯 Чек-лист развертывания

- [ ] Системные требования выполнены
- [ ] Docker и Docker Compose установлены
- [ ] Домен настроен и указывает на сервер
- [ ] Файрвол настроен (порты 22, 80, 443)
- [ ] Переменные окружения настроены
- [ ] SSL сертификаты получены
- [ ] Все сервисы запущены
- [ ] HTTPS работает корректно
- [ ] API отвечает
- [ ] Автоматическое обновление SSL настроено
- [ ] Бэкапы настроены
- [ ] Мониторинг настроен

**Успешного развертывания! 🚀**
