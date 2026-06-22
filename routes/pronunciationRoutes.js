import express from 'express';
import pronunciationController from '../controller/pronunciationController.js';

const router = express.Router();

// Admin routes for managing tasks
router.post("/tasks", pronunciationController.createTask);
router.get("/tasks", pronunciationController.getTasks);
router.put("/tasks/:id", pronunciationController.updateTask);
router.delete("/tasks/:id", pronunciationController.deleteTask);

// Student route for evaluating pronunciation
router.post("/evaluate", pronunciationController.evaluateAttempt);

// Leaderboard route
router.get("/leaderboard", pronunciationController.getLeaderboard);

export default router;
