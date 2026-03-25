const { model } = require("../../models/index");

const balanceMensualService = {
    async createSingleEntry(entry) {
        try {
            // LÓGICA DE PAGOS MIXTOS
            if (entry.metodo_pago === 'mixto' && entry.detalles_mixto) {
                const { m1, v1, m2, v2 } = entry.detalles_mixto;
                const totalMix = parseFloat(v1) + parseFloat(v2);

                if (totalMix <= 0) throw new Error("Total mixto inválido");

                const ratio1 = parseFloat(v1) / totalMix;
                const ratio2 = parseFloat(v2) / totalMix;

                const entry1 = {
                    ...entry,
                    metodo_pago: m1,
                    monto: (parseFloat(entry.monto) * ratio1).toFixed(2),
                    producto: `${entry.producto} (Parcial ${m1.toUpperCase()})`
                };

                const entry2 = {
                    ...entry,
                    metodo_pago: m2,
                    monto: (parseFloat(entry.monto) * ratio2).toFixed(2),
                    producto: `${entry.producto} (Parcial ${m2.toUpperCase()})`
                };

                const r1 = await model.balanceMensual.create(entry1);
                const r2 = await model.balanceMensual.create(entry2);
                return [r1, r2];
            }

            return await model.balanceMensual.create(entry);
        } catch (error) {
            console.error('Error al crear entrada de balance:', error);
            throw error;
        }
    },

    async createBulkEntries(entries) {
        try {
            return await model.balanceMensual.bulkCreate(entries, { validate: true });
        } catch (error) {
            console.error('Error en carga masiva de balance:', error);
            throw error;
        }
    },

    async getAllEntries() {
        try {
            return await model.balanceMensual.findAll();
        } catch (error) {
            throw error;
        }
    },

    async getEntryById(id) {
        try {
            const entry = await model.balanceMensual.findByPk(id);
            if (!entry) throw new Error('Entrada de balance no encontrada');
            return entry;
        } catch (error) {
            throw error;
        }
    },

    async updateEntry(id, updates) {
        try {
            const entry = await model.balanceMensual.findByPk(id);
            if (!entry) throw new Error('Entrada de balance no encontrada');
            await entry.update(updates);
            return entry;
        } catch (error) {
            throw error;
        }
    },

    async deleteEntry(id) {
        try {
            const entry = await model.balanceMensual.findByPk(id);
            if (!entry) throw new Error('Entrada de balance no encontrada');
            await entry.destroy();
        } catch (error) {
            throw error;
        }
    },

    async deleteAllEntries() {
        try {
            // Reemplazamos el borrado total por un reseteo de detalles de billetes
            const entries = await model.balanceMensual.findAll();

            const promises = entries.map(entry => {
                if (entry.detalles_pago) {
                    const newDetails = { ...entry.detalles_pago };
                    delete newDetails.billetes;
                    delete newDetails.vuelto;

                    // Si el pago era mixto, también limpiamos la parte de efectivo del desglose si existe
                    // Aunque por la estructura actual se maneja principalmente en 'billetes'/'vuelto'

                    return entry.update({ detalles_pago: newDetails });
                }
                return Promise.resolve();
            });

            await Promise.all(promises);
        } catch (error) {
            console.error('Error al resetear billetes:', error);
            throw error;
        }
    },
};

module.exports = balanceMensualService;