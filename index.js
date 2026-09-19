const mineflayer = require('mineflayer');
const http = require('http');

// 1. Keep-Alive Web Server (Required by free web hosts)
http.createServer((req, res) => {
  res.write("Mineflayer Bot is running!");
  res.end();
}).listen(process.env.PORT || 8080);

// 2. Mineflayer Bot Configuration
const bot = mineflayer.createBot({
  host: shafi.aternos.me, // Your Aternos Server IP
  port: 26962,                             // Server Port
  username: 'CompanionBot',                 // Bot Name
  version: '26.1.1'                        // Match your server's Minecraft version
});

bot.on('spawn', () => {
  console.log('Bot successfully joined the server!');
});

// Auto-reconnect if kicked or server restarts
bot.on('end', () => {
  console.log('Bot disconnected. Reconnecting in 10 seconds...');
  setTimeout(() => process.exit(1), 10000); // Host panel will auto-restart the process
});
