require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para procesar JSON sin alterar la firma de Shopify
app.use(bodyParser.json({ verify: (req, res, buf) => { req.rawBody = buf } }));

// Ruta para recibir el webhook
app.post('/webhook', (req, res) => {
    const hmacHeader = req.headers['x-shopify-hmac-sha256'];
    const shopDomain = req.headers['x-shopify-shop-domain'];
    const body = req.rawBody;

    if (!verifyWebhook(hmacHeader, body)) {
        console.log('Firma HMAC inválida. Shopify no está autorizado.');
        return res.status(401).send('No autorizado');
    }

    console.log(`Webhook recibido de ${shopDomain}`);

     // Parseamos la orden recibida
     const order = req.body;
     console.log('Orden recibida:', order);
 
     // Aquí puedes procesar la orden, guardarla en una BD, etc.
 
     res.status(200).send('Orden recibida con éxito');
 });

 // Función para verificar la firma HMAC de Shopify
function verifyWebhook(hmacHeader, body) {
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
    const hash = crypto.createHmac('sha256', secret).update(body).digest('base64');
    return hash === hmacHeader;
}

// Servidor en marcha
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});