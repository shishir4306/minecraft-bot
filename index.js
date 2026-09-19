const mineflayer = require('mineflayer');
const http = require('http');

// 1. Keep-Alive Web Server for Render & UptimeRobot
http.createServer((req, res) => {
  res.write("Mineflayer Bot Diagnostic Server is Live!");
  res.end();
}).listen(process.env.PORT || 8080);

function createMyBot() {
  console.log("Connecting to Aternos server...");

  const bot = mineflayer.createBot({
    host: 'shafi.aternos.me', // Your Aternos Server Address
    port: 26962,              // Your exact Port
    username: 'CompanionBot', // In-game name for the bot
    version: '26.1.1'         // Matches your exact PaperMC version
  });

  // Connection events
  bot.on('login', () => {
    console.log(` SUCCESS: ${bot.username} logged in successfully!`);
  });

  bot.on('spawn', () => {
    console.log(" Bot spawned into the world!");
  });

  // Error & Disconnect Diagnostics
  bot.on('kicked', (reason) => {
    console.log(" KICKED FROM SERVER REASON:", JSON.stringify(reason));
  });

  bot.on('error', (err) => {
    console.log(" CONNECTION ERROR DETECTED:", err.message);
  });

  bot.on('end', (reason) => {
    console.log(" DISCONNECTED REASON:", reason);
    console.log("Reconnecting in 30 seconds...");
    setTimeout(createMyBot, 30000); // Prevents rapid crash loops on Render
  });
}

createMyBot();
