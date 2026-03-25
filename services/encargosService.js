import db from "../models/index.js";
const { encargo } = db;
import { Op, Sequelize } from "sequelize";

const encargosService = {
    async create(data) {
        // Lógica para autogenerar el numeroOrden de forma segura e infalible
        let lastOrderNumberFound = 4669;
        try {
            // Intentamos obtener el máximo numérico directamente (query optimizada)
            const result = await encargo.findOne({
                attributes: [
                    [Sequelize.fn('MAX', Sequelize.cast(Sequelize.col('numeroOrden'), 'INTEGER')), 'maxOrder']
                ],
                paranoid: false,
                raw: true
            });
            if (result && result.maxOrder) {
                lastOrderNumberFound = parseInt(result.maxOrder);
            }
        } catch (e) {
            // Fallback: si hay valores no numéricos, ordenamos por fecha para tener un punto de partida
            const lastRecord = await encargo.findOne({
                order: [['createdAt', 'DESC']],
                attributes: ['numeroOrden'],
                paranoid: false
            });
            if (lastRecord && !isNaN(parseInt(lastRecord.numeroOrden))) {
                lastOrderNumberFound = parseInt(lastRecord.numeroOrden);
            }
        }

        // BUCLE DE SEGURIDAD: Garantiza unicidad absoluta antes de intentar el INSERT
        let nextOrderNumber = Math.max(4670, lastOrderNumberFound + 1);
        let confirmedUnique = false;
        
        while (!confirmedUnique) {
            const collision = await encargo.findOne({ 
                where: { numeroOrden: nextOrderNumber.toString() },
                paranoid: false 
            });
            if (collision) {
                // Si existe, incrementamos y volvemos a checkear
                nextOrderNumber++;
            } else {
                confirmedUnique = true;
            }
        }

        // Asignamos el número de orden generado
        const dataToCreate = {
            ...data,
            numeroOrden: nextOrderNumber.toString()
        };

        return await encargo.create(dataToCreate);
    },

    async getAll(startDate, endDate) {
        const where = {};
        if (startDate && endDate) {
            const inicio = new Date(`${startDate}T00:00:00`);
            const fin = new Date(`${endDate}T23:59:59.999`);
            where.createdAt = { [Op.between]: [inicio, fin] };
        }
        return await encargo.findAll({ where, order: [['createdAt', 'DESC']] });
    },

    async getById(id) {
        return await encargo.findByPk(id);
    },

    async update(id, data) {
        const item = await encargo.findByPk(id);
        if (!item) throw new Error("ORDEN_NO_EXISTE");
        return await item.update(data);
    },

    async updateStatus(id, nuevoEstado, additionalData = {}) {
        const item = await encargo.findByPk(id);
        if (!item) throw new Error("ORDEN_NO_EXISTE");

        const updateData = { ...additionalData, estado: nuevoEstado };
        if (nuevoEstado === 'Entregado') {
            updateData.fechaEntregaReal = updateData.fechaEntregaReal || new Date().toISOString().split('T')[0];
        } else {
            updateData.fechaEntregaReal = null;
        }

        return await item.update(updateData);
    },

    async delete(id) {
        const item = await encargo.findByPk(id);
        if (!item) throw new Error("ORDEN_NO_EXISTE");
        return await item.destroy();
    }
};

export default encargosService;