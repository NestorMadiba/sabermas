// api/create-payment.js
// Vercel Serverless Function — Mercado Pago Checkout Pro
// Configurar en Vercel → Settings → Environment Variables:
//   MP_ACCESS_TOKEN = APP_USR-xxxxxxxxxxxx  (tu credencial privada)

export default async function handler(req, res) {
  // CORS para tu dominio
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, user_email, description, back_url } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Monto inválido' });
  }

  const baseUrl = back_url?.split('/?')[0] || 'https://tu-sitio.vercel.app';

  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `saber-mas-${Date.now()}`
      },
      body: JSON.stringify({
        items: [{
          id: 'saber-mas-mensual',
          title: description || 'Saber Más — Suscripción Mensual',
          description: 'Acceso completo a tests, curiosidades y noticias',
          category_id: 'services',
          quantity: 1,
          currency_id: 'ARS',
          unit_price: parseFloat(amount)
        }],
        payer: {
          email: user_email || 'usuario@sabemas.com'
        },
        back_urls: {
          success: `${baseUrl}/?payment=success`,
          failure: `${baseUrl}/?payment=failure`,
          pending: `${baseUrl}/?payment=pending`
        },
        auto_return: 'approved',
        notification_url: `${baseUrl}/api/mp-webhook`,
        statement_descriptor: 'SABER MAS',
        external_reference: `saber-mas-${Date.now()}`,
        expires: false,
        // Para Argentina: habilitar todos los medios
        payment_methods: {
          excluded_payment_types: [],
          installments: 1
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('MP Error:', data);
      return res.status(500).json({ error: 'Error creando preferencia en MP', detail: data });
    }

    // Devolver URL de pago
    return res.status(200).json({
      pref_id: data.id,
      init_point: data.init_point,           // Producción
      sandbox_init_point: data.sandbox_init_point // Sandbox/testing
    });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
