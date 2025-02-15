const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");

const API_KEY = "417609c465cf397d99475d3a09519805"; // Clave válida
const SPORT_KEY = "soccer_mexico_ligamx"; // Liga MX
const REGIONS = "us"; // Opciones: us, uk, eu, au
const MARKETS = "h2h"; // ⚽ Cambio a "h2h" para mostrar local, empate o visitante
const ODDS_FORMAT = "decimal"; // Opciones: decimal o american
const TELEGRAM_TOKEN = "7740053465:AAHzOoXb4TSDFLytRBPPy1IxbVV2CWJ3prI"; // Token de Telegram
const TARGET_BOOKMAKER = "BetUS"; // 🏛 Casa de apuestas a mostrar

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Diccionario de emojis para equipos de la Liga MX
const teamEmojis = {
  "América": "🦅",
  "Chivas": "🐐",
  "Tigres UANL": "🐯",
  "Cruz Azul": "🔵",
  "Pumas UNAM": "🐆",
  "Monterrey": "⚡",
  "Toluca": "😈",
  "Atlas": "🦊",
  "León": "🦁",
  "Santos Laguna": "💚",
  "Pachuca": "🏔",
  "Querétaro": "🐓",
  "Necaxa": "⚡",
  "Mazatlán FC": "⚓",
  "Juárez": "🐴",
  "Tijuana": "🐕",
  "San Luis": "🏴‍☠️",
  "Puebla": "🔵⚪"
};

// Función para agregar emoji al nombre del equipo
function getTeamNameWithEmoji(teamName) {
  return teamEmojis[teamName] ? `${teamEmojis[teamName]} ${teamName}` : teamName;
}

// Función para enviar mensajes largos en partes
function sendLargeMessage(chatId, message) {
  const MAX_MESSAGE_LENGTH = 4096;
  while (message.length > MAX_MESSAGE_LENGTH) {
    bot.sendMessage(chatId, message.substring(0, MAX_MESSAGE_LENGTH));
    message = message.substring(MAX_MESSAGE_LENGTH);
  }
  bot.sendMessage(chatId, message);
}

// Comando /resultado para obtener momios de 1X2 (local, empate o visitante)
bot.onText(/\/ligamx/, (msg) => {
  const chatId = msg.chat.id;
  const url = `https://api.the-odds-api.com/v4/sports/${SPORT_KEY}/odds/?apiKey=${API_KEY}&regions=${REGIONS}&markets=${MARKETS}&oddsFormat=${ODDS_FORMAT}`;

  axios.get(url)
    .then(response => {
      if (!response.data || response.data.length === 0) {
        bot.sendMessage(chatId, "⚠️ No hay datos disponibles para los resultados en este momento.");
        return;
      }

      const currentDate = new Date().getTime();

      let upcomingMatches = response.data
        .filter(match => new Date(match.commence_time).getTime() > currentDate)
        .sort((a, b) => new Date(a.commence_time) - new Date(b.commence_time))
        .slice(0, 5);

      if (upcomingMatches.length === 0) {
        bot.sendMessage(chatId, "⚠️ No hay partidos próximos en la Liga MX.");
        return;
      }

      let message = "🏆 *Próximos 5 partidos de la Liga MX y Momios de Resultado (Bet365):*\n";
      let foundOdds = false;

      upcomingMatches.forEach(match => {
        const bet365 = match.bookmakers.find(bookmaker => bookmaker.title === TARGET_BOOKMAKER);
        
        if (bet365) {
          foundOdds = true;
          
          const homeTeam = getTeamNameWithEmoji(match.home_team);
          const awayTeam = getTeamNameWithEmoji(match.away_team);

          message += `\n⚽ *Partido:* ${homeTeam} 🆚 ${awayTeam}`;
          message += `\n📅 *Fecha:* ${new Date(match.commence_time).toLocaleString()}`;
          message += `\n🏛 *Casa de apuestas:* ${bet365.title}`;

          bet365.markets.forEach(market => {
            if (market.key === "h2h") {
              const outcomes = market.outcomes;
              const local = outcomes.find(outcome => outcome.name === match.home_team);
              const empate = outcomes.find(outcome => outcome.name === "Draw");
              const visitante = outcomes.find(outcome => outcome.name === match.away_team);

              if (local && empate && visitante) {
                message += `\n🏠 *Local (${homeTeam}):* ${local.price}`;
                message += `\n⚖️ *Empate:* ${empate.price}`;
                message += `\n🚀 *Visitante (${awayTeam}):* ${visitante.price}`;

                // 🔥 Agregar recomendación de apuesta
                let recommendation = "\n🎯 *Recomendación:* ";
                if (local.price < 2.00) {
                  recommendation += `Apostar por *${homeTeam}* 🏠`;
                } else if (visitante.price < 2.00) {
                  recommendation += `Apostar por *${awayTeam}* 🚀`;
                } else if (empate.price >= 3.00 && empate.price <= 3.50) {
                  recommendation += `Posible empate ⚖️`;
                } else {
                  recommendation += `Evitar apostar, partido incierto ❌`;
                }
                message += recommendation;
              }
            }
          });

          message += "\n───────────────────";
        }
      });

      if (!foundOdds) {
        bot.sendMessage(chatId, `⚠️ No se encontraron momios de resultado en *${TARGET_BOOKMAKER}* para los próximos partidos.`);
      } else {
        sendLargeMessage(chatId, message);
      }
    })
    .catch(error => {
      console.error(error);
      bot.sendMessage(chatId, "❌ Error obteniendo los datos.");
    });
});
