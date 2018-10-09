import express from "express";
import questController from "../controllers/quest.controller"

const router = express.Router()



router.get('/allquest', (req, res) => {
    questController.getAll(req, res);
});

router.post('/addquest', (req, res) => {
    questController.addQuest(req, res);
});

export default router;