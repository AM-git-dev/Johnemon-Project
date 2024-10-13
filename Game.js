//GAME.js
import readline from 'readline';
import mysql from 'mysql2/promise'
import colors from 'colors';
import dotenv from 'dotenv'
import Johnemon from './Johnemon.js';
import JohnemonMaster from './JohnemonMaster.js';
import JohnemonWorld from './JohnemonWorld.js';
import JohnemonArena from './JohnemonArena.js';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const connection = await mysql.createConnection({
  host: process.env.HOST_NAME,
  user: process.env.USER_NAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE_NAME,
});
const johnemonMaster = new JohnemonMaster();
const johnemonWorld = new JohnemonWorld(johnemonMaster, saveGameState);
const johnemonWord = "Johnemon".red;

let currentPlayerId = null;

const newGame = async () =>  {
  const profName = "Prof. Catalpa".green;
  console.log(`\nBonjour, je suis le ${profName}, chercheur en ${johnemonWord}. Heureux de vous rencontrer.\n`);
  askForName();
}

const createTableIfPlayerNotExisting = async () => {
  const tableExistsQuery = `
        SELECT COUNT(*) AS count
        FROM information_schema.tables
        WHERE table_schema = 'johnemon'
          AND table_name = 'players';
    `;

  const [result] = await connection.execute(tableExistsQuery);
  const tableExisting = result[0].count > 0;

  if (!tableExisting) {
    const queryToCreateTables = `
         CREATE TABLE Players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE Johnemon (
    id INT AUTO_INCREMENT PRIMARY KEY,
    playerId INT,
    name VARCHAR(255),
    level INT,
    experience INT,
    attackRange INT,
    defenseRange INT,
    maxLife INT,
    actualLife INT,
    shiny BOOLEAN,
    FOREIGN KEY (playerId) REFERENCES Players(id)
);

CREATE TABLE Worlds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    playerId INT,
    day INT,
    worldName VARCHAR(255),
    FOREIGN KEY (playerId) REFERENCES Players(id)
);

CREATE TABLE Logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    playerId INT,
    logMessage TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (playerId) REFERENCES Players(id)
);
`

    await connection.execute(queryToCreateTables);
    console.log("Game successfully initialized.");
    newGame();
  } else {
    console.log("There is already a Game");
    const [players] = await connection.execute('SELECT * FROM Players');

    if (players.length > 0) {
      await askForLoadOrNewGame();
    } else {
      newGame();
    }

  }
};

async function askForLoadOrNewGame() {
  try {
    const [players] = await connection.execute('SELECT * FROM Players');

    if (players.length > 0) {
      console.log("Vous avez des sauvegardes existantes.");
      return new Promise((resolve) => {
        rl.question("Voulez-vous charger une sauvegarde (1) ou commencer un nouveau jeu (2) ? ", async (answer) => {
          if (answer === '1') {
            // Si plusieurs joueurs existent, vous pouvez ajouter une sélection ici
            const player = players[0]; // Pour simplifier, choisir le premier joueur
            currentPlayerId = player.id;
            await loadGameState(player.id);
            mainGame();
          } else if (answer === '2') {
            newGame();
          } else {
            console.log("Choix invalide. Veuillez choisir 1 pour charger ou 2 pour un nouveau jeu.");
            await askForLoadOrNewGame();
          }
          resolve();
        });
      });
    } else {
      newGame();
    }
  } catch (error) {
    console.error("Erreur lors de la vérification des sauvegardes:", error);
  }
}


await createTableIfPlayerNotExisting();



async function ensurePlayerExists(name) {
  try {
    const [players] = await connection.execute('SELECT * FROM Players WHERE name = ?', [name]);

    if (players.length === 0) {
      const [result] = await connection.execute('INSERT INTO Players (name) VALUES (?)', [name]);
      console.log(`Nouveau joueur créé avec l'ID: ${result.insertId}`);
      return result.insertId;
    }

    console.log(`Joueur trouvé avec l'ID: ${players[0].id}`);
    return players[0].id;
  } catch (error) {
    console.error("Erreur dans ensurePlayerExists:", error);
    throw error;
  }
}

