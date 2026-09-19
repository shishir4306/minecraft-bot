const mineflayer = require('mineflayer');
const http = require('http');

// Keep-Alive Server for Render
http.createServer((req, res) => {
  res.write("Companion Bot is Online!");
  res.end();
}).listen(process.env.PORT || 8080);

function createMyBot() {
  console.log("Connecting to Aternos server as shishir...");

  const bot = mineflayer.createBot({
    host: 'louvar.aternos.host', // Exact Dyn IP[cite: 1]
    port: 26962,                // Exact Port[cite: 1]
    username: 'shishir',        // Bot username
    version: '26.1.1',          // Server version
    checkTimeoutInterval: 60 * 1000
  });

  bot.on('login', () => {
    console.log(` SUCCESS: ${bot.username} logged into the server!`);
  });

  bot.on('spawn', () => {
    console.log(" Bot spawned into the world!");

    // Native AI loop running every 500ms
    setInterval(() => {
      // 1. Look for nearby hostile mobs within 5 blocks
      const mob = bot.nearestEntity(e => 
        (e.type === 'hostile' || (e.name && ['zombie', 'skeleton', 'spider', 'creeper'].includes(e.name.toLowerCase()))) &&
        bot.entity.position.distanceTo(e.position) < 5
      );

      if (mob) {
        bot.lookAt(mob.position.offset(0, mob.height, 0));
        bot.attack(mob);
        return;
      }

      // 2. Locate nearest player (your brother)
      const player = bot.nearestEntity(e => e.type === 'player' && e.username !== bot.username);
      if (player) {
        const dist = bot.entity.position.distanceTo(player.position);
        
        // Look at the player
        bot.lookAt(player.position.offset(0, player.height, 0));

        // Walk toward player if more than 3 blocks away
        if (dist > 3) {
          bot.setControlState('forward', true);
          bot.setControlState('sprint', dist > 6); // Sprint if far away
        } else {
          bot.setControlState('forward', false);
          bot.setControlState('sprint', false);
        }
      } else {
        // Stop moving if no player is nearby
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
