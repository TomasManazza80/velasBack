const { model } = require("../models/index");

const productServiceBought = {

  async createBoughtProduct(producto) {
    console.log("lo que recibe el body: ", producto);
    try {
      const { nombre, precio, marca, categoria, cantidad, talle, imagenes } = producto;
      const productBought = await model.ProductBought.create({
        nombre,
        precio,
        marca,
        categoria,
        cantidad,
        talle,
        imagenes,
        fechaCompra: new Date()
      });
      return productBought;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  },

  async getAllBoughtProducts() {
    try {
      const productsBought = await model.ProductBought.findAll({
        include: [{ model: model.product }]
      });
      return productsBought;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },

  async getBoughtProductById(id) {
    try {
      const productBought = await model.ProductBought.findByPk(id);
      if (!productBought) {
        throw new Error('Producto no encontrado');
      }
      return productBought;
    } catch (error) {
      console.error('Error al obtener producto:', error);
      throw error;
    }
  },

  async updateProduct(id, nombre, precio, marca, categoria, cantidad, talle, imagenes) {
    try {
      const productBought = await model.ProductBought.findByPk(id);
      if (!productBought) {
        throw new Error('Producto no encontrado');
      }
      await productBought.update({
        nombre,
        precio,
        marca,
        categoria,
        cantidad,
        talle,
        imagenes,
      });
      return productBought;
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }
  },

  async updateQuantityProduct(productId, quantityToDiscount) {
    try {
      const productBought = await model.ProductBought.findByPk(productId);
      if (!productBought) {
        throw new Error('Producto no encontrado');
      }
      productBought.cantidad -= quantityToDiscount;
      await productBought.save();
      return productBought;
    } catch (error) {
      console.error('Error al actualizar cantidad del producto:', error);
      throw error;
    }
  },
  
  async deleteProduct(id) {
    try {
      const productBought = await model.ProductBought.findByPk(id);
      if (!productBought) {
        throw new Error('Producto no encontrado');
      }
      await productBought.destroy();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw error;
    }
  }

};
 

module.exports = productServiceBought;
