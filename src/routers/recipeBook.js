const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
    createRecipe,
    getRecipe,
    getAllRecipe
} = require('../controllers/recipeBook')

const { isAuth } = require('../middlewares/auth');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

router.post('/create-recipe', upload.single('photo'), createRecipe);
router.post('/get-recipe', getRecipe);
router.post('/get-recipes', getAllRecipe);

module.exports = router;