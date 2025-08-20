const user = require("./users/user");
const cart = require("./carts/cart");
const category = require("./categories/categ");
const product = require("./products/product");
const ProductBought = require("./productBougth/productBougth");
const Recaudation = require("./recaudation/recaudation"); 
const Sequelize = require("../dbconnection/db");

user.hasMany(cart, { onDelete: "CASCADE" });
cart.belongsTo(user, { onDelete: "CASCADE" });

category.hasMany(product, { onDelete: "CASCADE" });
product.belongsTo(category, { onDelete: "CASCADE" });

product.belongsToMany(cart, {
  onDelete: "CASCADE",
  through: "Product_cart",
  foreignKey: {
    name: "ProductID",
    allowNull: false,
    unique: true,
  },
});
cart.belongsToMany(product, {
  onDelete: "CASCADE",
  through: "Product_cart",
  foreignKey: {
    name: "ProductID",
    allowNull: false,
    unique: true,
  },
});

product.hasMany(ProductBought, { onDelete: "CASCADE" });
ProductBought.belongsTo(product, { onDelete: "CASCADE" });

const model = Sequelize.models;

module.exports = { model, Sequelize, Recaudation }; // Agregado el modelo de Recaudation a la exportación