const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const subAdminRoutes = require('./routes/subAdmin');
const adminRoutes = require('./routes/admin');
const teacherRoutes = require('./routes/teacher');
const studentRoutes = require('./routes/student');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000',
        credentials: true
    }
});

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(cookieParser());

const mongoURI = process.env.MONGO_URI;
async function connectDB() {
    try {
        await mongoose.connect(mongoURI);
        server.listen(8080, () => {
            console.log('MongoDB connected and Server is running on port 8080');
        });
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
}

io.on('connection', (socket) => {
    console.log('Admin connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Admin disconnected:', socket.id);
    });
});

function notifyAdmins(newRequest) {
    io.emit('newInstituteRequest', newRequest);
}

// Routes
app.get('/', (req, res) => {
    res.send('Hello World! Now from dev1');
});

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use('/sub-admin', subAdminRoutes);
app.use('/admin', adminRoutes);
app.use('/teacher', teacherRoutes);
app.use('/student', studentRoutes);

connectDB();
module.exports = { app, server, io, notifyAdmins };
