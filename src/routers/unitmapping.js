const express = require('express');
const router = express.Router();

const {
    createUnitMap,
    getUnitMap,
    getAllUnitMaps
} = require('../controllers/unitmapping')

const { isAuth } = require('../middlewares/auth');

router.post('/create-unitmap', createUnitMap);
router.post('/get-unitmap', getUnitMap);
router.post('/get-unitmaps', getAllUnitMaps);

module.exports = router;