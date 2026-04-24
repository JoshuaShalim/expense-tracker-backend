// Test server for local development
// This file is for testing only - not for production use
require("dotenv").config();
const app = require("./server");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});