const mineflayer = require('mineflayer');
const http = require('http');

// HTTP Keep-Alive Server for Render
http.createServer((req, res) => {
  res.write("Companion Bot is Online!");
  res.end();
}).listen(process.env.PORT || 8080);

function createMyBot() {
  console.log("Connecting shishir_bot to ling.aternos.host:26962...");

  const bot = mineflayer.createBot({
    host: 'ling.aternos.host',      // Exact Dyn IP from your Connect modal
    port: 26962,                   // Port number
    username: 'shishir_bot',        // Distinct bot username
    auth: 'offline',               // Cracked / Offline mode support
    version: '1.20.4',             // Protocol matching PaperMC 26.1.1
    fakeHost: 'shafi.aternos.me',  // Primary Aternos address for proxy header passing
    clientBrand: 'vanilla',        // Spoof vanilla client metadata
    skipValidation: true,
    checkTimeoutInterval: 60 * 1000,
    connectTimeout: 30000
  });

  bot.on('login', () => {
    console.log(` SUCCESS: ${bot.username} logged into the server!`);
  });

  bot.on('spawn', () => {
    console.log(" Bot spawned into the world!");

    setInterval(() => {
      // 1. Combat logic: Attack nearby hostile mobs
      const mob = bot.nearestEntity(e => 
        (e.type === 'hostile' || (e.name && ['zombie', 'skeleton', 'spider', 'creeper'].includes(e.name.toLowerCase()))) &&
        bot.entity.position.distanceTo(e.position) < 5
      );

      if (mob) {
        bot.lookAt(mob.position.offset(0, mob.height, 0));
        bot.attack(mob);
        return;
      }

      // 2. Movement logic: Follow nearest active player
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

  bot.on('kicked', (reason) => {
    console.log(" KICKED REASON:", typeof reason === 'object' ? JSON.stringify(reason) : reason);
  });

  bot.on('error', (err) => {
    console.log(" ERROR DETAILS:", err.message);
  });

  bot.on('end', (reason) => {
    console.log(" DISCONNECTED REASON:", reason);
    console.log("Reconnecting in 15 seconds...");
    setTimeout(createMyBot, 15000);
  });
}

createMyBot();
