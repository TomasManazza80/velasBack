const AllValidation = require("../validation/AllValidation");
const productService = require('../services/productService');

const productController = {

  async createProduct(req, res) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error al crear producto:", error);
      res.status(500).json({ message: 'Error al crear producto' });
    }
  },

  async getAllProducts(req, res) {
    try {
      const products = await productService.getAllProducts();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener productos' });
    }
  },

  async getProductById(req, res) {
    try {
      const id = req.params.id;
      const product = await productService.getProductById(id);
      if (!product) {
        res.status(404).json({ message: 'Producto no encontrado' });
      } else {
        res.status(200).json(product);
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener producto' });
    }
  },

  async updateProduct(req, res) {
    try {
      const id = req.params.id;
      const { nombre, precio, marca, categoria, cantidad, talle, imagenes } = req.body;
      const product = await productService.updateProduct(id, nombre, precio, marca, categoria, cantidad, talle, imagenes);
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar producto' });
    }
  },

  async updateQuantityProduct(req, res) {
    try {
      const productId = req.params.id;
      const { quantityToDiscount } = req.body;
      const updatedProduct = await productService.updateQuantityProduct(productId, quantityToDiscount);
      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Error al actualizar cantidad del producto:", error);
      res.status(500).json({ message: 'Error al actualizar la cantidad del producto' });
    }
  },

  async deleteProduct(req, res) {
    try {
      const id = req.params.id;
      await productService.deleteProduct(id);
      res.status(204).json({ message: 'Producto eliminado' });
      console.log('Producto eliminado!!');
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar producto' });
    }
  },
};

module.exports = productController;
