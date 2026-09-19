const mineflayer = require('mineflayer');
const http = require('http');

// Keep-Alive Server for Render
http.createServer((req, res) => {
  res.write("Companion Bot is Online!");
  res.end();
}).listen(process.env.PORT || 8080);

function createMyBot() {
  console.log("Attempting handshake with Aternos server...");

  const bot = mineflayer.createBot({
    host: 'shafi.aternos.me', // Main server address[cite: 2]
    port: 26962,             // Server port[cite: 1, 2]
    username: 'shishir',
    version: '1.20.4',       // Standard base protocol
    auth: 'offline',         // Explicit offline mode for Cracked servers
    checkTimeoutInterval: 90 * 1000
  });

  bot.on('login', () => {
    console.log(` SUCCESS: ${bot.username} logged into the server!`);
  });

  bot.on('spawn', () => {
    console.log(" Bot spawned into the world!");

    // Simple AI loop
    setInterval(() => {
      // 1. Attack hostile mobs within 5 blocks
      const mob = bot.nearestEntity(e => 
        (e.type === 'hostile' || (e.name && ['zombie', 'skeleton', 'spider', 'creeper'].includes(e.name.toLowerCase()))) &&
        bot.entity.position.distanceTo(e.position) < 5
      );

      if (mob) {
        bot.lookAt(mob.position.offset(0, mob.height, 0));
        bot.attack(mob);
        return;
      }

      // 2. Locate nearest player
      const player = bot.nearestEntity(e => e.type === 'player' && e.username !== bot.username);
      if (player) {
        const dist = bot.entity.position.distanceTo(player.position);
        bot.lookAt(player.position.offset(0, player.height, 0));

        if (dist > 3) {
          bot.setControlState('forward', true);
          bot.setControlState('sprint', dist > 6);
        } else {
          bot.setControlState('forward', false);
          bot.setControlState('sprint', false);
        }
      } else {
        bot.clearControlStates();
      }
    }, 500);
  });

  bot.on('kicked', (reason) => console.log(" KICKED:", JSON.stringify(reason)));
  bot.on('error', (err) => console.log(" ERROR:", err.message));
  bot.on('end', () => {
    console.log(" DISCONNECTED. Reconnecting in 20s...");
    setTimeout(createMyBot, 20000);
  });
}

createMyBot();
