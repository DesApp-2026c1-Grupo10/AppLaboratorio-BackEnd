const express = require("express");
const router = express.Router();

const controller = require("../controllers/laboratorio_controller");

router.get("/", controller.getAll);

router.get("/:id/disponibilidad", controller.disponibilidad);

router.get("/:id", controller.getById);

router.post("/", controller.create);

router.put("/:id", controller.update);

router.delete("/:id", controller.remove);

module.exports = router;