const db = require('./knex');

const connectionDB = async () => {
  try {
    // Verificar se a conexão está funcionando
    await db.raw('SELECT 1+1');
    console.log('Conexão bem-sucedida');
    return db;
  } catch (err) {
    console.log(err);
    return false;
  } 
}

module.exports = connectionDB;
