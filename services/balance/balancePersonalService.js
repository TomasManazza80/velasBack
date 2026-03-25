const { model } = require("../../models/index");

const balancePersonalService = {
    async createSingleEntry(entry) {
        try {
            return await model.balancePersonal.create(entry);
        } catch (error) {
            console.error('ERROR_LOG: FALLO EN BALANCE PERSONAL', error);
            throw error;
        }
    },

    async createBulkEntries(entries) {
        try {
            return await model.balancePersonal.bulkCreate(entries, { validate: true });
        } catch (error) {
            console.error('ERROR_LOG: FALLO EN CARGA MASIVA PERSONAL', error);
            throw error;
        }
    },

    async getAllEntries() {
        try {
            return await model.balancePersonal.findAll({
                order: [['fecha', 'DESC'], ['createdAt', 'DESC']]
            });
        } catch (error) {
            throw error;
        }
    },

    async updateEntry(id, updates) {
        try {
            const entry = await model.balancePersonal.findByPk(id);
            if (!entry) throw new Error('Registro no encontrado');
            await entry.update(updates);
            return entry;
        } catch (error) {
            throw error;
        }
    },

    async deleteEntry(id) {
        try {
            const entry = await model.balancePersonal.findByPk(id);
            if (!entry) throw new Error('Registro no encontrado');
            await entry.destroy();
        } catch (error) {
            throw error;
        }
    }
};

module.exports = balancePersonalService;