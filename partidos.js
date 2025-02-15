const axios = require("axios");

// Reemplaza con tu clave de API-Football
const API_KEY = "93220683c5ff9ed2278b8153e222eda5";

// Configuración de los headers para la solicitud
const headers = {
  "x-apisports-key": API_KEY,
  "Content-Type": "application/json",
};

// **Función para obtener detalles del partido usando el fixture_id**
async function obtenerDetallesPartido(fixtureId) {
  try {
    console.log(`🔍 Buscando detalles del partido ID: ${fixtureId}`);

    const response = await axios.get("https://v3.football.api-sports.io/fixtures", {
      headers,
      params: { id: fixtureId },
    });

    console.log("📡 Respuesta de la API (Fixture):", response.data);

    if (!response.data.response || response.data.response.length === 0) {
      console.log("❌ No se encontró el partido.");
      return null;
    }

    const partido = response.data.response[0];
    return {
      home: partido.teams.home.name,
      away: partido.teams.away.name,
      league: partido.league.name,
      date: partido.fixture.date,
      homeId: partido.teams.home.id,
      awayId: partido.teams.away.id,
    };
  } catch (error) {
    console.error("🛑 Error al obtener los detalles del partido:", error);
    return null;
  }
}

// **Función para obtener los próximos partidos del equipo**
async function obtenerProximosPartidos(teamId) {
  try {
    console.log(`📅 Buscando próximos partidos del equipo ID: ${teamId}`);

    const response = await axios.get("https://v3.football.api-sports.io/fixtures", {
      headers,
      params: {
        team: teamId,
        league: 262, // Liga MX (ajústalo si es necesario)
        season: 2024, // Asegúrate de que la temporada sea la correcta
        next: 5, // Número de próximos partidos a obtener
      },
    });

    console.log("📡 Respuesta de la API (Próximos partidos):", response.data);

    if (!response.data.response || response.data.response.length === 0) {
      console.log("❌ No hay próximos partidos programados.");
      return [];
    }

    return response.data.response.map((match) => ({
      fixtureId: match.fixture.id,
      home: match.teams.home.name,
      away: match.teams.away.name,
      date: match.fixture.date,
    }));
  } catch (error) {
    console.error("🛑 Error al obtener los próximos partidos:", error);
    return [];
  }
}

// **Función principal**
async function main(fixtureId) {
  const partido = await obtenerDetallesPartido(fixtureId);
  if (!partido) {
    console.log("⚠️ No se encontraron detalles del partido.");
    return;
  }

  console.log(`🏆 Partido encontrado: ${partido.home} vs ${partido.away}`);
  console.log(`📍 Liga: ${partido.league}`);
  console.log(`📅 Fecha: ${partido.date}`);

  // Obtener los próximos partidos del equipo local
  const proximosPartidos = await obtenerProximosPartidos(partido.homeId);
  if (proximosPartidos.length > 0) {
    console.log("\n📅 Próximos partidos:");
    proximosPartidos.forEach((match) => {
      console.log(`🔹 ${match.home} vs ${match.away} - 📅 ${match.date} (ID: ${match.fixtureId})`);
    });
  } else {
    console.log("⚠️ No hay próximos partidos programados.");
  }
}

// **Ejecutar la función con un fixture_id**
const FIXTURE_ID = 1007; // Sustituye con el fixture_id que ya obtuviste
main(FIXTURE_ID);
