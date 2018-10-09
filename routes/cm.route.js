import express from "express";
import cmController from "../controllers/cm.controller"

const router = express.Router()



router.get('/allcm', (req, res) => {
    cmController.getAll(req, res);
});

router.post('/addcm', (req, res) => {
    cmController.addCm(req, res);
});

export default router;