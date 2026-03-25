const db = require("../../models/index.js");
const HeroSlider = db.HeroSlider;

const heroSliderController = {
    async getAll(req, res) {
        try {
            const slides = await HeroSlider.findAll({ order: [['createdAt', 'DESC']] });
            res.status(200).json(slides);
        } catch (error) {
            console.error("Error fetching hero slides:", error);
            res.status(500).json({ message: "Error al obtener slides del hero" });
        }
    },

    async create(req, res) {
        try {
            const { title, subtitle, label, image, position } = req.body;
            
            if (!image || !title || !subtitle || !label) {
                return res.status(400).json({ message: "Faltan campos obligatorios" });
            }

            const newSlide = await HeroSlider.create({
                title, subtitle, label, image, position: position || 'center'
            });

            res.status(201).json(newSlide);
        } catch (error) {
            console.error("Error creating hero slide:", error);
            res.status(500).json({ message: "Error al crear el slide", error: error.message });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const slide = await HeroSlider.findByPk(id);

            if (!slide) {
                return res.status(404).json({ message: "Slide no encontrado" });
            }

            await slide.destroy();
            res.status(204).send();
        } catch (error) {
            console.error("Error deleting hero slide:", error);
            res.status(500).json({ message: "Error al eliminar el slide" });
        }
    }
};

module.exports = heroSliderController;
