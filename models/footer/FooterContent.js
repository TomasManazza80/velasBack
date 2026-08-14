const { DataTypes } = require("sequelize");
const sequelize = require("../../dbconnection/db");

const FooterContent = sequelize.define(
  "FooterContent",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "FooterContents",
    timestamps: true,
  }
);

module.exports = FooterContent;
