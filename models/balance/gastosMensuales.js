const { DataTypes } = require("sequelize");
const Sequelize = require("../../dbconnection/db");

const monthlyExpense = Sequelize.define(
    "monthlyExpense",
    {
        MonthlyExpenseId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombre: { type: DataTypes.STRING, allowNull: false },
        monto: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        vencimiento: { type: DataTypes.DATEONLY, allowNull: false }, // Fecha Límite
        medio_pago: { type: DataTypes.STRING, allowNull: true },
        pagado: { type: DataTypes.BOOLEAN, defaultValue: false },
        fecha_pago: { type: DataTypes.DATE, allowNull: true },
    },
    {
        timestamps: true, // Para la fecha de actualización
        paranoid: true,
    }
);

module.exports = monthlyExpense;