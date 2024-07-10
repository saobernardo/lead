const express = require('express');
const bodyParser = require('body-parser');
const routes = require('../app/routes/index');
const taskScheduler = require('../../src/config/taskScheduler');

const app = express();

// Configuração do body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Inicia a tarefa agendada automaticamente
taskScheduler.start();

// Configuração das rotas principais da aplicação
routes(app);

// Middleware para rota não encontrada
app.use((req, res, next) => {
  return res.status(404).json({ message: 'Rota não encontrada' });
});

// Middleware para tratamento de erros
app.use((error, req, res, next) => {
  console.error(error.stack);
  return res.status(500).json({ message: 'Erro interno do servidor' });
});

module.exports = app;
