require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./src/config/database');
require('./src/models');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => res.json({ status: 'ok', message: 'BookEase Pro API running' }));

app.use('/auth',         require('./src/routes/auth'));
app.use('/businesses',   require('./src/routes/businesses'));
app.use('/services',     require('./src/routes/services'));
app.use('/staff',        require('./src/routes/staff'));
app.use('/appointments', require('./src/routes/appointments'));
app.use('/super-admin',  require('./src/routes/superAdmin'));

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));
app.use((err, req, res, next) => { console.error(err.stack); res.status(500).json({ message: 'Internal server error.' }); });

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected.');
    await sequelize.sync({ alter: true });
    console.log('✅ Models synced.');
    app.listen(PORT, () => console.log('🚀 BookEase Pro API → http://localhost:' + PORT));
  } catch (err) {
    console.error('❌ Startup failed:', err);
    process.exit(1);
  }
};

start();
