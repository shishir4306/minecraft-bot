const mineflayer = require('mineflayer');
const http = require('http');

// Keep-Alive Web Server for Render
http.createServer((req, res) => {
  res.write("Companion Bot is Online!");
  res.end();
}).listen(process.env.PORT || 8080);

function createMyBot() {
  console.log("Connecting shishir_bot directly...");

  const bot = mineflayer.createBot({
    host: 'louvar.aternos.host',
    port: 26962,
    username: 'shishir_bot',
    version: '1.20.4',
    skipValidation: true,       // Bypasses proxy handshake hangs
    hideErrors: false
  });

  bot.on('login', () => {
    console.log(` SUCCESS: ${bot.username} logged into the server!`);
  });

  bot.on('spawn', () => {
    console.log(" Bot spawned into the world!");

    setInterval(() => {
      // Attack nearby hostile mobs
      const mob = bot.nearestEntity(e => 
        (e.type === 'hostile' || (e.name && ['zombie', 'skeleton', 'spider', 'creeper'].includes(e.name.toLowerCase()))) &&
        bot.entity.position.distanceTo(e.position) < 5
      );

      if (mob) {
        bot.lookAt(mob.position.offset(0, mob.height, 0));
        bot.attack(mob);
        return;
      }

      // Follow active player
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
    console.log(" DISCONNECTED. Reconnecting in 15s...");
    setTimeout(createMyBot, 15000);
  });
}

createMyBot();
