module.exports = function(RED) {
    function RdStationClientNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        const axios = require('axios');
        const rdStationApiUrl = 'https://crm.rdstation.com';

        node.on('input', async function(msg) {
            try {
                
                const clientSecret = msg.credentials.clientSecret;

                const method = config.method;
                const annotation = msg.payload.annotation;
                
                const limit = 2;
                const startAt = msg.payload.start_at || "2021-01-01T00:00:00Z";
                const endAt = new Date().toISOString();

                let response;
                let hasMore = true;
                let page = 1;

                switch (method) {
                    case 'getDeals':
                        let allDeals = [];
                        while (hasMore) {
                            response = await axios.get(`${rdStationApiUrl}/api/v1/deals`, {
                                params: {
                                    token: clientSecret,
                                    page: page,
                                    created_at_period: true,
                                    start_at: startAt,
                                    end_at: endAt,
                                    limit: limit
                                }
                            });

                            allDeals = allDeals.concat(response.data.deals);

                            hasMore = response.data.has_more;
                            page++;
                        }

                        msg.payload = allDeals;
                        break;
                    case 'getTasks':
                        let allTasks = [];

                        while (hasMore) {
                            response = await axios.get(`${rdStationApiUrl}/api/v1/tasks`, {
                                params: {
                                    token: clientSecret,
                                    page: page,
                                    // date_start: startAt,
                                    limit: limit
                                }
                            });

                            allTasks = allTasks.concat(response.data.tasks);

                            hasMore = response.data.has_more;
                            page++;
                        }

                        msg.payload = allTasks;
                        
                        break;
                    case 'addNotes':
                        response = await axios.post(`${rdStationApiUrl}/api/v1/activities?token=${clientSecret}`, annotation);
                        break;
                    case 'getUsers':
                        response = await axios.get(`${rdStationApiUrl}/api/v1/users?token=${clientSecret}`);
                        
                        msg.payload = response.data;
                        break;
                    // Adicione mais casos conforme necessário para outros métodos
                    default:
                        node.error("Método não suportado", msg);
                        return;
                }

                node.send(msg);

            } catch (error) {
                node.error("Erro ao conectar à API do RD Station: " + error.message, msg);
            }
        });
    }
    RED.nodes.registerType("rd-station-client", RdStationClientNode);
}
