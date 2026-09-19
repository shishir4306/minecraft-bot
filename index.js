const mineflayer = require('mineflayer');
const pathfinder = require('mineflayer-pathfinder').pathfinder;
const Movements = require('mineflayer-pathfinder').Movements;
const { GoalFollow } = require('mineflayer-pathfinder').goals;
const pvp = require('mineflayer-pvp').plugin;
const http = require('http');

// Keep-Alive Web Server for Render
http.createServer((req, res) => {
  res.write("Companion Bot is Online!");
  res.end();
}).listen(process.env.PORT || 8080);

function createMyBot() {
  console.log("Connecting to Aternos server...");

  const bot = mineflayer.createBot({
    host: 'louvar.aternos.host',
    port: 26962,
    username: 'CompanionBot',
    version: '26.1.1',
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
      // 1. Look for nearest hostile monster within 8 blocks
      const monster = bot.nearestEntity(entity => {
        return entity.type === 'mob' && 
               entity.mobType && 
               ['Zombie', 'Skeleton', 'Spider', 'Creeper'].includes(entity.mobType) &&
               bot.entity.position.distanceTo(entity.position) < 8;
      });

      if (monster) {
        bot.pvp.attack(monster); // Defend against monster
      } else {
        // 2. Otherwise follow your brother (or any active player)
        const playerEntity = bot.nearestEntity(e => e.type === 'player' && e.username !== bot.username);
        if (playerEntity) {
          bot.pathfinder.setGoal(new GoalFollow(playerEntity, 2), true); // Keep 2 blocks distance
        }
      }
    }, 1000);
  });

  bot.on('kicked', (reason) => console.log(" KICKED:", JSON.stringify(reason)));
  bot.on('error', (err) => console.log(" ERROR:", err.message));
  bot.on('end', () => {
    console.log(" DISCONNECTED. Reconnecting in 20s...");
    setTimeout(createMyBot, 20000);
  });
}

createMyBot();
