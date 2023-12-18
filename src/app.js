const express = require('express');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const connectToMongoDB = require('./db/conn')
const userRouter = require('./routers/user');
const recipesRouter = require('./routers/recipeBook');
const ingredientsRouter = require('./routers/ingredients');

const app = express();
const port = process.env.PORT;

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(bodyParser.json());

app.use(cors());

app.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

connectToMongoDB()
    .then(() => {

        app.use(userRouter)
        app.use(recipesRouter)
        app.use(ingredientsRouter)

        app.get('/', async (req, res) => {
            res.status(200).send("Server is live!")
        })

        app.listen(port, () => {
            console.log(`Server is live at port no. ${port}`);
        })
    })