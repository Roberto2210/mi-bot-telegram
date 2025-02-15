const axios = require('axios');

// Reemplaza con tu clave de API-Football
const API_KEY = '93220683c5ff9ed2278b8153e222eda5';

// ID de la Liga MX en API-Football (verifica que sea el correcto)
const LIGA_MX_ID = 147;

// Nombre del equipo que buscas
const TEAM_NAME = 'Cruz Azul';

// Configuración de los headers para la solicitud
const headers = {
  'x-apisports-key': API_KEY,
  'Content-Type': 'application/json',
};

// **Función para obtener el ID del equipo**
async function obtenerTeamID(nombreEquipo) {
  try {
    console.log(`🔍 Buscando ID del equipo: ${nombreEquipo}`);

    const response = await axios.get('https://v3.football.api-sports.io/teams', {
      headers,
      params: { search: nombreEquipo },
    });

    console.log('📡 Respuesta de la API:', response.data);

    if (!response.data.response || response.data.response.length === 0) {
      console.log('❌ No se encontró el equipo.');
      return null;
    }

    const equipo = response.data.response.find(team => team.team?.name?.toLowerCase() === nombreEquipo.toLowerCase());

    if (equipo) {
      console.log(`✅ ID encontrado: ${equipo.team.id}`);
      return equipo.team.id;
    } else {
      console.log('⚠️ No se encontró coincidencia exacta.');
      return null;
    }
  } catch (error) {
    console.error('🛑 Error al obtener el ID del equipo:', error);
    return null;
  }
}

// **Función para obtener el fixture_id del próximo partido**
async function obtenerProximoPartido(teamId) {
  try {
    console.log(`📅 Buscando el próximo partido del equipo ID: ${teamId}`);

    const response = await axios.get(
      'https://v3.football.api-sports.io/fixtures',
      {
        headers,
        params: {
          team: teamId,
          league: LIGA_MX_ID,
          season: 2024,  // Asegúrate de que la temporada sea la correcta
          next: 1,  // Solo el próximo partido
        },
      }
    );

    console.log('📡 Respuesta de la API (Fixtures):', response.data);

    if (!response.data.response || response.data.response.length === 0) {
      console.log('❌ No se encontraron partidos próximos.');
      return null;
    }

    const partido = response.data.response[0];
    console.log(`✅ Próximo partido encontrado: ${partido.teams.home.name} vs ${partido.teams.away.name}`);
    return partido.fixture.id;
  } catch (error) {
    console.error('🛑 Error al obtener el próximo partido:', error);
    return null;
  }
}

// **Función principal**
async function main() {
  const teamId = await obtenerTeamID(TEAM_NAME);
  if (teamId) {
    const fixtureId = await obtenerProximoPartido(teamId);
    if (fixtureId) {
      console.log(`🏆 El fixture_id del próximo partido de ${TEAM_NAME} es: ${fixtureId}`);
    } else {
      console.log('⚠️ No se pudo obtener el fixture_id.');
    }
  } else {
    console.log('⚠️ No se pudo obtener el ID del equipo.');
  }
}

// **Ejecutar la función**
main();


