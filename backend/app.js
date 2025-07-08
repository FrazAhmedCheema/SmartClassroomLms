const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io'); // For existing admin notifications
const WebSocket = require('ws'); // For interactive code execution
const path = require('path');
const fs = require('fs');
const url = require('url'); // Import the 'url' module
require('dotenv').config();

const subAdminRoutes = require('./routes/subAdmin');
const adminRoutes = require('./routes/admin');
const teacherRoutes = require('./routes/teacher');
const studentRoutes = require('./routes/student');
const discussionRoutes = require('./routes/discussion');
const classRoutes = require('./routes/class');
const classworkRoutes = require('./routes/classwork'); // Add classwork routes
const assignmentRoutes = require('./routes/assignment');
const quizRoutes = require('./routes/quiz'); // Import new quiz routes
const materialRoutes = require('./routes/material'); // Import new material routes
const questionRoutes = require('./routes/question'); // Import new question routes
const submissionRoutes = require('./routes/submission'); // Ensure submission routes are imported
const codeExecutionRoutes = require('./routes/codeExecution'); // Add this line
const codeViewRoutes = require('./routes/codeView'); // Import new code view routes

const codeExecutionService = require('./services/codeExecution');
const mernExecutionService = require('./services/mernExecution'); // Add this import

const app = express();
const server = http.createServer(app);

// Socket.IO for admin notifications
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000',
        credentials: true
    }
});

// WebSocket server for interactive code execution - with noServer: true
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws, req) => {
    // req here is the original HTTP request that initiated the WebSocket upgrade.
    // The containerId should have been extracted and validated before wss.handleUpgrade
    // For simplicity in this direct 'connection' handler, we assume it's already a valid interactive terminal ws.
    // More complex logic might involve passing context from handleUpgrade.

    // The actual containerId would typically be passed through or re-parsed if needed.
    // For now, let's assume the connection is valid as per handleUpgrade logic.
    // The `req.containerId` (or similar) would be set in `handleUpgrade`.
    // For this example, we'll re-parse, but a more robust solution might pass it.
    const parsedUrl = url.parse(req.url, true);
    const pathParts = parsedUrl.pathname.split('/'); // e.g. ['', 'ws', 'code-execution', 'containerId']

    if (pathParts.length === 4 && pathParts[1] === 'ws' && pathParts[2] === 'code-execution') {
        const containerId = pathParts[3];
        console.log(`Interactive terminal WebSocket connection established for container: ${containerId}`);
        codeExecutionService.attachToContainerStreams(containerId, ws)
            .catch(err => {
                console.error(`Error attaching to container ${containerId} streams:`, err);
                if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                    ws.send(`Error establishing connection: ${err.message}\r\n`);
                    ws.close();
                }
            });
    } else {
        // This case should ideally not be reached if handleUpgrade filters correctly
        console.error('Error: wss connection handler called for non-interactive path:', req.url);
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            ws.close(1008, "Invalid path for this WebSocket service");
        }
        return;
    }


    ws.on('error', (error) => {
        console.error(`WebSocket error on client from path ${req.url}. Code: ${error.code}, Message: ${error.message}`);
        // No need to terminate here, ws library handles its state.
    });

    ws.on('close', (code, reason) => {
        const reasonString = reason instanceof Buffer ? reason.toString() : (reason || '').toString();
        console.log(`WebSocket connection from path ${req.url} closed. Code: ${code}, Reason: ${reasonString}`);
    });
});

server.on('upgrade', (request, socket, head) => {
    const parsedUrl = url.parse(request.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname && pathname.startsWith('/ws/code-execution/')) {
        // This is an upgrade request for our interactive terminal
        wss.handleUpgrade(request, socket, head, (ws) => {
            // Pass the original request to the 'connection' event
            // so we can access req.url or other properties if needed.
            wss.emit('connection', ws, request);
        });
    } else {
        // If it's not for '/ws/code-execution/', do nothing here.
        // Socket.IO's internal mechanism will handle its own upgrade requests.
        // If Socket.IO is not handling it and no other handler is, the socket will be destroyed.
        // console.log('Ignoring upgrade request for path:', pathname);
        // socket.destroy(); // Optionally destroy if no other handler is expected.
    }
});


app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(cookieParser());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'temp');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add global error handler middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

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
app.use('/class', classRoutes);
app.use('/admin', adminRoutes);
app.use('/teacher', teacherRoutes);
app.use('/student', studentRoutes);
app.use('/discussions', discussionRoutes);
app.use('/classwork', classworkRoutes); // Add classwork routes
app.use('/assignment', assignmentRoutes);
app.use('/quiz', quizRoutes); // Mount new quiz routes
app.use('/material', materialRoutes); // Mount new material routes
app.use('/question', questionRoutes); // Add question routes
app.use('/submission', submissionRoutes); // Ensure submission routes are registered
app.use('/code', codeExecutionRoutes); // Add the new route
app.use('/code-view', codeViewRoutes); // Add the new route

// Add cleanup handlers for graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Cleaning up...');
  
  // Stop all active MERN sessions
  const activeSessions = Array.from(mernExecutionService.activeMERNSessions?.keys() || []);
  for (const sessionId of activeSessions) {
    try {
      await mernExecutionService.stopMERNSession(sessionId);
      console.log(`Cleaned up MERN session: ${sessionId}`);
    } catch (error) {
      console.error(`Error cleaning up session ${sessionId}:`, error);
    }
  }
  
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Cleaning up...');
  
  // Stop all active MERN sessions
  const activeSessions = Array.from(mernExecutionService.activeMERNSessions?.keys() || []);
  for (const sessionId of activeSessions) {
    try {
      await mernExecutionService.stopMERNSession(sessionId);
      console.log(`Cleaned up MERN session: ${sessionId}`);
    } catch (error) {
      console.error(`Error cleaning up session ${sessionId}:`, error);
    }
  }
  
  process.exit(0);
});

connectDB();
module.exports = { app, server, io, wss, notifyAdmins }; // Export wss if needed elsewhere
