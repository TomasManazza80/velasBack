const mercadopago = require('mercadopago');
const productService = require('../services/productService');
console.log(productService);

const createPreference = async (createPaymentDto, id) => {
  const client = {
    access_token: 'APP_USR-8101026874292077-101721-08438cf8d2ed21fe5947641f4ae99cd8-2015493826',
  };

  mercadopago.configure(client);

  const preferenceData = {
    items: [
      {
        title: createPaymentDto.title,
        quantity: Number(createPaymentDto.quantity),
        unit_price: Number(createPaymentDto.price),
        currency_id: 'ARS',
      },
    ],
    back_urls: {
      success: 'https://ecommerceback-haed.onrender.com/confirmacionPago',
      failure: 'http://localhost:5173/user/allcredits',
      pending: 'http://localhost:5173/user/allcredits',
    },
    auto_return: 'approved',
    external_reference: id,
  };

  try {
    const preference = await mercadopago.preferences.create(preferenceData);
    return preference.body;
  } catch (error) {
    throw error;
  }
};

const processWebhookData = async (webhookData) => {
  if (webhookData.data.product) {
    const productId = webhookData.data.product.id;
    const quantity = webhookData.data.product.quantity;
    await productService.updateQuantityProduct(productId, quantity);
  } else {
    console.error('No se encontró información de producto en el webhook');
  }
};

const success = async (webhookData) => {
  const url = 'https://indumentarianam.netlify.app/';
  const data = {
    id: webhookData.id,
    type: webhookData.type,
    entity: webhookData.entity,
    action: webhookData.action,
    date: webhookData.date,
    model_version: webhookData.model_version,
    version: webhookData.version,
    data: {
      id: webhookData.data.id,
      status: webhookData.data.status,
      amount: webhookData.data.amount,
      payment_method_id: webhookData.data.payment_method_id,
      payer: {
        id: webhookData.data.payer.id,
        name: webhookData.data.payer.name,
        email: webhookData.data.payer.email
      },
      product: {
        id: webhookData.data.product.id,
        name: webhookData.data.product.name,
        quantity: webhookData.data.product.quantity
      }
    }
  };

  try {
    const response = await axios.post(url, data);
    console.log('Pago exitoso. Respuesta:', response.data);
  } catch (error) {
    console.error('Error al enviar pago exitoso:', error);
  }
};

module.exports = {
  createPreference,
  processWebhookData,
  success
};
