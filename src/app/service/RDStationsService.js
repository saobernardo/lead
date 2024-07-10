const fetch = require('node-fetch');
const token = '63b87f69566d650014f6bf27';

// Data atual no formato ISO 8601 sem milissegundos
const currentDate = new Date().toISOString().split('.')[0] + 'Z';

// Data de início (3 dias atrás) no formato ISO 8601 sem milissegundos
const startDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('.')[0];


const url = `https://crm.rdstation.com/api/v1/deals?token=${token}&start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(currentDate)}`;

class RDStation {
    async list() {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();

            return data.deals;
        } catch (error) {
            console.error('Error fetching deals:', error.message);
            throw error; // Re-lança o erro para que ele possa ser tratado na camada de controle
        }
    }
}

module.exports = new RDStation();
