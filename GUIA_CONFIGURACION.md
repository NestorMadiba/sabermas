# 🎓 Saber Más · Guía de Instalación y Configuración

## Stack tecnológico (todo gratuito)
- **Frontend**: HTML + CSS + JS puro → desplegado en Vercel (gratis)
- **Base de datos + Auth**: Supabase (gratis hasta 500MB y 50.000 usuarios)
- **Pagos**: Mercado Pago (comisión por transacción, sin costo fijo)
- **Automatizaciones IA**: Make.com o n8n (gratis con límites generosos)

---

## PASO 1 · Configurar Supabase

1. Ir a **https://supabase.com** → crear cuenta gratuita
2. Crear nuevo proyecto (elegí región: South America)
3. En el panel: **SQL Editor** → pegar y ejecutar todo el contenido de `supabase_schema.sql`
4. En **Settings > API**, copiar:
   - `Project URL` → reemplazar `YOUR_PROJECT.supabase.co` en index.html
   - `anon public key` → reemplazar `YOUR_ANON_KEY` en index.html
5. En **Authentication > Settings**: activar confirmación por email (opcional para producción)

---

## PASO 2 · Configurar Mercado Pago

1. Ir a **https://www.mercadopago.com.ar** → ingresar a tu cuenta
2. Crear un **Link de pago**:
   - Panel → Cobros → Link de pago → Crear nuevo
   - Título: "Saber Más - Acceso Mensual"
   - Monto: el que definas (ej. $500 ARS)
   - Copiar el link generado (ej: `https://mpago.la/XXXXXXX`)
3. En `index.html`, línea `const MP_PAYMENT_LINK`, pegar tu link
4. Para cambiar el precio mostrado: modificar `const PRECIO_MENSUAL = 500`

### Webhooks de verificación de pago (avanzado):
- En tu cuenta MP → Configuración → Webhooks
- URL: `https://tu-proyecto.vercel.app/api/mp-webhook`
- Esto permite verificar pagos automáticamente (requiere función serverless en Vercel)

---

## PASO 3 · Desplegar en Vercel

### Opción A: Con GitHub (recomendado)
1. Crear repositorio en GitHub con los 3 archivos del proyecto
2. Ir a **https://vercel.com** → "Add New Project"
3. Conectar tu repositorio de GitHub
4. Deploy automático → obtenés URL como `saber-mas.vercel.app`
5. Podés conectar tu dominio propio gratis

### Opción B: Drag & Drop
1. Ir a **https://vercel.com/new**
2. Arrastrar la carpeta del proyecto
3. Deploy instantáneo

---

## PASO 4 · Automatización IA con Make.com

### Automatización 1: Envío de conocimiento diario (Módulo 2)
1. Crear cuenta en **https://make.com** (gratis: 1000 operaciones/mes)
2. Crear nuevo escenario:
   - **Trigger**: Schedule (cada día a las 9:00 AM)
   - **Módulo 1**: Supabase → buscar usuarios con `learn_prefs` configuradas
   - **Módulo 2**: Claude/OpenAI API → generar 3 datos/curiosidades según temas del usuario
   - **Módulo 3**: Si delivery = 'mail' → Gmail/SendGrid → enviar email
   - **Módulo 4**: Si delivery = 'wp' → Twilio/WhatsApp Business API → enviar mensaje

**Prompt sugerido para la IA:**
```
Generá 3 datos curiosos, fascinantes e informativos sobre los siguientes temas: {topics}.
Formato: tres párrafos cortos (2-3 oraciones cada uno), escritos en español argentino, 
tono culto pero accesible. Incluí fuente cuando sea posible.
```

### Automatización 2: Resumen de noticias diario (Módulo 3)
1. Nuevo escenario en Make.com:
   - **Trigger**: Schedule (cada día a las 7:00 AM)
   - **Módulo 1**: Supabase → buscar usuarios con `news_prefs`
   - **Módulo 2**: HTTP Request → RSS feeds de portales principales:
     - **Salta**: https://www.eltribuno.com/salta/rss.xml
     - **Argentina**: https://www.infobae.com/feeds/rss/ y https://www.lanacion.com.ar/arc/outboundfeeds/rss/
     - **Mundo**: https://feeds.bbci.co.uk/mundo/rss.xml
   - **Módulo 3**: Claude/GPT → resumir y seleccionar las 3 noticias más relevantes
   - **Módulo 4**: Enviar por email/WhatsApp según preferencia

---

## PASO 5 · WhatsApp Business (para envíos)

### Opción gratuita (limitada): Twilio Sandbox
1. **https://twilio.com** → crear cuenta
2. Activar WhatsApp Sandbox
3. Los usuarios deben enviar un mensaje primero para activar

### Opción paga pero económica: Z-API o Ultramsg
- **https://z-api.io** o **https://ultramsg.com**
- ~$10 USD/mes, fácil integración con Make.com

---

## Configuración de variables en index.html

```javascript
const SUPABASE_URL = 'https://XXXXX.supabase.co';     // Tu URL de Supabase
const SUPABASE_KEY = 'eyJhbG...';                       // Tu anon key
const MP_PAYMENT_LINK = 'https://mpago.la/XXXXXX';     // Tu link de MP
const PRECIO_MENSUAL = 500;                              // Precio en ARS (editable)
```

---

## Estructura de archivos

```
saber-mas/
├── index.html          ← El sitio completo (1 archivo)
├── vercel.json         ← Configuración de Vercel
└── supabase_schema.sql ← Ejecutar en Supabase una vez
```

---

## Dominio personalizado (gratis con Vercel)
1. Comprar dominio en NIC.ar (dominios .ar desde ~$500 ARS/año)
2. En Vercel: Settings → Domains → agregar tu dominio
3. Seguir instrucciones DNS (apuntar nameservers a Vercel)

---

## Costos estimados mensuales
| Servicio | Plan | Costo |
|----------|------|-------|
| Vercel | Hobby | $0 |
| Supabase | Free | $0 |
| Make.com | Free (1000 ops) | $0 |
| WhatsApp API | Z-API Básico | ~$10 USD |
| Dominio .com.ar | NIC.ar | ~$3 USD |
| **TOTAL** | | ~$13 USD/mes |

Mercado Pago cobra ~3.99% por transacción (sin costo fijo).
