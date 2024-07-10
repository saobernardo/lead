const express = require("express");
const RDStation = require("../service/RDStationsService");
const ClientesModel = require("../model/ClientesModel");
const ConheceuModel = require("../model/conheceuModel");
const connectionDB = require('../../config/database'); // Importa a instância do banco de dados


function sanitizeString(str) {
  // Remove caracteres não imprimíveis e outros caracteres não desejados
  return str.replace(/[^\x20-\x7E]/g, '');
}


class LeadController {
  async deals(req, res, next) {
    try {
      const leadsList = await RDStation.list();
      const db = await connectionDB(); // Obtém a conexão do banco de dados
      if (!db) {
        throw new Error('Falha ao obter conexão com o banco de dados');
      }

      const clientesModel = new ClientesModel(db);
      const conheceuModel = new ConheceuModel(db);

      const data = [];

      for (const obj of leadsList) {

        const idRDStation = obj.id;

        const contato = obj.name && obj.contacts[0] ? obj.contacts[0] : {};
        const camposPersonalizados = obj.deal_custom_fields || [];

        const nomeContato = contato.name || obj.name;

        const telefoneContato = contato.phones && contato.phones[0] ? contato.phones[0].phone : ' ';

        const emailContato = contato.emails && contato.emails[0] ? contato.emails[0].email : ' ';

        const razaoSocial = obj.organization.name || ' ';

        const campoQuantidade = camposPersonalizados.find(field => field.custom_field_id === "63c93fa013dd8800114f49f4");

        let quantidade = '';
        if (campoQuantidade && campoQuantidade.value.includes('-')) {
          quantidade = campoQuantidade.value.split('-')[1].trim();
        } else if (campoQuantidade) {
          quantidade = campoQuantidade.value.trim();
        }

        const origem = obj.deal_source && obj.deal_source.name ? obj.deal_source.name : 'N/A';

        const resultConheceu = await conheceuModel.validaConheceu(origem);

        let conheceu = '';

        if (resultConheceu == 0) {

          const createConheceu = await conheceuModel.create(origem);
          console.log(createConheceu)

        } else {
          conheceu = resultConheceu.Codigo;
        }

        const campoAjuda = camposPersonalizados.find(field => field.custom_field_id === "63c93f29203a00000b11e706");
        const textoAjuda = campoAjuda ? campoAjuda.value : 'N/A';

        const campoPosicao = camposPersonalizados.find(field => field.custom_field_id === "63c93f64a813eb000c368648");
        const cargo = campoPosicao ? campoPosicao.value : 'N/A';

        const campoTempoCompra = camposPersonalizados.find(field => field.custom_field_id === "63c93f8419e999000cb05128");
        const tempoCompra = campoTempoCompra ? campoTempoCompra.value : 'N/A';

        const observacao = `Como o sistema vai ajudar? ${textoAjuda}; Quantidade de pessoas na organização:  ${quantidade}; Cargo:  ${cargo}; Quando pretende comprar? ${tempoCompra};`;

        const dados = {
          nome: sanitizeString(nomeContato),
          celular: telefoneContato.replace(/[^\d]+/g, ""),
          email: emailContato,
          quantidade: quantidade,
          origem: conheceu,
          observacao: observacao,
          razao_social: razaoSocial,
          idRDStation: idRDStation,
          cargo: cargo
        };

        //valida se ja foi inserido no banco
        const validaLead = await clientesModel.validaLead(dados);

        if (validaLead.length == 0) {
          await clientesModel.create(dados);
        }

        data.push(dados);
        //break;
      }


      // 

      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LeadController();
