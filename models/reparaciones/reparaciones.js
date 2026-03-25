const { DataTypes } = require("sequelize");

const encargo = (db) => db.define(
    "encargo",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        numeroOrden: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        fechaIngreso: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW,
        },
        responsable: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        nombreCliente: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        dni: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        celular: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        direccion: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        descripcionTrabajo: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1,
        },
        fechaPactada: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        especificaciones: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        caracteristicasPedido: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        montoTotal: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
        },
        senado: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0,
        },
        detallesPresupuesto: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        notasInternas: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        estado: {
            type: DataTypes.ENUM('Pendiente', 'En Proceso', 'Finalizado', 'Entregado'),
            allowNull: false,
            defaultValue: 'Pendiente',
        },
        fechaEntregaReal: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        }
    },
    {
        tableName: 'reparaciones', // Keeping the table name for now to avoid manual SQL table rename, but model is conceptualized as encargo
        timestamps: true,
    }
);

module.exports = encargo;