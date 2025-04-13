// job/sendOrdersToSAP.js
const cron = require('node-cron');
const axios = require('axios');
const Order = require('../models/Order');

const SAP_CONFIG = {
  baseUrl: 'https://servapps.cortineros.local:50001/b1s/v1',
  user: 'USUARIO_SAP',
  password: 'CONTRASENA_SAP',
  companyDB: 'NOMBRE_EMPRESA_SAP'
};

async function loginToSAP() {
  try {
    const res = await axios.post(`${SAP_CONFIG.baseUrl}/Login`, {
      UserName: SAP_CONFIG.user,
      Password: SAP_CONFIG.password,
      CompanyDB: SAP_CONFIG.companyDB
    }, {
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
    });

    return res.headers['set-cookie'];
  } catch (err) {
    console.error('Error en login SAP:', err.response?.data || err);
    return null;
  }
}

async function customerExists(cardCode, cookie) {
  try {
    const res = await axios.get(`${SAP_CONFIG.baseUrl}/BusinessPartners('${cardCode}')`, {
      headers: { Cookie: cookie.join('; ') },
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) return false;
    console.error('Error verificando cliente en SAP:', err.response?.data || err);
    throw err;
  }
}

async function createCustomer(order, cookie) {
  const customerPayload = {
    CardCode: order.customer_id,
    CardName: order.customer_name || order.customer_id,
    CardType: 'cCustomer',
    EmailAddress: order.email,
    Phone1: order.phone || '',
    Address: order.shipping_address?.address1 || '',
    ZipCode: order.shipping_address?.zip || '',
    City: order.shipping_address?.city || '',
    Country: order.shipping_address?.country_code || ''
  };

  try {
    const res = await axios.post(`${SAP_CONFIG.baseUrl}/BusinessPartners`, customerPayload, {
      headers: { Cookie: cookie.join('; ') },
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
    });
    return res.data;
  } catch (err) {
    console.error('Error creando cliente en SAP:', err.response?.data || err);
    throw err;
  }
}

async function sendOrdersToSAP() {
  console.log('[JOB] Iniciando envío de órdenes a SAP...');
  const cookie = await loginToSAP();
  if (!cookie) return;

  try {
    const pendingOrders = await Order.find({ sentToSAP: false });

    for (const order of pendingOrders) {
      let exists = await customerExists(order.customer_id, cookie);
      if (!exists) {
        await createCustomer(order, cookie);
        console.log(`[SAP] Cliente ${order.customer_id} creado.`);
      } else {
        console.log(`[SAP] Cliente ${order.customer_id} ya existe.`);
      }

      const sapPayload = {
        CardCode: order.customer_id,
        DocDate: new Date().toISOString().slice(0, 10),
        DocumentLines: order.line_items.map(item => ({
          ItemCode: item.sku,
          Quantity: item.quantity,
          UnitPrice: item.price
        }))
      };

      const res = await axios.post(`${SAP_CONFIG.baseUrl}/Orders`, sapPayload, {
        headers: { Cookie: cookie.join('; ') },
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
      });

      await Order.updateOne({ _id: order._id }, { $set: { sentToSAP: true, sapResponse: res.data } });
      console.log(`[SAP] Orden ${order._id} enviada con éxito.`);
    }
  } catch (err) {
    console.error('[SAP] Error enviando órdenes:', err.response?.data || err);
  }
}

cron.schedule('0 */12 * * *', sendOrdersToSAP);

module.exports = sendOrdersToSAP;
