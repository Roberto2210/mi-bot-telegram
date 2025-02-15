const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");

const API_KEY = "417609c465cf397d99475d3a09519805"; // Clave válida
const SPORT_KEY = "soccer_mexico_ligamx"; // Liga MX
const REGIONS = "us"; // Opciones: us, uk, eu, au
const MARKETS = "h2h"; // ⚽ Para mostrar local, empate o visitante
const ODDS_FORMAT = "decimal"; // Opciones: decimal o american
const TELEGRAM_TOKEN = "TU_TELEGRAM_TOKEN"; // 🔒 Reemplaza con tu token
const TARGET_BOOKMAKER = "BetUS"; // 🏛 Casa de apuestas

const ADMIN_ID = 7007926934; // 🔥 TU ID DE TELEGRAM (Admin)
const validTokens = ["TOKEN123", "MIAPUESTABOT", "LIGAMX2024"];
const authorizedUsers = new Set([ADMIN_ID]);

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// 📌 Comando para obtener el ID del usuario
bot.onText(/\/id/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `🆔 Tu ID de Telegram es: *${chatId}*`, { parse_mode: "Markdown" });
});

// 📌 Comando para autorizar usuarios
bot.onText(/\/autorizar (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  if (chatId !== ADMIN_ID) return bot.sendMessage(chatId, "🚫 No tienes permiso para autorizar usuarios.");

  const newUserId = parseInt(match[1], 10);
  authorizedUsers.add(newUserId);
  bot.sendMessage(chatId, `✅ Usuario *${newUserId}* autorizado.`);
});

// 📌 Comando para ingresar con un token válido
bot.onText(/\/start (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  if (validTokens.includes(match[1])) {
    authorizedUsers.add(chatId);
    bot.sendMessage(chatId, "✅ Acceso concedido. Ya puedes usar los comandos del bot.");
  } else {
    bot.sendMessage(chatId, "❌ Token inválido.");
  }
});

// 📌 Función de autorización
function isAuthorized(chatId) {
  return authorizedUsers.has(chatId);
}

// 📌 Comando para mostrar momios y recomendaciones
bot.onText(/\/ligamx/, async (msg) => {
  const chatId = msg.chat.id;
  if (!isAuthorized(chatId)) return bot.sendMessage(chatId, "🚫 Acceso denegado. Ingresa un token válido con /start <token>");

  try {
    const url = `https://api.the-odds-api.com/v4/sports/${SPORT_KEY}/odds/?apiKey=${API_KEY}&regions=${REGIONS}&markets=${MARKETS}&oddsFormat=${ODDS_FORMAT}`;
    const response = await axios.get(url);

    if (!response.data || response.data.length === 0) {
      return bot.sendMessage(chatId, "⚠️ No hay datos disponibles.");
    }

    let message = "🏆 *Próximos partidos de la Liga MX:*
";

    response.data.slice(0, 5).forEach(match => {
      const bookmaker = match.bookmakers.find(bm => bm.title === TARGET_BOOKMAKER);
      if (bookmaker) {
        const market = bookmaker.markets.find(mkt => mkt.key === "h2h");
        if (market) {
          const odds = market.outcomes;
          const homeTeam = match.home_team;
          const awayTeam = match.away_team;
          const local = odds.find(outcome => outcome.name === homeTeam);
          const empate = odds.find(outcome => outcome.name === "Draw");
          const visitante = odds.find(outcome => outcome.name === awayTeam);

          message += `
⚽ *${homeTeam} vs ${awayTeam}*
🏠 Local: ${local ? local.price : "N/A"}
⚖️ Empate: ${empate ? empate.price : "N/A"}
🚀 Visitante: ${visitante ? visitante.price : "N/A"}`;

          // 🔥 Agregar recomendación de apuesta
          let recommendation = "\n🎯 *Recomendación:* ";
          if (local && local.price < 2.00) {
            recommendation += `Apostar por *${homeTeam}* 🏠`;
          } else if (visitante && visitante.price < 2.00) {
            recommendation += `Apostar por *${awayTeam}* 🚀`;
          } else if (empate && empate.price >= 3.00 && empate.price <= 3.50) {
            recommendation += `Posible empate ⚖️`;
          } else {
            recommendation += `Evitar apostar, partido incierto ❌`;
          }
          message += recommendation;
        }
      }
    });
    
    bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "❌ Error obteniendo los datos.");
  }
});

// 📌 Comando de ayuda
bot.onText(/\/ayuda/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = 
`ℹ️ *Ayuda del Bot*  

📌 Este bot muestra información sobre *Liga MX* y sugerencias de apuestas.  

🔹 *Comandos principales:*  
- /menu - Muestra el menú de comandos  
- /ligamx - Ver momios de la Liga MX  
- /recomendaciones - Sugerencias de apuestas  
- /estadisticas - Estadísticas recientes  
- /ayuda - Información sobre el bot  
`;

  bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
});
