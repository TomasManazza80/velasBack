const express = require('express');
const router = express.Router();
const heroSliderController = require('../../controller/heroSlider/heroSliderController.js');

router.get('/', heroSliderController.getAll);
router.post('/', heroSliderController.create);
router.delete('/:id', heroSliderController.delete);

module.exports = router;
