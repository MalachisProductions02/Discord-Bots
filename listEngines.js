const axios = require('axios');

async function listEngines() {
  try {
    const response = await axios.get('https://api.stability.ai/v1/engines/list', {
      headers: {
        Authorization: `Bearer sk-ajaySy9uN8dVsok7JQQuxFEhVByHYWQNCz8p0NUWobTLXooE`,
      },
    });
    console.log('Motores disponibles:', response.data);
  } catch (error) {
    console.error('Error listando motores:', error.response?.data || error.message);
  }
}

listEngines();
