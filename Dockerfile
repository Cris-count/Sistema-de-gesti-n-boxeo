FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG AUTH_API_URL=http://localhost:3001
ARG MEMBERS_API_URL=http://localhost:3002
ARG CLASSES_API_URL=http://localhost:3003
RUN node scripts/write-env.js
RUN npm run build

FROM node:22-alpine

WORKDIR /app
ENV PORT=4000
COPY --from=build /app/dist ./dist
COPY package*.json ./
RUN npm install --omit=dev

EXPOSE 4000
CMD ["npm", "run", "serve:ssr:gestion-gimnasio-boxeo"]
