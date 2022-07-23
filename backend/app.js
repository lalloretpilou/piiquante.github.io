const express = require('express');
const userRoutes = require('./routes/user.routes');
const sauceRoutes = require('./routes/sauce.routes');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv').config();

mongoose.connect(`mongodb+srv://${process.env.USER_ID}:${process.env.USER_KEY}@cluster0.azp3qwq.mongodb.net/?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

module.exports = app;
