const crypto = require('crypto');

const verifyShopify = (req, res, next) => {
  const hmac = req.headers['x-shopify-hmac-sha256'];
  const body = JSON.stringify(req.body);
  const digest = crypto
    .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
    .update(body)
    .digest('base64');

  if (hmac !== digest) {
    return res.status(401).json({ message: 'Invalid webhook signature' });
  }
  next();
};

module.exports = verifyShopify;