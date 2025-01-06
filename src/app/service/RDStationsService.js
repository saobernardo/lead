const fetch = require('node-fetch');
const token = '63b87f69566d650014f6bf27';

// Data atual no formato ISO 8601 sem milissegundos
const currentDate = new Date().toISOString().split('.')[0] + 'Z';

// Data de início (3 dias atrás) no formato ISO 8601 sem milissegundos
const startDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('.')[0];


const url = `https://crm.rdstation.com/api/v1`;

class RDStation {
    async list() {
        try {
            const response = await fetch(`${url}/deals?token=${token}&start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(currentDate)}`, {
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
            throw error;  
        }
    }

    async createNegociacao(data){
        console.log(data)

        try {
            const response = await fetch(`${url}/deals?token=${token}`, {
                method: 'POST',
                headers: {
                    accept: 'application/json', 
                    'content-type': 'application/json'
                },
                body: JSON.stringify(data)
            });
 

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
            }
    
            const responseData = await response.json();
  
            return responseData;

        } catch (error) {
            console.error('Error ao criar deals:', error.message);
            throw error;  
        }
    }

    async getNegociacao(){
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'accept': 'application/json'
                }
            });


        } catch (error) {
            
        }
    }
}

module.exports = new RDStation();
