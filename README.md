# Sistema de Horas Acumuladas

Aplicación para gestionar solicitudes de rebajo de horas acumuladas en un centro educativo.

## Funcionalidades

- Formulario público para registro de solicitudes docentes.
- Panel privado de dirección para revisar y resolver solicitudes.
- Persistencia en Google Sheets (una pestaña por cédula).
- Notificaciones por correo para dirección y personal docente.

## Stack

- Next.js 14
- Tailwind CSS
- React Hook Form + Zod
- Resend
- Google Sheets API
- Azure Static Web Apps

## Variables de entorno

Crear `.env.local` en la raíz:

```env
RESEND_API_KEY=
DIRECTOR_EMAIL=
ADMIN_PASSWORD=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_SHEET_ID=
SCHOOL_FROM_EMAIL=
```

Notas para despliegue en Azure Static Web Apps:

- Añade `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID_ACCUMULATE` (id de la hoja usada por acumulaciones), `ADMIN_PASSWORD`, `RESEND_API_KEY`, `SCHOOL_FROM_EMAIL` en la sección "Configuration" de tu Static Web App.
- En Azure, guarda `GOOGLE_PRIVATE_KEY` con los caracteres de nueva línea como `\n` (no pegues saltos de línea reales). El código local ya transforma `\\n` a saltos reales.
- El workflow GitHub Actions `.github/workflows/azure-static-web-apps.yml` está incluido y construye con `npm run build` y despliega el artefacto `.next`.
- Asegúrate de crear el secreto `AZURE_STATIC_WEB_APPS_API_TOKEN` en el repositorio (proporcionado por Azure cuando creas la Static Web App via GitHub).


## Desarrollo local

```bash
npm install
npm run dev
```

- Formulario público: `http://localhost:3000`
- Panel de dirección: `http://localhost:3000/admin`

## Notas

- El correo institucional debe finalizar en `@mep.go.cr`.
- `GOOGLE_PRIVATE_KEY` corresponde a la clave privada de la service account.
- La hoja de cálculo debe compartirse con `GOOGLE_SERVICE_ACCOUNT_EMAIL` como Editor.