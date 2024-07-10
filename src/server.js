const app = require('./config/custom-express');
const taskScheduler = require('../src/config/taskScheduler');
let port = 8006;

app.listen(port,() => {
  console.log(`Server rodando na porta ${port}`);
});

// Inicia a tarefa agendada automaticamente
//taskScheduler.start();