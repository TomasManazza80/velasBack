# Usamos una imagen que ya trae Node y Chrome instalado
FROM ghcr.io/puppeteer/puppeteer:latest

USER root
WORKDIR /usr/src/app

# Copiamos archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiamos el resto del código
COPY . .

# Usamos el puerto que nos de Render
ENV PORT=3001
EXPOSE 3001

CMD [ "node", "app.js" ]