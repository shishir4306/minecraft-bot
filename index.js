const mineflayer = require('mineflayer');
const http = require('http');

// =====================================================
// RENDER KEEP-ALIVE WEB SERVER
// =====================================================

const PORT = process.env.PORT || 8080;

http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain'
  });

  res.end('Companion Bot is Online!');
}).listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});


// =====================================================
// MINECRAFT BOT
// =====================================================

let reconnectTimer = null;

function createMyBot() {

  console.log('');
  console.log('========================================');
  console.log('Connecting shishir_bot...');
  console.log('Host: ling.aternos.host');
  console.log('Port: 26962');
  console.log('Minecraft version: 26.1.1');
  console.log('========================================');

  const bot = mineflayer.createBot({

    // Aternos DynIP
    host: 'ling.aternos.host',

    // Aternos port
    port: 26962,

    // Minecraft username
    username: 'shishir_bot',

    // Your Aternos server allows cracked/offline players
    auth: 'offline',

    // Minecraft version
    version: '26.1.1',

    // Connection settings
    connectTimeout: 30000,
    checkTimeoutInterval: 60000
  });


  // ===================================================
  // LOGIN
  // ===================================================

  bot.once('login', () => {
    console.log('');
    console.log('========================================');
    console.log('LOGIN SUCCESS!');
    console.log(`Username: ${bot.username}`);
    console.log('========================================');
  });


  // ===================================================
  // SPAWN
  // ===================================================

  bot.once('spawn', () => {

    console.log('');
    console.log('========================================');
    console.log('SPAWN SUCCESS!');
    console.log('BOT IS NOW IN THE WORLD!');
    console.log('========================================');

    startBotLogic(bot);
  });


  // ===================================================
  // KICKED
  // ===================================================

  bot.on('kicked', (reason) => {

    console.log('');
    console.log('========================================');
    console.log('BOT WAS KICKED');
    console.log('========================================');

    if (typeof reason === 'object') {
      console.log(JSON.stringify(reason, null, 2));
    } else {
      console.log(reason);
    }
  });


  // ===================================================
  // ERROR
  // ===================================================

  bot.on('error', (err) => {

    console.log('');
    console.log('========================================');
    console.log('BOT ERROR');
    console.log('========================================');

    console.log(err);
  });


  // ===================================================
  // DISCONNECTED
  // ===================================================

  bot.on('end', (reason) => {

    console.log('');
    console.log('========================================');
    console.log('BOT DISCONNECTED');
    console.log('========================================');

    console.log('Reason:', reason);

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }

    console.log('Reconnecting in 15 seconds...');

    reconnectTimer = setTimeout(() => {
      createMyBot();
    }, 15000);
  });
}


// =====================================================
// BOT AI / COMPANION LOGIC
// =====================================================

function startBotLogic(bot) {

  console.log('Starting companion bot logic...');

  setInterval(async () => {

    // Make sure the bot is actually spawned
    if (!bot.entity || !bot.entity.position) {
      return;
    }


    // =================================================
    // 1. FIND NEARBY HOSTILE MOB
    // =================================================

    const mob = bot.nearestEntity(entity => {

      if (!entity.position) {
        return false;
      }

      const isHostile =
        entity.type === 'hostile' ||
        (
          entity.name &&
          [
            'zombie',
            'skeleton',
            'spider',
            'creeper',
            'witch',
            'phantom',
            'husk',
            'stray'
          ].includes(entity.name.toLowerCase())
        );

      if (!isHostile) {
        return false;
      }

      const distance =
        bot.entity.position.distanceTo(entity.position);

      return distance < 5;
    });


    // =================================================
    // ATTACK MOB
    // =================================================

    if (mob) {

      try {

        await bot.lookAt(
          mob.position.offset(
            0,
            mob.height || 1,
            0
          ),
          true
        );

        bot.attack(mob);

      } catch (err) {

        console.log(
          'Combat error:',
          err.message
        );
      }

      return;
    }


    // =================================================
    // 2. FIND NEAREST PLAYER
    // =================================================

    const player = bot.nearestEntity(entity => {

      return (
        entity.type === 'player' &&
        entity.username !== bot.username &&
        entity.position
      );
    });


    // =================================================
    // FOLLOW PLAYER
    // =================================================

    if (player) {

      const distance =
        bot.entity.position.distanceTo(
          player.position
        );


      try {

        await bot.lookAt(
          player.position.offset(
            0,
            player.height || 1,
            0
          ),
          true
        );

      } catch (err) {

        // Ignore occasional look errors
      }


      if (distance > 3) {

        bot.setControlState(
          'forward',
          true
        );

        bot.setControlState(
          'sprint',
          distance > 6
        );

      } else {

        bot.setControlState(
          'forward',
          false
        );

        bot.setControlState(
          'sprint',
          false
        );
      }

    } else {

      bot.clearControlStates();
    }

  }, 500);
}


// =====================================================
// START BOT
// =====================================================

createMyBot();
