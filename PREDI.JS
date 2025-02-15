const axios = require('axios');

// Reemplaza con tu clave de API de API-Football
const API_KEY = '93220683c5ff9ed2278b8153e222eda5';

// ID del partido (fixture) que deseas consultar
const FIXTURE_ID = 1331; // Reemplaza con el ID real del partido

// Configuración de los encabezados para la solicitud
const headers = {
  'x-apisports-key': API_KEY,
};

// Función para obtener estadísticas de tiros de esquina
async function obtenerEstadisticasCorners(fixtureId) {
  try {
    const response = await axios.get(
      `https://v3.football.api-sports.io/fixtures/statistics`,
      {
        headers,
        params: { fixture: fixtureId },
      }
    );

    const statistics = response.data.response;
    if (statistics.length > 0) {
      const corners = statistics.find(
        (stat) => stat.statistics.some((s) => s.type === 'Corner Kicks')
      );

      if (corners) {
        const cornerStats = corners.statistics.find(
          (s) => s.type === 'Corner Kicks'
        );
        console.log('Estadísticas de Tiros de Esquina:', cornerStats);
      } else {
        console.log('No se encontraron estadísticas de tiros de esquina.');
      }
    } else {
      console.log('No se encontraron estadísticas para este partido.');
    }
  } catch (error) {
    console.error('Error al obtener estadísticas de tiros de esquina:', error);
  }
}

// Función para obtener pronósticos del partido
async function obtenerPronostico(fixtureId) {
  try {
    const response = await axios.get(
      `https://v3.football.api-sports.io/predictions`,
      {
        headers,
        params: { fixture: fixtureId },
      }
    );

    const predictions = response.data.response;
    if (predictions.length > 0) {
      console.log('Pronóstico del Partido:', predictions[0]);
    } else {
      console.log('No se encontraron pronósticos para este partido.');
    }
  } catch (error) {
    console.error('Error al obtener el pronóstico del partido:', error);
  }
}

// Llamadas a las funciones
obtenerEstadisticasCorners(FIXTURE_ID);
obtenerPronostico(FIXTURE_ID);
