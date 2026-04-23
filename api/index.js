const serverless = require("serverless-http");
const app = require("../server");

// Export serverless handler
module.exports = serverless(app);