const axios = require('axios');

const API_KEY = 'TU_API_KEY'; // Reemplaza con tu clave de API-Football
const headers = {
  'x-apisports-key': API_KEY,
};

async function obtenerLigas() {
  try {
    const response = await axios.get('https://v3.football.api-sports.io/leagues', {
      headers,
    });
    console.log('Ligas disponibles:');
    
    // Recorre y muestra cada liga
    response.data.response.forEach(liga => {
      console.log(`${liga.name} (ID: ${liga.league.id})`);
    });
  } catch (error) {
    console.error('Error al obtener las ligas:', error);
  }
}

obtenerLigas();
