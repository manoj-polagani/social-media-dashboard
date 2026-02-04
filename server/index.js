const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoute = require('./routes/auth');
const dashRoute = require('./routes/dashboard');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to Mongo
mongoose.connect('mongodb://mongo:27017/socialdb')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

app.use('/api/auth', authRoute);
app.use('/api/dashboard', dashRoute);

app.listen(5000, () => console.log('Server running on 5000'));