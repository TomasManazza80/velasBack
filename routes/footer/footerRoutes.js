import { Router } from "express";
import footerController from "../../controller/footer/footerController.js";

const router = Router();

router.get("/", footerController.getAll);
router.get("/list", footerController.getList);
router.put("/", footerController.upsert);

export default router;
