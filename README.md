# Saber Más · CulturaNews — Guía de Configuración

Stack 100% gratuito | Buenos Aires | WhatsApp + Email | Mercado Pago

## Archivos incluidos
```
saber-mas/
├── index.html              <- Sitio completo
├── api/
│   ├── create-payment.js   <- Backend MP (Vercel serverless)
│   └── mp-webhook.js       <- Webhook IPN de MP
├── vercel.json             <- Configuración Vercel
└── README.md
```

---

## PASO 1 — Subir a Vercel (5 min)

```bash
npm i -g vercel
vercel --prod
```

Obtenés URL como: https://saber-mas-xyz.vercel.app

---

## PASO 2 — Mercado Pago (tus credenciales reales)

1. Ir a mercadopago.com.ar/developers
2. "Mis aplicaciones" → "Crear aplicación" → Nombre: Saber Más
3. Ir a Credenciales de producción y copiar:
   - Public Key → APP_USR-xxxxxxxx
   - Access Token → APP_USR-xxxxxxxx

Cargar en Vercel (Settings → Environment Variables):

| Variable | Valor |
|---|---|
| MP_ACCESS_TOKEN | APP_USR-xxxx (token privado) |

Pegar tu Public Key en index.html:
```javascript
MP_PUBLIC_KEY: 'APP_USR-TU_CLAVE_PUBLICA',
```

Configurar Webhook en MP Developers → tu app → Webhooks:
URL: https://TU-SITIO.vercel.app/api/mp-webhook
Eventos: Pagos

---

## PASO 3 — Supabase

1. supabase.com → New Project → Region: South America (São Paulo)
2. SQL Editor → ejecutar:

```sql
create table users (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  email text unique not null,
  apellido text,
  whatsapp text,
  provincia text default 'Buenos Aires',
  plan text default 'free',
  topics text[],
  regions text[],
  canal_curiosidades text default 'ambos',
  canal_noticias text default 'ambos',
  created_at timestamptz default now()
);

create table test_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  level text,
  score int,
  total int default 20,
  created_at timestamptz default now()
);

create table payments (
  id uuid default gen_random_uuid() primary key,
  mp_payment_id text unique,
  payer_email text,
  amount numeric,
  status text,
  created_at timestamptz default now()
);

create table daily_sends (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id),
  type text,
  content text,
  sent_at timestamptz default now()
);
```

3. Settings → API → copiar URL, anon key y service_role key
4. Cargar en Vercel:

| Variable | Valor |
|---|---|
| SUPABASE_URL | https://xxx.supabase.co |
| SUPABASE_SERVICE_KEY | eyJ... (service role) |

---

## PASO 4 — n8n Automatizaciones (n8n.io, free)

### Workflow A: CURIOSIDADES (disparo: 8:00hs BsAs = 11:00 UTC)
Cron: 0 11 * * *

Flujo:
1. Schedule Trigger (cron)
2. HTTP Request → GET Supabase: /rest/v1/users?topics=not.is.null
3. Split In Batches (de a 1 usuario)
4. HTTP Request → POST Anthropic API:
   - URL: https://api.anthropic.com/v1/messages
   - Model: claude-haiku-20240307
   - Prompt: "Generá 3 datos fascinantes sobre {{topics}} para una persona argentina. Usá emojis. Formato: 1. emoji Dato (2 oraciones max) 2. ... 3. ..."
5. Twilio WhatsApp (si canal = whatsapp o ambos)
6. Resend Email (si canal = email o ambos)
7. INSERT en daily_sends de Supabase

### Workflow B: NOTICIAS (disparo: 7:00hs BsAs = 10:00 UTC)
Cron: 0 10 * * *

Flujo igual pero con prompt de noticias:
"Buscá las 3 noticias más importantes de hoy de: {{regions}}.
- Buenos Aires: infobae.com, clarin.com, telam.com.ar
- Argentina: lanacion.com.ar, pagina12.com.ar, ambito.com
- Mundo: bbc.com/mundo, elpais.com, reuters.com
Formato: TITULO | Resumen 2 oraciones | Fuente"

Variables n8n: ANTHROPIC_API_KEY, TWILIO_SID, TWILIO_TOKEN, RESEND_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY

---

## PASO 5 — Twilio WhatsApp Sandbox

1. twilio.com → Console → Messaging → WhatsApp Sandbox
2. Número sandbox: +1 415 523 8886
3. Cada usuario envía: join [tu-palabra] una sola vez
4. Producción: solicitar número Business

---

## PASO 6 — Resend Email

1. resend.com → Create account
2. Domains → Add domain → Verificar DNS
3. API Keys → Copiar clave

---

## Cambiar precio mensual

En index.html buscar:
  DEFAULT_PRICE: 500,
Cambiar 500 por el monto deseado en ARS.
También editable en tiempo real desde el modal de pago en el sitio.

---

## Variables de entorno — resumen Vercel

MP_ACCESS_TOKEN=APP_USR-xxxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

---

El sitio funciona en modo demo (localStorage) sin configurar nada.
Las integraciones se activan a medida que cargás cada credencial.
