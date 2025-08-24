# 🚀 Быстрое развертывание на snowbetter.ru

## 📋 Быстрый старт

### 1. Подготовка сервера
```bash
# Установить Docker и зависимости
sudo apt update
sudo apt install -y docker.io docker-compose curl nginx certbot python3-certbot-nginx

# Настроить Docker
sudo usermod -aG docker $USER
sudo systemctl enable docker
sudo systemctl start docker
newgrp docker
```

### 2. Клонирование и настройка
```bash
# Клонировать репозиторий
git clone <your-repo-url>
cd ushe_luche

# Создать .env файл
cp env.production .env

# Отредактировать пароли в .env
nano .env
```

**Обязательно изменить в .env:**
- `POSTGRES_PASSWORD` - сложный пароль для базы данных
- `SECRET_KEY` - 32+ символа для JWT токенов
- `REDIS_PASSWORD` - пароль для Redis (опционально)

### 3. Настройка DNS
Убедиться, что домен `snowbetter.ru` указывает на IP сервера:
```bash
# A-запись
snowbetter.ru.     IN  A   YOUR_SERVER_IP
www.snowbetter.ru. IN  A   YOUR_SERVER_IP
```

### 4. Настройка файрвола
```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 5. Развертывание
```bash
# Сделать скрипты исполняемыми
chmod +x scripts/*.sh

# Запустить продакшен
make prod

# Или вручную
./scripts/deploy.sh start
```

### 6. Настройка SSL
```bash
# Автоматическая настройка SSL
make ssl-setup

# Или вручную
export DOMAIN=snowbetter.ru
export CERTBOT_EMAIL=admin@snowbetter.ru
./scripts/initial-ssl-setup.sh
```

## 🔧 Управление

### Основные команды
```bash
make prod              # Запустить продакшен
make prod-stop         # Остановить продакшен
make prod-status       # Статус сервисов
make prod-logs         # Логи
make ssl-renew         # Обновить SSL
make backup            # Создать бэкап
make update            # Обновить приложение
```

### Через скрипты
```bash
./scripts/deploy.sh start      # Запустить
./scripts/deploy.sh stop       # Остановить
./scripts/deploy.sh status     # Статус
./scripts/deploy.sh logs       # Логи
./scripts/deploy.sh backup     # Бэкап
./scripts/deploy.sh update     # Обновить
```

## 🌐 Доступ к приложению

После успешного развертывания:
- **Frontend**: https://snowbetter.ru
- **API**: https://snowbetter.ru/api
- **Health Check**: https://snowbetter.ru/health

## 🔒 SSL сертификаты

- **Автоматическое обновление**: настроено через cron
- **Let's Encrypt**: бесплатные SSL сертификаты
- **HSTS**: включен для безопасности

## 📊 Мониторинг

### Проверка статуса
```bash
# Статус сервисов
make prod-status

# Проверка здоровья
make health

# Логи
make prod-logs
```

### Автоматические бэкапы
```bash
# Создать бэкап
make backup

# Настроить cron для автоматических бэкапов
crontab -e
# Добавить: 0 2 * * * cd /path/to/app && make backup
```

## 🛠️ Устранение неполадок

### Проблемы с SSL
```bash
# Проверить сертификаты
sudo certbot certificates

# Обновить вручную
make ssl-renew
```

### Проблемы с сервисами
```bash
# Проверить логи
make prod-logs

# Перезапустить
make prod-stop && make prod
```

### Проблемы с базой данных
```bash
# Бэкап
make db-backup

# Восстановление
make db-restore file=backup_20231201_120000.sql
```

## 📈 Масштабирование

### Горизонтальное масштабирование
```bash
# Увеличить количество backend инстансов
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Увеличить количество frontend инстансов
docker-compose -f docker-compose.prod.yml up -d --scale frontend=2
```

## 🎯 Чек-лист

- [ ] Сервер подготовлен (Docker, nginx, certbot)
- [ ] Домен snowbetter.ru настроен
- [ ] Файрвол настроен (порты 22, 80, 443)
- [ ] .env файл создан и настроен
- [ ] Приложение развернуто
- [ ] SSL сертификаты получены
- [ ] HTTPS работает
- [ ] API отвечает
- [ ] Автоматическое обновление SSL настроено
- [ ] Бэкапы настроены

## 📞 Поддержка

При проблемах:
1. Проверить логи: `make prod-logs`
2. Проверить статус: `make prod-status`
3. Проверить SSL: `sudo certbot certificates`
4. Создать бэкап: `make backup`

**Успешного развертывания на snowbetter.ru! 🚀**
