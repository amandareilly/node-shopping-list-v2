const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const { ShoppingList, Recipes } = require('./models');

const jsonParser = bodyParser.json();
const app = express();

// log the http layer
app.use(morgan('common'));

// we're going to add some items to ShoppingList
// so there's some data to look at
ShoppingList.create('beans', 2);
ShoppingList.create('tomatoes', 3);
ShoppingList.create('peppers', 4);

// adding some recipes to `Recipes` so there's something
// to retrieve.
Recipes.create(
    'boiled white rice', ['1 cup white rice', '2 cups water', 'pinch of salt']);
Recipes.create(
    'milkshake', ['2 tbsp cocoa', '2 cups vanilla ice cream', '1 cup milk']);

// when the root of this router is called with GET, return
// all current ShoppingList items
app.get('/shopping-list', (req, res) => {
    res.json(ShoppingList.get());
});

app.post('/shopping-list', jsonParser, (req, res) => {
    // ensure `name` and `budget` are in request body
    const requiredFields = ['name', 'budget'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`
            console.error(message);
            return res.status(400).send(message);
        }
    }

    const item = ShoppingList.create(req.body.name, req.body.budget);
    res.status(201).json(item);
});


app.get('/recipes', (req, res) => {
    res.json(Recipes.get());
});

app.post('/recipes', jsonParser, (req, res) => {
    const requiredFields = { "name": "string", "ingredients": "array" };
    let message = null;
    //make sure we got all required properties and they are the right type
    Object.getOwnPropertyNames(requiredFields).forEach(function(name) {
        if (!name in req.body) {
            message = `Missing \`${name}\` in request body`;
        } else if (requiredFields[name] == "array" && !Array.isArray(req.body[name])) { //name exists, now check for type
            //array is required but was not provided
            message = `\`${name}\` in request body must be an array.`;
        } else if (requiredFields[name] !== "array" && requiredFields[name] !== typeof req.body[name]) {
            //required type is not matched
            message = `\`${name}\` in request body must be type \`${requiredFields[name]}\``;
        }
    });
    if (message) {
        console.error(message);
        return res.status(400).send(message);
    } else {
        const item = Recipes.create(req.body.name, req.body.ingredients);
        return res.status(201).json(item);
    }
});

app.listen(process.env.PORT || 8080, () => {
    console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});