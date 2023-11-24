// app.js
const express = require('express');
const cors = require('cors'); // Import the cors middleware
const app = express();
const port = process.env.PORT || 5007;

// Use the cors middleware
app.use(cors());

// Define a route
app.get('/', (req, res) => {
  res.send('Smart asset manement server is running...!');
});

// Start the server
app.listen(port, () => {
  console.log(`Smart asset manement server is running ${port}`);
});
