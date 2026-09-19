const mineflayer = require('mineflayer');
const pathfinder = require('mineflayer-pathfinder').pathfinder;
const Movements = require('mineflayer-pathfinder').Movements;
const { GoalFollow } = require('mineflayer-pathfinder').goals;
const pvp = require('mineflayer-pvp').plugin;
const http = require('http');

// Keep-Alive Web Server for Render & UptimeRobot
http.createServer((req, res) => {
  res.write("Companion Bot is Online!");
  res.end();
}).listen(process.env.PORT || 8080);

function createMyBot() {
  console.log("Connecting to Aternos server...");

  const bot = mineflayer.createBot({
    host: 'louvar.aternos.host', // Your exact Aternos Dyn IP[cite: 1]
    port: 26962,                // Your exact Port[cite: 1]
    username: 'shishir',        // Updated username for your bot
    version: '26.1.1',          // Your PaperMC server version[cite: 2]
    checkTimeoutInterval: 60 * 1000
  });

  // Load movement and combat plugins
  bot.loadPlugin(pathfinder);
  bot.loadPlugin(pvp);

  bot.on('login', () => {
    console.log(` SUCCESS: ${bot.username} joined the game!`);
  });

  bot.on('spawn', () => {
    console.log(" Bot spawned in the world!");

    const defaultMove = new Movements(bot);
    bot.pathfinder.setMovements(defaultMove);

    // Loop: Automatically follow player and attack monsters
    setInterval(() => {
      // Find nearest hostile monster within 8 blocks (using entity.name to avoid deprecation warnings)
      const monster = bot.nearestEntity(entity => {
        return (entity.type === 'hostile' || 
               (entity.name && ['zombie', 'skeleton', 'spider', 'creeper'].includes(entity.name.toLowerCase()))) &&
               bot.entity.position.distanceTo(entity.position) < 8;
      });

      if (monster) {
        bot.pvp.attack(monster); // Defend against monster
      } else {
        // Follow nearest real player (your brother)
        const playerEntity = bot.nearestEntity(e => e.type === 'player' && e.username !== bot.username);
        if (playerEntity) {
          bot.pathfinder.setGoal(new GoalFollow(playerEntity, 2), true); // Maintain a 2-block distance
        }
      }
    }, 1000);
  });

  // Diagnostic logging
  bot.on('kicked', (reason) => console.log(" KICKED:", JSON.stringify(reason)));
  bot.on('error', (err) => console.log(" ERROR:", err.message));
  bot.on('end', () => {
    console.log(" DISCONNECTED. Reconnecting in 20s...");
    setTimeout(createMyBot, 20000);
  });
}

createMyBot();
