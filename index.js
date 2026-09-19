const mineflayer = require('mineflayer');
const http = require('http');

// Render web service keep-alive endpoint
const PORT = process.env.PORT || 8080;

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Companion Bot is Online!');
}).listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

let reconnectTimer = null;

function createMyBot() {
  console.log('----------------------------------------');
  console.log('Connecting to Minecraft server...');
  console.log('Host: ling.aternos.host');
  console.log('Port: 26962');
  console.log('Username: shishir_bot');
  console.log('----------------------------------------');

  const bot = mineflayer.createBot({
    host: 'ling.aternos.host',
    port: 26962,

    username: 'shishir_bot',

    // Only use offline if the Minecraft server itself
    // is configured for offline/cracked players.
    auth: 'offline',

    // IMPORTANT:
    // This must match the actual Minecraft server version.
    version: '1.20.6',

    // Do NOT use fakeHost unless your server/proxy requires it.
    checkTimeoutInterval: 60000,
    connectTimeout: 30000
  });

  bot.once('login', () => {
    console.log('SUCCESS: Bot logged into the Minecraft server.');
  });

  bot.once('spawn', () => {
    console.log('SUCCESS: Bot spawned into the world.');

    startBotLogic(bot);
  });

  bot.on('kicked', (reason) => {
    console.log('KICKED:');

    if (typeof reason === 'object') {
      console.log(JSON.stringify(reason, null, 2));
    } else {
      console.log(reason);
    }
  });

  bot.on('error', (err) => {
    console.log('BOT ERROR:', err);
  });

  bot.on('end', (reason) => {
    console.log('DISCONNECTED:', reason);

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }

    reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect...');
      createMyBot();
    }, 15000);
  });
}

function startBotLogic(bot) {
  setInterval(async () => {
    if (!bot.entity || !bot.entity.position) {
      return;
    }

    // Find nearby hostile mob
    const mob = bot.nearestEntity(entity => {
      if (!entity.position) return false;

      const hostile =
        entity.type === 'hostile' ||
        (
          entity.name &&
          ['zombie', 'skeleton', 'spider', 'creeper'].includes(
            entity.name.toLowerCase()
          )
        );

      return (
        hostile &&
        bot.entity.position.distanceTo(entity.position) < 5
      );
    });

    if (mob) {
      try {
        await bot.lookAt(
          mob.position.offset(0, mob.height || 1, 0),
          true
        );

        bot.attack(mob);
      } catch (err) {
        console.log('Combat error:', err.message);
      }

      return;
    }

    // Find nearest player
    const player = bot.nearestEntity(entity => {
      return (
        entity.type === 'player' &&
        entity.username !== bot.username &&
        entity.position
      );
    });

    if (player) {
      const distance = bot.entity.position.distanceTo(
        player.position
      );

      try {
        await bot.lookAt(
          player.position.offset(0, player.height || 1, 0),
          true
        );
      } catch (err) {
        // Ignore occasional look errors
      }

      if (distance > 3) {
        bot.setControlState('forward', true);
        bot.setControlState('sprint', distance > 6);
      } else {
        bot.setControlState('forward', false);
        bot.setControlState('sprint', false);
      }
    } else {
      bot.clearControlStates();
    }

  }, 500);
}

createMyBot();
