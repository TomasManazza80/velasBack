const db = require("../../models/index.js");
const FooterContent = db.FooterContent;

const footerController = {
  // Obtener todo el contenido y devolverlo como un mapa clave-valor
  async getAll(req, res) {
    try {
      const contents = await FooterContent.findAll();
      
      const contentMap = {};
      contents.forEach(item => {
        contentMap[item.key] = {
          title: item.title,
          content: item.content
        };
      });

      res.status(200).json(contentMap);
    } catch (error) {
      console.error("Error fetching footer content:", error);
      res.status(500).json({ message: "Error al obtener contenido del footer" });
    }
  },

  // Obtener lista completa en formato de array (ideal para el administrador)
  async getList(req, res) {
    try {
      const contents = await FooterContent.findAll();
      res.status(200).json(contents);
    } catch (error) {
      console.error("Error fetching footer list:", error);
      res.status(500).json({ message: "Error al obtener lista del footer" });
    }
  },

  // Actualizar un registro existente o crearlo si no existe
  async upsert(req, res) {
    try {
      const { key, title, content } = req.body;
      
      if (!key || !title || !content) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
      }

      let footerItem = await FooterContent.findOne({ where: { key } });

      if (footerItem) {
        footerItem.title = title;
        footerItem.content = content;
        await footerItem.save();
      } else {
        footerItem = await FooterContent.create({ key, title, content });
      }

      res.status(200).json(footerItem);
    } catch (error) {
      console.error("Error upserting footer content:", error);
      res.status(500).json({ message: "Error al actualizar contenido del footer", error: error.message });
    }
  }
};

module.exports = footerController;
