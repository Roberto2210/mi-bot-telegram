const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");

const API_KEY = "417609c465cf397d99475d3a09519805"; // Clave válida
const SPORT_KEY = "soccer_mexico_ligamx"; // Liga MX
const REGIONS = "us"; // Opciones: us, uk, eu, au
const MARKETS = "h2h"; // ⚽ Para mostrar local, empate o visitante
const ODDS_FORMAT = "decimal"; // Opciones: decimal o american
const TELEGRAM_TOKEN = "7740053465:AAHzOoXb4TSDFLytRBPPy1IxbVV2CWJ3prI"; // 🔒 Reemplaza con tu token
const TARGET_BOOKMAKER = "BetUS"; // 🏛 Casa de apuestas

const ADMIN_ID = 7007926934; // 🔥 TU ID DE TELEGRAM (Admin)
const validTokens = ["TOKEN123", "MIAPUESTABOT", "LIGAMX2024"]; // Lista de tokens válidos
const authorizedUsers = new Set([ADMIN_ID]); // Admin ya está autorizado

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// 📌 Comando para obtener el ID del usuario
bot.onText(/\/id/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `🆔 Tu ID de Telegram es: *${chatId}*`, { parse_mode: "Markdown" });
});

// 📌 Comando para que el ADMIN autorice nuevos usuarios
bot.onText(/\/autorizar (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;

  if (chatId !== ADMIN_ID) {
    bot.sendMessage(chatId, "🚫 *No tienes permiso para autorizar usuarios.*", { parse_mode: "Markdown" });
    return;
  }

  const newUserId = parseInt(match[1], 10);
  authorizedUsers.add(newUserId);
  bot.sendMessage(chatId, `✅ Usuario *${newUserId}* autorizado correctamente.`, { parse_mode: "Markdown" });
});

// 📌 Comando para ingresar con un token válido
bot.onText(/\/start (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userToken = match[1];

  if (validTokens.includes(userToken)) {
    authorizedUsers.add(chatId);
    bot.sendMessage(chatId, "✅ *Acceso concedido.* Ya puedes usar los comandos del bot.", { parse_mode: "Markdown" });
  } else {
    bot.sendMessage(chatId, "❌ *Token inválido.* No tienes acceso al bot.", { parse_mode: "Markdown" });
  }
});

// 📌 Función para verificar autorización
function isAuthorized(chatId) {
  return authorizedUsers.has(chatId);
}

// 📌 Comando de menú
bot.onText(/\/menu/, (msg) => {
  const chatId = msg.chat.id;
  if (!isAuthorized(chatId)) return bot.sendMessage(chatId, "🚫 *Acceso denegado.* Ingresa un token válido con /start <token>", { parse_mode: "Markdown" });

  const menuMessage = `📋 *Menú de Comandos*  
1️⃣ /ligamx - 📊 *Ver momios de la Liga MX*  
2️⃣ /estadisticas - 📈 *Ver estadísticas recientes*  
3️⃣ /recomendaciones - 🎯 *Sugerencias de apuestas*  
4️⃣ /ayuda - ℹ️ *Información sobre el bot*  
  `;
  bot.sendMessage(chatId, menuMessage, { parse_mode: "Markdown" });
});

// 📌 Comando para mostrar momios de la Liga MX
bot.onText(/\/ligamx/, async (msg) => {
  const chatId = msg.chat.id;
  if (!isAuthorized(chatId)) return bot.sendMessage(chatId, "🚫 *Acceso denegado.* Ingresa un token válido con /start <token>", { parse_mode: "Markdown" });

  try {
    const url = `https://api.the-odds-api.com/v4/sports/${SPORT_KEY}/odds/?apiKey=${API_KEY}&regions=${REGIONS}&markets=${MARKETS}&oddsFormat=${ODDS_FORMAT}`;
    const response = await axios.get(url);

    if (!response.data || response.data.length === 0) {
      return bot.sendMessage(chatId, "⚠️ No hay datos disponibles en este momento.");
    }

    const currentDate = new Date().getTime();
    const upcomingMatches = response.data
      .filter(match => new Date(match.commence_time).getTime() > currentDate)
      .sort((a, b) => new Date(a.commence_time) - new Date(b.commence_time))
      .slice(0, 5);

    if (upcomingMatches.length === 0) {
      return bot.sendMessage(chatId, "⚠️ No hay partidos próximos en la Liga MX.");
    }

    let message = "🏆 *Próximos 5 partidos de la Liga MX y Momios:*\n";

    upcomingMatches.forEach(match => {
      const bookmaker = match.bookmakers.find(bm => bm.title === TARGET_BOOKMAKER);
      if (bookmaker) {
        const homeTeam = match.home_team;
        const awayTeam = match.away_team;
        const market = bookmaker.markets.find(mkt => mkt.key === "h2h");

        if (market) {
          const odds = market.outcomes;
          const local = odds.find(outcome => outcome.name === homeTeam);
          const empate = odds.find(outcome => outcome.name === "Draw");
          const visitante = odds.find(outcome => outcome.name === awayTeam);

          message += `
⚽ *${homeTeam} 🆚 ${awayTeam}*  
📅 *Fecha:* ${new Date(match.commence_time).toLocaleString()}  
🏠 *Local:* ${local ? local.price : "N/A"}  
⚖️ *Empate:* ${empate ? empate.price : "N/A"}  
🚀 *Visitante:* ${visitante ? visitante.price : "N/A"}  
───────────────────`;
        }
      }
    });

    bot.sendMessage(chatId, message, { parse_mode: "Markdown" });

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "❌ Error obteniendo los datos.");
  }
});

// 📌 Comando de recomendaciones de apuestas
bot.onText(/\/recomendaciones/, (msg) => {
  const chatId = msg.chat.id;
  if (!isAuthorized(chatId)) return bot.sendMessage(chatId, "🚫 *Acceso denegado.* Ingresa un token válido con /start <token>", { parse_mode: "Markdown" });

  // Aquí puedes personalizar las recomendaciones de apuestas
  const recomendaciones = [
    "🎯 *América vs Chivas:* Apuesta por el local (América) con momio de 2.10",
    "🎯 *Pumas vs Toluca:* Apuesta por el empate con momio de 3.30",
    "🎯 *Monterrey vs Santos:* Apuesta por más de 2.5 goles con momio de 1.75",
    "🎯 *León vs Pachuca:* Apuesta por la victoria de Pachuca con momio de 2.45",
  ];

  let message = "🎯 *Recomendaciones de apuestas para la Liga MX:* \n\n";
  recomendaciones.forEach(recomendacion => {
    message += `${recomendacion}\n`;
  });

  bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
});

// 📌 Comando de ayuda
bot.onText(/\/ayuda/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = 
`ℹ️ *Ayuda y Uso del Bot*  

📌 Este bot te permite obtener información sobre la *Liga MX* y recomendaciones de apuestas.  

🔹 *Comandos principales:*  
- Usa /menu para ver los comandos disponibles.  
- Usa /ligamx para obtener los momios de próximos partidos.  
- Usa /estadisticas para ver estadísticas de equipos.  
- Usa /recomendaciones para recibir sugerencias de apuestas.  

Si tienes problemas, contacta al administrador del bot.  
`;

  bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
});
