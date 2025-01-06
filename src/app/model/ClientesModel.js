const connectionDB = require('../../config/database');

class ClientesModel {
  constructor(db) {
    this.conn = db;


  }

  async create(data) {

    console.log(data);

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

  async validaLead(data) {
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

  async pegaCargo(data) {
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

  async listLeads() {
    try {

      const [result] = await this.conn.raw(`SELECT 
  tblfclientes.codigo AS Codigo,
  contato,
  cargo,
  razaoSocial,
  FoneCel,
  Email,
  DataCadastro,
  Obs,
  Produto,
  tblfetapas.Descricao AS Etapas,
  tblfstatus.Descricao AS staus,
  tblfconsultor.Nome AS Consultor,
  Conheceu,
  QtdMembros,
  Apresentacao,
  tblfcontrato.Descricao AS TipoContrato,
  tipoPessoa,
  cpf,
  cnpj,
  idRDStation 
FROM
  tblfclientes 
  LEFT JOIN tblfstatus 
    ON tblfclientes.status = tblfstatus.Codigo 
  LEFT JOIN tblfconsultor 
    ON tblfclientes.Consultor = tblfconsultor.Codigo 
  LEFT JOIN tblfetapas 
    ON tblfclientes.Etapa = tblfetapas.codigo 
  LEFT JOIN tblfcontrato 
    ON tblfclientes.TipoContrato = tblfcontrato.codigo 
WHERE idRDStation IS NULL 
ORDER BY Codigo DESC 
LIMIT 15 `);

      return result;

    } catch (error) {
      console.error('Erro ao trazer Leads:', error);
      throw error;
    }
  }

  async updateLead(data){
    try {
      const [result] = await this.conn.raw(`UPDATE tblfclientes SET idRDStation = ? WHERE Codigo = ? `, [data.codRDstation, data.codigo]);
      
      return result;

    } catch (error) {
      console.error('Erro ao atualziar Lead com codigo RDstation:', error);
      throw error;
    }
  }
}

module.exports = ClientesModel;
