const mineflayer = require('mineflayer');
const http = require('http');

// 1. Keep-Alive Web Server for Render & UptimeRobot
http.createServer((req, res) => {
  res.write("Mineflayer Bot Diagnostic Server is Live!");
  res.end();
}).listen(process.env.PORT || 8080);

function createMyBot() {
  console.log("Connecting to Aternos server (louvar.aternos.host:26962)...");

  const bot = mineflayer.createBot({
    host: 'louvar.aternos.host', // Your exact Dyn IP
    port: 26962,                // Your exact Port
    username: 'CompanionBot',   // In-game name for the bot
    version: '1.20.4',          // Base protocol version for PaperMC
    checkTimeoutInterval: 60 * 1000
  });

  // Successful connection events
  bot.on('login', () => {
    console.log(` SUCCESS: ${bot.username} logged into the server!`);
  });

  bot.on('spawn', () => {
    console.log(" Bot spawned into the world!");
  });

  // Diagnostic Error Handlers
  bot.on('kicked', (reason) => {
    console.log(" KICKED FROM SERVER REASON:", JSON.stringify(reason));
  });

  bot.on('error', (err) => {
    console.log(" CONNECTION ERROR DETECTED:", err.message);
  });

  bot.on('end', (reason) => {
    console.log(" DISCONNECTED REASON:", reason);
    console.log("Reconnecting in 20 seconds...");
    setTimeout(createMyBot, 20000);
  });
}

createMyBot();