async function saveGameState() {
  if (currentPlayerId === null) {
    console.error("Aucun joueur actif pour sauvegarder le jeu.");
    return;
  }

  try {
    console.log(`Sauvegarde du joueur ID: ${currentPlayerId}`);

    // Mettre à jour ou insérer les Johnemon
    for (const johnemon of johnemonMaster.johnemonCollection) {
      console.log(`Vérification de l'existence de Johnemon: ${johnemon.name}`);
      const [existingJohnemons] = await connection.execute(
          'SELECT * FROM Johnemon WHERE playerId = ? AND name = ?',
          [currentPlayerId, johnemon.name]
      );

      if (existingJohnemons.length > 0) {
        const existingJohnemon = existingJohnemons[0];
        console.log(`Mise à jour du Johnemon ID: ${existingJohnemon.id}`);
        await connection.execute(
            'UPDATE Johnemon SET level = ?, experience = ?, attackRange = ?, defenseRange = ?, maxLife = ?, actualLife = ?, shiny = ? WHERE id = ?',
            [
              johnemon.level,
              johnemon.experience,
              johnemon.attackRange,
              johnemon.defenseRange,
              johnemon.maxLife,
              johnemon.actualLife,
              johnemon.shiny,
              existingJohnemon.id
            ]
        );
      } else {
        console.log(`Insertion d'un nouveau Johnemon: ${johnemon.name}`);
        await connection.execute(
            'INSERT INTO Johnemon (playerId, name, level, experience, attackRange, defenseRange, maxLife, actualLife, shiny) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [currentPlayerId, johnemon.name, johnemon.level, johnemon.experience, johnemon.attackRange, johnemon.defenseRange, johnemon.maxLife, johnemon.actualLife, johnemon.shiny]
        );
      }
    }

    // Mettre à jour ou insérer le monde
    const [existingWorlds] = await connection.execute('SELECT * FROM Worlds WHERE playerId = ?', [currentPlayerId]);

    if (existingWorlds.length > 0) {
      console.log(`Mise à jour du monde pour le joueur ID: ${currentPlayerId}`);
      await connection.execute(
          'UPDATE Worlds SET day = ?, worldName = ? WHERE playerId = ?',
          [johnemonWorld.day, johnemonWorld.worldName, currentPlayerId]
      );
    } else {
      console.log(`Insertion d'un nouveau monde pour le joueur ID: ${currentPlayerId}`);
      await connection.execute(
          'INSERT INTO Worlds (playerId, day, worldName) VALUES (?, ?, ?)',
          [currentPlayerId, johnemonWorld.day, johnemonWorld.worldName]
      );
    }

    // Insérer les logs
    for (const log of johnemonWorld.logs) {
      console.log(`Insertion d'un log: ${log}`);
      await connection.execute(
          'INSERT INTO Logs (playerId, logMessage) VALUES (?, ?)',
          [currentPlayerId, log]
      );
    }

    console.log("Jeu sauvegardé avec succès.");
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du jeu:", error);
  }
}


async function loadGameState(playerId) {
  try {
    currentPlayerId = playerId; // Définir currentPlayerId

    // Charger les Johnemon
    const [rows] = await connection.execute('SELECT * FROM Johnemon WHERE playerId = ?', [playerId]);
    johnemonMaster.johnemonCollection = rows.map(row => new Johnemon(row.name, row.level, row.experience, row.attackRange, row.defenseRange, row.maxLife, row.actualLife, row.shiny));

    // Charger le monde
    const [worldRows] = await connection.execute('SELECT * FROM Worlds WHERE playerId = ?', [playerId]);
    if (worldRows.length) {
      johnemonWorld.day = worldRows[0].day;
      johnemonWorld.worldName = worldRows[0].worldName;
    }

    // Charger les logs
    const [logRows] = await connection.execute('SELECT * FROM Logs WHERE playerId = ?', [playerId]);
    johnemonWorld.logs = logRows.map(logRow => logRow.logMessage);

    console.log("Jeu chargé avec succès.");
  } catch (error) {
    console.error("Erreur lors du chargement du jeu:", error);
  }
}



  async function askForName() {
    rl.question("Je ne pense pas vous avoir vu auparavant. Quel est votre nom ? \n\n", async (name) => {
      readline.moveCursor(process.stdout, 0, -1);
      readline.clearLine(process.stdout, 0);
      console.log(`Alors vous êtes ${name.yellow} ! Quel beau nom !\n`);
      johnemonMaster.name = name;
      currentPlayerId = await ensurePlayerExists(name);
      askForWorldName();
    });


}

