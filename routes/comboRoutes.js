import express from "express";
import comboController from "../controller/comboController.js";

const router = express.Router();

router.get("/", comboController.getAll);
router.get("/:id", comboController.getById);
router.post("/", comboController.create);
router.put("/:id", comboController.update);
router.delete("/:id", comboController.delete);

export default router;
