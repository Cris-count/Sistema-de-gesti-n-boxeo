# Gestion de Gimnasio Boxeo

Aplicacion full-stack para administrar un gimnasio de boxeo con Angular, API REST en microservicios, JWT, roles y dos bases de datos.

## Arquitectura

- `frontend`: Angular 21 con login, registro, manejo de roles y vistas CRUD.
- `backend/auth-service`: autenticacion JWT, registro/login y usuarios en PostgreSQL.
- `backend/members-service`: CRUD de boxeadores, protegido con JWT, persistencia en MySQL.
- `backend/classes-service`: CRUD de clases, protegido con JWT, persistencia en PostgreSQL.
- `docker-compose.yml`: levanta frontend, microservicios, MySQL y PostgreSQL.

## Roles

- `ADMIN`: puede crear, leer, editar y eliminar boxeadores y clases.
- `USER`: puede iniciar sesion y consultar boxeadores y clases.

Credenciales iniciales:

```txt
Email: admin@ringbox.local
Password: Admin123
Rol: ADMIN
```

## Ejecutar localmente con Docker

```bash
docker compose up -d --build
```

URLs locales:

- Frontend: http://localhost:4200
- Auth service: http://localhost:3001
- Members service: http://localhost:3002
- Classes service: http://localhost:3003

## Ejecutar frontend en desarrollo

```bash
npm install
npm start
```

## Endpoints principales

Auth:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

Boxeadores:

- `GET /members`
- `POST /members`
- `PUT /members/:id`
- `DELETE /members/:id`

Clases:

- `GET /classes`
- `POST /classes`
- `PUT /classes/:id`
- `DELETE /classes/:id`

Los endpoints de boxeadores y clases requieren header:

```txt
Authorization: Bearer <token>
```

## Preparar despliegue

Al construir el frontend para nube, cambia los argumentos del build para que Angular consuma las URLs publicas de los backends:

```bash
docker build ^
  --build-arg AUTH_API_URL=https://tu-auth.onrender.com ^
  --build-arg MEMBERS_API_URL=https://tu-members.onrender.com ^
  --build-arg CLASSES_API_URL=https://tu-classes.onrender.com ^
  -t gestion-gimnasio-boxeo-frontend .
```

Para despliegues sin Docker, actualiza `src/environments/environment.prod.ts` con esas mismas URLs antes de `npm run build`.
