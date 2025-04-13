const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const verifyShopify = require('../middlewares/verifyShopify');


router.post('/orders', /*verifyShopify,*/ orderController.createOrder);
router.get('/dashboard', orderController.getOrdersDashboard);

module.exports = router;