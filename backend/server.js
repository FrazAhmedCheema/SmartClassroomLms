const express = require("express");
const cors = require("cors");
const app = express();

// ...existing code...

// Enable CORS for all routes
app.use(cors());

// ...existing code...

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
