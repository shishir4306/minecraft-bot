const mineflayer = require('mineflayer');
const http = require('http');

// Keep-Alive Web Server for Render
http.createServer((req, res) => {
  res.write("Companion Bot is Online!");
  res.end();
}).listen(process.env.PORT || 8080);

function createMyBot() {
  console.log("Initiating direct handshake with Aternos...");

  const bot = mineflayer.createBot({
    host: 'louvar.aternos.host',
    port: 26962,
    username: 'shishir_bot',
    auth: 'offline',
    version: false,             // Allows Mineflayer to negotiate protocol automatically
    checkTimeoutInterval: 60 * 1000,
    connectTimeout: 30000
  });

  bot.on('login', () => {
    console.log(` SUCCESS: ${bot.username} logged into the server!`);
  });

  bot.on('spawn', () => {
    console.log(" Bot spawned into the world!");

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

      // 2. Locate and follow active player
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

  bot.on('kicked', (reason) => console.log(" KICKED REASON:", typeof reason === 'object' ? JSON.stringify(reason) : reason));
  bot.on('error', (err) => console.log(" ERROR DETAILS:", err.message));
  bot.on('end', (reason) => {
    console.log(" DISCONNECTED REASON:", reason);
    console.log("Reconnecting in 20s...");
    setTimeout(createMyBot, 20000);
  });
}

createMyBot();