function askForWorldName() {
  rl.question("Quel est le nom de votre monde ? \n\n", (worldName) => {
    readline.moveCursor(process.stdout, 0, -1);
    readline.clearLine(process.stdout, 0);
    console.log(`\nVous commencez votre aventure dans ${worldName.blue}!\n\n${worldName.blue} est un monde rempli de créatures appelées '${johnemonWord}'.\nDepuis des temps anciens, les ${johnemonWord} trouvés dans la nature sont hostiles.\n\nVous aurez besoin d'un ${johnemonWord} apprivoisé pour vous défendre pendant votre voyage. Suivez-moi dans mon laboratoire.\n`);
    johnemonWorld.worldName = worldName;
    console.log('Vous suivez le professeur.\n');
    proposeFirstJohnemon();
  });
}

function proposeFirstJohnemon() {
  const firstJohnemon = new Johnemon();
  const secondJohnemon = new Johnemon();
  const thirdJohnemon = new Johnemon();

  rl.question(`Nous y sommes ! Comme je l'ai dit plus tôt, je vais vous donner un ${johnemonWord} pour que vous soyez en sécurité partout où vous allez.\n\nChoisissez celui que vous voulez : \n\n 1- ${firstJohnemon.name} \n 2- ${secondJohnemon.name} \n 3- ${thirdJohnemon.name} \n\n`, (choice) => {
    readline.moveCursor(process.stdout, 0, -1);
    readline.clearLine(process.stdout, 0);
    let selectedJohnemon;

    if (choice === '1') {
      selectedJohnemon = firstJohnemon;
    } else if (choice === '2') {
      selectedJohnemon = secondJohnemon;
    } else if (choice === '3') {
      selectedJohnemon = thirdJohnemon;
    } else {
      console.log("Veuillez choisir un numéro entre 1 et 3.");
      return proposeFirstJohnemon();
    }

    johnemonMaster.johnemonCollection.push(selectedJohnemon);
    johnemonWorld.addLog(`${selectedJohnemon.name} a été ajouté à votre collection !`);
    console.log(`\nFélicitations, ${johnemonMaster.name}, vous avez maintenant votre premier ${johnemonWord} : ${selectedJohnemon.name}!\n`);

    mainGame();
  });
}

async function mainGame() {
  console.log(`\nLe jour ${johnemonWorld.day} commence...\n`);

  rl.question(`Que voulez-vous faire aujourd'hui ? \n\n 1- Soigner un ${johnemonWord} à ses PV Max\n 2- Ressusciter un ${johnemonWord} mid-Life\n 3- Libérer un ${johnemonWord} de votre équipe\n 4- Renommer un ${johnemonWord} de votre équipe\n 5- Afficher votre équipe\n 6- Ne rien faire ce jour\n 7- Sauvegarder le Jeu\n \n\n`, async (choice) => {
    readline.moveCursor(process.stdout, 0, -1);
    readline.clearLine(process.stdout, 0);
    switch(choice) {
      case '1':
      case '2':
      case '3':
      case '4':
        await handleJohnemonManagement(choice);
        break;
      case '5':
        johnemonMaster.showCollection();
        await mainGame();
        break;
      case '6':
        johnemonWorld.oneDayPasses("6");
        checkRandomEvent();
        break;
      case '7':
        johnemonWorld.oneDayPasses("7");
        await saveGameState();
        await mainGame();
        break;
      default:
        console.log("Choix invalide, veuillez réessayer.");
        await mainGame();
        break;
    }
  });
}


async function handleJohnemonManagement(choice) {
  johnemonMaster.showCollection();

  rl.question(`Quel ${johnemonWord} ? Veuillez entrer le numéro :\n\n`, async (index) => {
    readline.moveCursor(process.stdout, 0, -1);
    readline.clearLine(process.stdout, 0);
    const johnemonIndex = parseInt(index) - 1;
    if (johnemonIndex >= 0 && johnemonIndex < johnemonMaster.johnemonCollection.length) {
      let newName = null;
      if (choice === '4') {
        rl.question(`Quel est le nouveau nom pour votre ${johnemonWord} ?\n`, async (name) => {
          readline.moveCursor(process.stdout, 0, -1);
          readline.clearLine(process.stdout, 0);
          newName = name;
          johnemonMaster.johnemonCollection[johnemonIndex].name = newName;
          johnemonWorld.addLog(`${newName} a été renommé avec succès !`);
          console.log(`Votre ${johnemonWord} a été renommé en ${newName}.\n`);
          johnemonWorld.oneDayPasses(choice, johnemonIndex, newName);
          checkRandomEvent();
          await mainGame();
        });
      } else {
        johnemonWorld.oneDayPasses(choice, johnemonIndex);
        checkRandomEvent();
        await mainGame();
      }
    } else {
      console.log("Sélection de Johnemon invalide.");
      await mainGame();
    }
  });
}


