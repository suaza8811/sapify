const cron = require('node-cron');
const Order = require('../models/Order');
const axios = require('axios');
const loginToSAP = require('../services/sapAuth');

cron.schedule('0 */12 * * *', async () => {
  console.log('[CRON] Enviando órdenes nuevas a SAP...');
  
  const orders = await Order.find({ sentToSAP: false });
  if (orders.length === 0) return console.log('✅ No hay órdenes nuevas.');

  try {
    const { cookies } = await loginToSAP();

    for (const order of orders) {
      try {
        const response = await axios.post(
          `${process.env.SAP_URL}/Orders`,  // o el endpoint correcto que uses
          {
            // tu estructura del documento de SAP aquí
            DocDate: order.createdAt,
            CardName: order.customer.name,
            DocTotal: order.totalPrice,
            DocumentLines: order.lineItems.map(item => ({
              ItemCode: item.sku,
              Quantity: item.quantity,
              UnitPrice: item.price
            })),
          },
          {
            headers: {
              Cookie: cookies.join('; ')
            }
          }
        );

        order.sentToSAP = true;
        await order.save();
        console.log(`✔️ Orden ${order.orderId} enviada correctamente`);
      } catch (err) {
        console.error(`❌ Error al enviar orden ${order.orderId}`, err.message);
      }
    }
  } catch (err) {
    console.error('❌ Falló la autenticación con SAP');
  }
});