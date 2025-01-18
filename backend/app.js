const express = require('express');
const connectDB = require("./config/db");
const adminRoutes = require("./routes/adminRoutes");
const loginLimiter = require("./middlewares/rateLimiter");
const cors = require('cors'); // Import cors


const app = express();
app.use(express.json());
app.use(cors());
// Connect to Database
connectDB();
console.log("Reached here ?");

// Routes
app.use("/admin", adminRoutes);

app.get('/', (req, res) => {
    res.send('Hello World! Now from dev1');
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});

// mongodb+srv://frazahmedcheema:WcXDm4sKalonONVU@smartclassroomcluster.ffbxk.mongodb.net/