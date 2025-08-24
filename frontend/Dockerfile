FROM node:18-alpine

WORKDIR /app

# Копируем package.json
COPY package.json ./

# Устанавливаем зависимости
RUN npm install --silent

# Копируем исходный код
COPY . .

# Открываем порт
EXPOSE 3000

# Команда для запуска в development режиме
CMD ["npm", "start"]
