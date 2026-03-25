const { DataTypes } = require("sequelize");
const Sequelize = require("../../dbconnection/db");

const HeroSlider = Sequelize.define(
    "HeroSlider",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        subtitle: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        label: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        position: {
            type: DataTypes.STRING,
            defaultValue: 'center',
            allowNull: false,
        }
    },
    {
        timestamps: true,
        tableName: 'HeroSlider'
    }
);

module.exports = HeroSlider;
