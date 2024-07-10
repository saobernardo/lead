const routes = require("express").Router();
const LeadController = require("../controller/LeadController");

routes.get('/', LeadController.deals);

module.exports = (app) => {
  app.use(routes);
} 