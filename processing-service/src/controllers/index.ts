import { Router } from "express";
import { statusController } from "./status.controller";

export const router = Router();

router.use('/status', statusController);

// healthcheck
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})