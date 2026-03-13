// api/mp-webhook.js
// Recibe notificaciones IPN de Mercado Pago y actualiza Supabase
// Variables de entorno necesarias:
//   MP_ACCESS_TOKEN
//   SUPABASE_URL
//   SUPABASE_SERVICE_KEY  (Service Role Key, distinta a la anon key)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).end();

  const { type, data } = req.body;

  // Solo procesar pagos
  if (type !== 'payment') return res.status(200).end();

  const paymentId = data?.id;
  if (!paymentId) return res.status(400).end();

  try {
    // 1. Consultar estado del pago en MP
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
    });
    const payment = await mpRes.json();

    console.log(`Payment ${paymentId}: ${payment.status} — ${payment.payer?.email}`);

    // 2. Actualizar en Supabase
    const headers = {
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    };

    // Guardar registro de pago
    await fetch(`${process.env.SUPABASE_URL}/rest/v1/payments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        mp_payment_id: String(paymentId),
        amount: payment.transaction_amount,
        status: payment.status,
        payer_email: payment.payer?.email
      })
    });

    // Si fue aprobado, actualizar plan del usuario
    if (payment.status === 'approved') {
      await fetch(`${process.env.SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(payment.payer?.email)}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ plan: 'paid' })
      });
      console.log(`Usuario ${payment.payer?.email} → plan PAID`);
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
}