function checkRandomEvent() {
  const event = johnemonWorld.randomizeEvent();
  if (event === 'battle') {
    startBattle();
  } else {
    mainGame();
  }
}

function startBattle() {
  const wildJohnemon = new Johnemon();
  const wildNameDisplay = wildJohnemon.shiny ? wildJohnemon.name.rainbow : wildJohnemon.name;
  console.log(`Un ${wildNameDisplay} sauvage est apparu!\n`);

  johnemonMaster.showCollection();

  rl.question(`Choisis ton Johnemon pour le combat (numéro):\n`, (choice) => {
    readline.moveCursor(process.stdout, 0, -1);
    readline.clearLine(process.stdout, 0);
    const selectedIndex = parseInt(choice) - 1;
    if (selectedIndex >= 0 && selectedIndex < johnemonMaster.johnemonCollection.length) {
      const playerJohnemon = johnemonMaster.johnemonCollection[selectedIndex];
      console.log(`Tu as choisi ${playerJohnemon.name} pour le combat!`);

      battle(playerJohnemon, wildJohnemon);
    } else {
      console.log("Choix invalide, veuillez choisir un Johnemon valide.");
      startBattle();
    }
  });
}


function battle(playerJohnemon, enemyJohnemon) {
  const arena = new JohnemonArena();
  const playerDisplay = playerJohnemon.shiny ? playerJohnemon.name.rainbow : playerJohnemon.name;
  const enemyDisplay = enemyJohnemon.shiny ? enemyJohnemon.name.rainbow : enemyJohnemon.name;
  console.log(`Début du combat entre ${playerDisplay} et ${enemyDisplay}!\n`);

  if (enemyJohnemon.shiny) {
    console.log(`Le ${enemyDisplay} est shiny!`);
  }

  const battleLoop = () => {
    rl.question(`Que voulez-vous faire ?\n 1- Attaquer\n 2- Capturer\n 3- Utiliser un objet de soin\n 4- Fuir\n`, (actionChoice) => {
      readline.moveCursor(process.stdout, 0, -1);
      readline.clearLine(process.stdout, 0);
      let action;
      switch(actionChoice) {
        case '1':
          action = 'attack';
          break;
        case '2':
          action = 'catch';
          break;
        case '3':
          action = 'useItem';
          break;
        case '4':
          action = 'flee';
          break;
        default:
          console.log("Choix invalide.");
          return battleLoop();
      }


      const result = arena.processPlayerAction(action, playerJohnemon, enemyJohnemon, johnemonMaster);
      console.log(result.message);


      if (result.battleStatus !== 'ongoing') {

        if (result.battleStatus === 'enemyDefeated') {
          console.log(`Vous avez remporté le combat!\n`);
          console.log(`Le jour ${johnemonWorld.day} se termine.\n`)

          mainGame();
        } else if (result.battleStatus === 'playerDefeated') {
          console.log(`Vous avez perdu le combat...\n`);
          console.log(`Le jour ${johnemonWorld.day} se termine.\n`)

          mainGame();
        } else if (result.battleStatus === 'captured') {
          console.log(`Vous avez capturé ${enemyJohnemon.name} !\n`);
          console.log(`Le jour ${johnemonWorld.day} se termine.\n`)

          mainGame();
        } else if (result.battleStatus === 'fled') {
          console.log(`Vous avez fui le combat.\n`);
          console.log(`Le jour ${johnemonWorld.day} se termine.\n`)
          mainGame();
        }
      } else {

        const enemyResult = arena.enemyTurn(playerJohnemon, enemyJohnemon);
        console.log(enemyResult.message);

        if (enemyResult.battleStatus === 'playerDefeated') {
          console.log(`Vous avez perdu le combat...\n`);
          mainGame();
        } else {
          battleLoop();
        }
      }
    });
  };

  battleLoop();
}

export default saveGameState()