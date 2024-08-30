const cron = require('node-cron');
const RDStation = require("../app/service/RDStationsService");
const ClientesModel = require("../app/model/ClientesModel");
const ConheceuModel = require("../app/model/conheceuModel");
const connectionDB = require('./database');

// Função para remover caracteres não imprimíveis e outros caracteres indesejados
function sanitizeString(str) {
    return str.replace(/[^\x20-\x7E]/g, '');
}

// Função para criar um novo conhecimento se não existir
async function ensureConheceu(origem, conheceuModel) {
    const result = await conheceuModel.validaConheceu(origem);
    if (result === 0) {
        const created = await conheceuModel.create(origem);
        console.log('Novo conhecimento criado:', created);
        return created.Codigo;
    }
    return result.Codigo;
}

const fonte = async (db, conheceu) => {
    const conheceuModel = new ConheceuModel(db);
    return await conheceuModel.getConheceu(conheceu);
};

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

// Função para processar e criar novos leads
async function processLeads(leadsList, db) {
    const clientesModel = new ClientesModel(db);
    const conheceuModel = new ConheceuModel(db);

    for (const obj of leadsList) {
        const contato = obj.contacts[0] || {};
        const camposPersonalizados = obj.deal_custom_fields || [];

        const nomeContato = contato.name || obj.name;
        const telefoneContato = contato.phones?.[0]?.phone || ' ';
        const emailContato = contato.emails?.[0]?.email || ' ';
        const razaoSocial = obj.organization?.name || ' ';

        const campoQuantidade = camposPersonalizados.find(field => field.custom_field_id === "63c93fa013dd8800114f49f4");
        const quantidade = campoQuantidade?.value.split('-')[1]?.trim() || campoQuantidade?.value.trim() || '';

        const origem = obj.deal_source?.name || 'N/A';
        const conheceu = await ensureConheceu(origem, conheceuModel);

        const campoAjuda = camposPersonalizados.find(field => field.custom_field_id === "63c93f29203a00000b11e706");
        const textoAjuda = campoAjuda?.value || 'N/A';

        const campoPosicao = camposPersonalizados.find(field => field.custom_field_id === "63c93f64a813eb000c368648");
        const cargo = campoPosicao?.value || 'N/A';

        const campoTempoCompra = camposPersonalizados.find(field => field.custom_field_id === "63c93f8419e999000cb05128");
        const tempoCompra = campoTempoCompra?.value || 'N/A';

        const observacao = `Como o sistema vai ajudar? ${textoAjuda}; Quantidade de pessoas na organização: ${quantidade}; Cargo: ${cargo}; Quando pretende comprar? ${tempoCompra};`;

        const dados = {
            nome: sanitizeString(nomeContato),
            celular: telefoneContato.replace(/[^\d]+/g, ""),
            email: emailContato,
            quantidade: quantidade,
            origem: conheceu,
            observacao: observacao,
            razao_social: razaoSocial,
            idRDStation: obj.id,
            cargo: cargo
        };

        const validaLead = await clientesModel.validaLead(dados);
        if (validaLead.length === 0) {
            await clientesModel.create(dados);
        }
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para atualizar leads existentes
async function updateLeads(db) {
    const clientesModel = new ClientesModel(db);
    const leadsNoBanco = await clientesModel.listLeads();

    if (leadsNoBanco.length === 0) {
        console.log('Nenhum lead encontrado para atualizar.');
        return;
    }

    const dadosParaEnviar = [];
    for (const lead of leadsNoBanco) {
        const fonteId = await fonte(db, lead.Conheceu);

        let nome;
        
        if (!lead.contato || lead.contato.trim().length === 0 ||  lead.contato.trim().length <= 3) {
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

        await delay(5000); 

        const leadsCreate = await RDStation.createNegociacao(data);
        await clientesModel.updateLead({
            codigo: lead.Codigo,
            codRDstation: leadsCreate.id
        });

        dadosParaEnviar.push(data);
    }

    console.log(`Foram atualizados ${dadosParaEnviar.length} leads no RDStation`);
}

// Função principal que executa a tarefa agendada
const runTask = async () => {
    console.log('Executando rotina de requisição à API...');
    try {
        const db = await connectionDB(); // Obtém a conexão do banco de dados
        if (!db) {
            throw new Error('Falha ao obter conexão com o banco de dados');
        }

        const leadsList = await RDStation.list();
        await processLeads(leadsList, db);
        await updateLeads(db);

    } catch (error) {
        console.error('Erro ao executar rotina:', error.message);
    }
};

// Inicia a tarefa agendada para rodar a cada 5 minutos
const start = () => {
    cron.schedule('*/5 * * * *', runTask); // Executa a cada 5 minutos
    console.log('Tarefa agendada para executar a cada 5 minutos.');
};

module.exports = {
    start,
    runTask
};
