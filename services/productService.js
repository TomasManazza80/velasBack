const { model } = require("../models/index");

const productService = {
 
   async createProduct(producto) {
    console.log("lo que recibe el body######: ", producto);
    try {
      const { nombre, precio, marca, categoria, cantidad, talle, imagenes, categoryCategoryId, descripcion } = producto;
      const product = await model.product.create({
        nombre,
        precio,
        marca,
        categoria,
        cantidad,
        talle,  
        imagenes,
        categoryCategoryId,
        descripcion 
      });
      return product;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  },

  async getAllProducts() {
    try {
      const products = await model.product.findAll();
      return products;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },

  async getProductById(id) {
    try {
      const product = await model.product.findByPk(id);
      if (!product) {
        throw new Error('Producto no encontrado');
      }
      return product;
    } catch (error) {
      console.error('Error al obtener producto:', error);
      throw error;
    }
  },

  async updateProduct(id, nombre, precio, marca, categoria, cantidad, talle, imagenes, descripcion) {
    try {
      const product = await model.product.findByPk(id);
      if (!product) {
        throw new Error('Producto no encontrado');
      }
      await product.update({
        nombre,
        precio,
        marca,
        categoria,
        cantidad,
        talle,
        imagenes,
        descripcion
      });
      return product;
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }
  },

  async updateQuantityProduct(productId, quantityToDiscount) {
    try {
      const product = await model.product.findByPk(productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }
      product.cantidad -= quantityToDiscount;
      await product.save();
      return product;
    } catch (error) {
      console.error('Error al actualizar cantidad del producto:', error);
      throw error;
    }
  },
  

  async deleteProduct(id) {
    try {
      const product = await model.product.findByPk(id);
      if (!product) {
        throw new Error('Producto no encontrado');
      }
      await product.destroy();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw error;
    }
  },
};

module.exports = productService;
