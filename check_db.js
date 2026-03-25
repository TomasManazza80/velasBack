const { product } = require('./models/index');

async function checkProducts() {
  try {
    const count = await product.count();
    console.log(`Total products in database: ${count}`);
    if (count > 0) {
      const firstProduct = await product.findOne();
      console.log('First product sample:', JSON.stringify(firstProduct, null, 2));
    }
    process.exit(0);
  } catch (error) {
    console.error('Error checking products:', error);
    process.exit(1);
  }
}

checkProducts();
