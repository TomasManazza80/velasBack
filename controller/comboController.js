import db from "../models/index.js";
const Combo = db.Combo;

const comboController = {
  async getAll(req, res) {
    try {
      const { onlyActive } = req.query;
      let combos = await Combo.findAll({
        order: [
          ["orden", "ASC"],
          ["createdAt", "DESC"],
        ],
      });

      if (onlyActive === "true" || onlyActive === true) {
        combos = combos.filter(
          (c) => c.activo === true || c.activo === 1 || c.activo === "true" || c.activo === undefined
        );
      }

      res.status(200).json(combos);
    } catch (error) {
      console.error("Error fetching combos:", error);
      res.status(500).json({ message: "Error al obtener los combos", error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const combo = await Combo.findByPk(id);
      if (!combo) {
        return res.status(404).json({ message: "Combo no encontrado." });
      }
      res.status(200).json(combo);
    } catch (error) {
      console.error("Error fetching combo by ID:", error);
      res.status(500).json({ message: "Error al obtener el combo", error: error.message });
    }
  },

  async create(req, res) {
    try {
      const {
        nombre,
        subtitulo,
        descripcion,
        imagen,
        precio,
        precioOriginal,
        descuento,
        badge,
        productosIncluidos,
        productId,
        activo,
        orden,
      } = req.body;

      if (!nombre || precio === undefined) {
        return res.status(400).json({ message: "El nombre y el precio del combo son obligatorios." });
      }

      const newCombo = await Combo.create({
        nombre,
        subtitulo: subtitulo || "",
        descripcion: descripcion || "",
        imagen: imagen || "",
        precio: parseFloat(precio) || 0,
        precioOriginal: precioOriginal ? parseFloat(precioOriginal) : 0,
        descuento: descuento ? parseInt(descuento) : 0,
        badge: badge || "PROMO ESPECIAL",
        productosIncluidos: productosIncluidos || [],
        productId: productId ? parseInt(productId) : null,
        activo: activo !== undefined ? Boolean(activo) : true,
        orden: orden !== undefined ? parseInt(orden) : 0,
      });

      res.status(201).json(newCombo);
    } catch (error) {
      console.error("Error creating combo:", error);
      res.status(500).json({ message: "Error al crear el combo", error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const combo = await Combo.findByPk(id);

      if (!combo) {
        return res.status(404).json({ message: "Combo no encontrado." });
      }

      const {
        nombre,
        subtitulo,
        descripcion,
        imagen,
        precio,
        precioOriginal,
        descuento,
        badge,
        productosIncluidos,
        productId,
        activo,
        orden,
      } = req.body;

      await combo.update({
        ...(nombre !== undefined && { nombre }),
        ...(subtitulo !== undefined && { subtitulo }),
        ...(descripcion !== undefined && { descripcion }),
        ...(imagen !== undefined && { imagen }),
        ...(precio !== undefined && { precio: parseFloat(precio) || 0 }),
        ...(precioOriginal !== undefined && { precioOriginal: parseFloat(precioOriginal) || 0 }),
        ...(descuento !== undefined && { descuento: parseInt(descuento) || 0 }),
        ...(badge !== undefined && { badge }),
        ...(productosIncluidos !== undefined && { productosIncluidos }),
        ...(productId !== undefined && { productId: productId ? parseInt(productId) : null }),
        ...(activo !== undefined && { activo: Boolean(activo) }),
        ...(orden !== undefined && { orden: parseInt(orden) || 0 }),
      });

      res.status(200).json(combo);
    } catch (error) {
      console.error("Error updating combo:", error);
      res.status(500).json({ message: "Error al actualizar el combo", error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const combo = await Combo.findByPk(id);

      if (!combo) {
        return res.status(404).json({ message: "Combo no encontrado." });
      }

      await combo.destroy();
      res.status(200).json({ message: "Combo eliminado exitosamente." });
    } catch (error) {
      console.error("Error deleting combo:", error);
      res.status(500).json({ message: "Error al eliminar el combo", error: error.message });
    }
  },
};

export default comboController;
