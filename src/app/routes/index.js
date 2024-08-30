const routes = require("express").Router();
const LeadController = require("../controller/LeadController");

routes.get('/', LeadController.deals);

routes.get('/churchrp', LeadController.churchrp_para_rdstation);

module.exports = (app) => {
  app.use(routes);
} 