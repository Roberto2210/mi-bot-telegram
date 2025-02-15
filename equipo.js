const axios = require('axios');

const options = {
  method: 'GET',
  url: 'https://football-api.p.rapidapi.com/v2/matches',
  params: {season: '2023', team: 'Cruz Azul'}, // Ejemplo: para obtener partidos de Cruz Azul
  headers: {
    'X-RapidAPI-Key': 'TU_RAPIDAPI_KEY',  // Tu clave de RapidAPI
    'X-RapidAPI-Host': 'football-api.p.rapidapi.com'
  }
};

async function obtenerEstadisticas() {
  try {
    const response = await axios.request(options);
    console.log('Estadísticas:', response.data);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
  }
}

obtenerEstadisticas();
