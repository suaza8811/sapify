const Order = require('../models/Order');
const sapService = require('../services/sapAuth');


exports.createOrder = async (req, res, next) => {
  try {
    console.log('Datos recibidos del webhook:', req.body)
    const data = req.body;

    // Crear objeto para guardar la orden
    const order = new Order({
      orderId: data.id,
      createdAt: data.created_at,
      customer: {
        name: `${data.customer?.first_name || ''} ${data.customer?.last_name || ''}`.trim(),
        email: data.customer?.email
      },
      totalPrice: parseFloat(data.total_price),
      currency: data.currency,
      lineItems: data.line_items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price)
      })),
      status: data.financial_status,
      rawData: data, // Guarda el JSON completo, opcional
      sendToSap: false
    });

    await order.save();
    
    // Opcional: enviar la orden a SAP
    // await sapService.sendOrderToSAP(order);

    res.status(200).json({ message: 'Order saved successfully' });
  } catch (error) {
    next(error);
  }
};