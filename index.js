const mineflayer = require('mineflayer');
const http = require('http');

// Keep-Alive Web Server for Render & UptimeRobot
http.createServer((req, res) => {
  res.write("Mineflayer Bot Diagnostic Server is Live!");
  res.end();
}).listen(process.env.PORT || 8080);

function createMyBot() {
  console.log("Connecting to Aternos server (louvar.aternos.host:26962)...");

  const bot = mineflayer.createBot({
    host: 'louvar.aternos.host', // Exact Dyn IP from Aternos Connect popup
    port: 26962,                // Exact Port
    username: 'CompanionBot',   // Bot username
    checkTimeoutInterval: 60 * 1000 // Prevents premature timeout drops
  });

  // Successful connection events
  bot.on('login', () => {
    console.log(` SUCCESS: ${bot.username} logged in!`);
  });

  bot.on('spawn', () => {
    console.log(" Bot spawned into the world!");
  });

  // Detailed Diagnostics for Render Logs
  bot.on('kicked', (reason) => {
    console.log(" KICKED FROM SERVER:", JSON.stringify(reason));
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
