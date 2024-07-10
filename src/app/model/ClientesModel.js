const connectionDB = require('../../config/database');

class ClientesModel {
constructor(db) {
    this.conn = db;

  
  }

  async create(data) {
    try {
      const [result] = await this.conn.raw(`
        INSERT INTO tblfclientes
        (contato, fonecel, email, qtdmembros, conheceu, obs, razaosocial, datacadastro, horainclusao, TipoContrato, Consultor, Cliente, TipoPessoa, status, Etapa, idRDStation, Produto, Cargo, Apresentacao)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.nome,
        data.celular,
        data.email,
        data.quantidade,
        data.origem,
        data.observacao,
        data.razao_social,
        5, 
        32, 
        'N',
        'F',
        1, 
        1,
        data.idRDStation,
        'SITE DM10',
        data.cargo,
        'S'
      ]);

      console.log('Lead inserido com sucesso');
      return result;
    } catch (error) {
      console.error('Erro ao inserir Lead:', error);
      throw error;
    }
  }

  async validaLead(data){
    try {
      const [result] = await this.conn.raw(`
        SELECT contato FROM tblfclientes 
        WHERE idRDStation = ? 
      `, [ 
        data.idRDStation
      ]);
  
      return result;
    } catch (error) {
      console.error('Erro ao Validar Lead:', error);
      throw error;
    }
  }

  async pegaCargo(data){
    try {
      const [result] = await this.conn.raw(`
        SELECT contato FROM tblfclientes 
        WHERE idRDStation = ? 
      `, [ 
        data.idRDStation
      ]);
  
      return result;
    } catch (error) {
      console.error('Erro ao Validar Lead:', error);
      throw error;
    }
  }
}

module.exports = ClientesModel;
