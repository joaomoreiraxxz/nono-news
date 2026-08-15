FROM node:20-alpine

WORKDIR /app

# Copia package.json e instala dependências
COPY package*.json ./
RUN npm install

# Copia todo o código
COPY . .

# Gera o build do frontend
RUN npm run build

# Expõe a porta 3000
EXPOSE 3000

# Inicia o backend
ENV NODE_ENV=production
CMD ["node", "server/index.js"]
