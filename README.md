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
- Vercel (hosting gratuito)

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

## Despliegue en Vercel (Recomendado)

Vercel es la mejor opción para Next.js y es **completamente gratuito**.

**Pasos:**

1. Crea una cuenta en [Vercel](https://vercel.com) usando tu GitHub.
2. Importa este repositorio:
   - Ve a Vercel Dashboard → **Add New → Project**
   - Selecciona el repositorio de GitHub
   - Vercel detecta automáticamente que es Next.js
3. Configura variables de entorno en **Settings → Environment Variables**:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY` (con caracteres `\n` literales)
   - `GOOGLE_SHEET_ID_ACCUMULATE`
   - `ADMIN_PASSWORD`
   - `RESEND_API_KEY`
   - `SCHOOL_FROM_EMAIL`
4. Click **Deploy** — Listo en segundos.
5. Cada push a `main` redeploya automáticamente.

**Plan Free de Vercel:** 100 GB bandwidth/mes, Serverless Functions ilimitadas, sostenible a largo plazo.


## Desarrollo local

```bash
npm install
npm run dev
```

La app estará disponible en `http://localhost:3000`:
- Formulario público: `/` (home)
- Panel administrativo: `/admin` (requiere contraseña)
- Consulta de acumuladas: `/acumuladas`

## Notas

- El correo institucional debe finalizar en `@mep.go.cr`.
- `GOOGLE_PRIVATE_KEY` corresponde a la clave privada de la service account.
- La hoja de cálculo debe compartirse con `GOOGLE_SERVICE_ACCOUNT_EMAIL` como Editor.
- En Vercel, guarda `GOOGLE_PRIVATE_KEY` con los caracteres `\n` literales (no saltos reales de línea).