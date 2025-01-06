const connectionDB = require('../../config/database');

class ConheceuModel {
  constructor(db) {
    this.conn = db;
  }

  async create(data) {
    try {
      const [result] = await this.conn.raw(`
        INSERT INTO tblfconheceu (Descricao) VALUES (?)
      `, [data]);

      console.log('Conheceu inserido com sucesso');
      return result;
    } catch (error) {
      console.error('Erro ao inserir Conheceu:', error);
      throw error;
    }
  }

  async validaConheceu(data) {
    try {
      const [result] = await this.conn.raw(`
        SELECT Codigo FROM tblfconheceu WHERE Descricao = ?
      `, [data]);

      return result[0] || 0;
    } catch (error) {
      console.error('Erro ao validar Conheceu:', error);
      throw error;
    }
  }

  async getConheceu(data){
 

    try {
      
      const [result] = await this.conn.raw(`SELECT idrdstationfonte FROM tblfconheceu WHERE Codigo = ? `, data);
      console.log(result)
      return result[0].idrdstationfonte;
    } catch (error) {
      console.error('Erro Get Conheceu:', error);
      throw error;
    }
  }
}

module.exports = ConheceuModel;
