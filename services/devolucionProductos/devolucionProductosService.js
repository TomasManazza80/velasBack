const { model, Sequelize } = require("../../models/index");
const productService = require("../productService");
const remitoService = require("../remito/remitoService");

const devolucionService = {
    // Sincroniza la operación completa (Cabecera + Paquetes + Productos)
    async createOperation(data) {
        const transaction = await Sequelize.transaction();
        try {
            // 1. Registrar la devolución en el historial técnico
            const operation = await model.devolucion.create(data, {
                include: [{
                    model: model.devolucionLote,
                    as: 'returnPackages',
                    include: [{
                        model: model.devolucionProducto,
                        as: 'products'
                    }]
                }],
                transaction
            });

            // 2. Procesar impactos en inventario y remitos
            for (const pkg of data.returnPackages) {
                for (const prod of pkg.products) {
                    // Si tenemos un productId, descontamos del stock general
                    // Nota: prod.productId y prod.remitoItemId deben venir del frontend
                    if (prod.productId) {
                        await productService.updateQuantityProduct(prod.productId, {
                            quantityToDiscount: prod.quantity,
                            color: prod.color,
                            almacenamiento: prod.storage
                        });
                    }

                    // Si viene de un remito y el remito no está pagado, ajustamos la deuda
                    if (prod.remitoItemId) {
                        const remitoItem = await model.remitoItem.findByPk(prod.remitoItemId, {
                            include: [{ model: model.remito, as: 'remito' }]
                        });

                        // Si el remito aún no está pagado, restamos la cantidad del lote para que baje el total de la deuda
                        if (remitoItem && remitoItem.remito && remitoItem.remito.estado === 'no pagado') {
                            await remitoService.updateRemitoItemQuantity(prod.remitoItemId, prod.quantity);

                            // Recalcular el total del remito
                            const allItems = await model.remitoItem.findAll({
                                where: { remitoId: remitoItem.remitoId },
                                transaction
                            });
                            const newTotal = allItems.reduce((acc, curr) => acc + (Number(curr.costoCompra) * Number(curr.cantidad)), 0);
                            await remitoItem.remito.update({ total: newTotal }, { transaction });
                        }
                    }
                }
            }

            await transaction.commit();
            return operation;
        } catch (error) {
            await transaction.rollback();
            console.error('ERROR_LOG: FALLO EN SISTEMA DE LOGÍSTICA REVERSA', error);
            throw error;
        }
    },

    async getAllOperations() {
        try {
            return await model.devolucion.findAll({
                include: [{
                    model: model.devolucionLote,
                    as: 'returnPackages',
                    include: [{ model: model.devolucionProducto, as: 'products' }]
                }],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw error;
        }
    },

    async deleteOperation(id) {
        const transaction = await Sequelize.transaction();
        try {
            const entry = await model.devolucion.findByPk(id);
            if (!entry) throw new Error('OPERACIÓN_NO_ENCONTRADA');

            // 1. Buscar los lotes asociados
            const lotes = await model.devolucionLote.findAll({
                where: { devolucionId: id },
                transaction
            });

            // 2. Para cada lote, eliminar sus productos
            for (const lote of lotes) {
                await model.devolucionProducto.destroy({
                    where: { loteId: lote.LoteId },
                    transaction
                });
            }

            // 3. Eliminar los lotes
            await model.devolucionLote.destroy({
                where: { devolucionId: id },
                transaction
            });

            // 4. Eliminar la cabecera (Soft-delete si paranoid: true, pero limpia los hijos antes)
            await entry.destroy({ transaction });

            await transaction.commit();
            return { message: 'OPERACIÓN_ELIMINADA_CON_ÉXITO' };
        } catch (error) {
            await transaction.rollback();
            console.error('ERROR_LOG: FALLO AL ELIMINAR OPERACIÓN DE DEVOLUCIÓN', error);
            throw error;
        }
    }
};

module.exports = devolucionService;