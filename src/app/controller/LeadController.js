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
        // Verifica se o campoQuantidade existe e se tem um valor
        if (campoQuantidade && campoQuantidade.value) {
          let valor = campoQuantidade.value.trim();

          // Se o valor contiver um hífen, extrai a parte após o hífen
          if (valor.includes('-')) {
            quantidade = valor.split('-')[1]?.trim() || ''; // Garantir que o valor após o hífen seja obtido corretamente

            quantidade = valor.replace(/\D/g, '');
          } else {
            // Se não houver hífen, usa o valor diretamente
            quantidade = valor;
            quantidade = valor.replace(/\D/g, '');
          }

          // Caso a quantidade nao seja numérica, converte para número
          if (!isNaN(quantidade)) {
            quantidade = parseInt(quantidade, 10);
          }
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

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async churchrp_para_rdstation(req, res, next) {

    const vendedor = async (consultor) => {
      const vendedores = {
        'Raissa Faria': '642ac2f0bc8ece001667d2d4',
        'Rosi': '63e2abb3be0e0b001d8da842',
        'Laion': '642ac928121375001b394324',
        'Gesley  Carvalho Marciano': '63b87f69566d650014f6bf24',
        'Laryssa Leal': '65423de8869b2a0012cf3091',
      };
      return vendedores[consultor] || '63b87f69566d650014f6bf24'; // Valor padrão
    };

    const fonte = async (db, conheceu) => {
      const conheceuModel = new ConheceuModel(db);
      return await conheceuModel.getConheceu(conheceu);
    };

    // Função para mapear etapas para seus respectivos IDs
    /*   const etapa = async (etapa) => {
         const etapas = {
           'Prospecção': '66cf88faad502d00277909a7',
           'Investigação': '66cf897839b12e001459f08a',
           'Apresentação/Demonstração': '66cf8989436f5f0014ee1e19',
           'Superação de Objeções/Negociação': '66cf899906dee8002258f99a',
           'Fechamento': '66cf89a77cdd59001cd3dd53',
           'Pós-Venda': '66cf89b206dee80019590129',
           'Cancelado': '66cf89bcaf3cdb001489abfb'
         };
         return etapas[etapa] || null; // Retorna null para valores inesperados
       };*/


    try {
      const db = await connectionDB();
      if (!db) {
        throw new Error('Falha ao obter conexão com o banco de dados');
      }

      const clientesModel = new ClientesModel(db);
      const leadsNoBanco = await clientesModel.listLeads();
      const dadosParaEnviar = [];

      // Verificar se há leads para processar
      if (leadsNoBanco.length === 0) {
        return res.status(200).json({ message: 'Nenhum lead encontrado para processar.' });
      }

      let leadsCreate;
      let atualizaLeadRP;

      for (const lead of leadsNoBanco) {
        const fonteId = await fonte(db, lead.Conheceu);

        let nome;

        if (!lead.contato || lead.contato.trim().length === 0 || lead.contato.trim().length <= 3) {
          nome = lead.Email.replace(/\s+/g, '');
        } else {
          nome = lead.contato.trim();
        }


        const data = {
          deal: {
            name: nome,
            deal_custom_fields: [
              {
                value: lead.Obs,
                custom_field_id: '66cf875c70c0650014f210d4'
              }
            ],
            user_id: await vendedor(lead.Consultor)
          },
          deal_source: { _id: fonteId },
          contacts: [
            {
              emails: [{ email: lead.Email.replace(/\s+/g, '') }],
              phones: [{ phone: lead.FoneCel.trim(), type: 'cellphone' }],
              name: nome
            }
          ],
          deal_products: [{ name: lead.Produto }]
        };

        await delay(10000); 

        leadsCreate = await RDStation.createNegociacao(data);

        atualizaLeadRP = await clientesModel.updateLead({
          codigo: lead.Codigo,
          codRDstation: leadsCreate.id
        });

        //break; 
        dadosParaEnviar.push(data);
      }

      return res.status(200).json("foram atualizados: " + dadosParaEnviar.length + "Leads no RDstation");
    } catch (error) {
      next(error);
    }
  }




}

module.exports = new LeadController();
