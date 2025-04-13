const axios = require('axios');

async function loginToSAP() {
  try {
    const res = await axios.post(`${process.env.SAP_URL}/Login`, {
      UserName: process.env.SAP_USER,
      Password: process.env.SAP_PASSWORD,
      CompanyDB: process.env.SAP_COMPANY_DB,
    });

    const sessionId = res.data.SessionId;
    const routeId = res.headers['set-cookie']
      .find(cookie => cookie.includes('ROUTEID'))
      .split(';')[0]; // ejemplo: "ROUTEID=.node2"

    return {
      sessionId,
      cookies: [`B1SESSION=${sessionId}`, routeId],
    };
  } catch (error) {
    console.error('Error de login en SAP:', error.response?.data || error.message);
    throw new Error('No se pudo autenticar con SAP');
  }
}

module.exports = loginToSAP;