
const cron = require('node-cron');
const axios = require('axios');
const Order = require('../models/Order');

const MOCK_SAP_URL = 'http://localhost:3000/mock/sap/orders'; // cambia si usas otro puerto o ruta

async function sendMockOrders() {
  console.log('[MOCK JOB] Buscando órdenes para enviar al mock SAP...');

  try {
    const pendingOrders = await Order.find({ sentToSAP: false });

    for (const order of pendingOrders) {
      const mockPayload = {
        CardCode: order.customer_id,
        DocDate: new Date().toISOString().slice(0, 10),
        DocumentLines: order.
        lineItems.map(item => ({
          ItemCode: item.sku,
          Quantity: item.quantity,
          UnitPrice: item.price
        }))
      };

      const res = await axios.post(MOCK_SAP_URL, mockPayload);
      console.log(`[MOCK SAP] Orden enviada, respuesta:`, res.data);

      await Order.updateOne({ _id: order._id }, { $set: { sentToSAP: true, sapResponse: res.data } });
    }

  } catch (error) {
    console.error('[MOCK JOB] Error al enviar órdenes al mock SAP:', error.message);
  }
}


// Ejecuta cada 2 minutos
cron.schedule('*/1 * * * *', sendMockOrders);

module.exports = sendMockOrders;
