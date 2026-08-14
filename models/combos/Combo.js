const { DataTypes } = require("sequelize");
const Sequelize = require("../../dbconnection/db");

const Combo = Sequelize.define("combo", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subtitulo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  imagen: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  precioOriginal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
  },
  descuento: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  badge: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "OFERTA ESPECIAL",
  },
  productosIncluidos: {
    type: DataTypes.JSON,
    defaultValue: [],
    get() {
      const rawValue = this.getDataValue("productosIncluidos");
      if (typeof rawValue === "string") {
        try {
          return JSON.parse(rawValue);
        } catch (e) {
          return [];
        }
      }
      return rawValue || [];
    },
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  orden: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  paranoid: true,
  tableName: "combos",
});

module.exports = Combo;
