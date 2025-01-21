const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const subAdminRoutes = require('./routes/subAdmin');
const adminRoutes = require('./routes/admin');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(cookieParser());

const mongoURI = process.env.MONGO_URI;

app.get('/', (req, res) => {
    res.send('Hello World!Now from dev1');
});

app.use('/sub-admin', subAdminRoutes);
app.use('/admin', adminRoutes);

connectDB();
async function connectDB() {
    try {
        await mongoose.connect(mongoURI);
        app.listen(8080, () => {
            console.log('MongoDB connected and Server is running on port 8080');
        });
    } catch (err) {
        console.log(err);
    }
}

