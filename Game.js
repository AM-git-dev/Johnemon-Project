const readline = require('readline');
const Johnemon = require('./Johnemon');
const JohnemonMaster = require('./JohnemonMaster'); 
const JohnemonWorld = require('./JohnemonWorld');
const JohnemonArena = require('./JohnemonArena');
const fs = require('fs');
const colors = require('colors');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const johnemonMaster = new JohnemonMaster();
const johnemonWorld = new JohnemonWorld(johnemonMaster, saveGameState); 
const johnemonWord = "Johnemon".red;
function newGame() {
  const profName = "Prof. Catalpa".green;
  console.log(`\nBonjour, je suis le ${profName}, chercheur en ${johnemonWord}. Heureux de vous rencontrer.\n`);
  askForName();
}

function saveGameState() {
  const gameState = {
    saved_on: new Date().toISOString(),
    JohnemonMaster: {
      name: johnemonMaster.name,
      johnemonCollection: johnemonMaster.johnemonCollection.map(johnemon => ({
        name: johnemon.name,
        level: johnemon.level,
        experience: johnemon.experience,
        attackRange: johnemon.attackRange,
        defenseRange: johnemon.defenseRange,
        maxLife: johnemon.maxLife,
        actualLife: johnemon.actualLife,
        shiny: johnemon.shiny,
        catchPhrase: johnemon.catchphrase,
      })),
      healingItems: johnemonMaster.healingItems,
      reviveItems: johnemonMaster.reviveItems,
      JOHNEBALLS: johnemonMaster.JOHNEBALLS,
    },
    day: johnemonWorld.day,
    logs: johnemonWorld.logs,
    worldName: johnemonWorld.worldName
  };

  const dataToSave = JSON.stringify(gameState, null, 2);

  fs.writeFile('save.json', dataToSave, (err) => {
    if (err) {
      console.log("Une erreur s'est produite lors de la sauvegarde du jeu:", err);
    } else {
      console.log("Jeu sauvegardé avec succès !");
    }
  });
}

function loadGameState() {
  fs.readFile('save.json', 'utf8', (err, data) => {
    if (err) {
      console.log("Une erreur s'est produite lors du chargement du jeu:", err);
    } else {
      const gameState = JSON.parse(data);
      johnemonMaster.name = gameState.JohnemonMaster.name;
      johnemonMaster.healingItems = gameState.JohnemonMaster.healingItems;
      johnemonMaster.reviveItems = gameState.JohnemonMaster.reviveItems;
      johnemonMaster.JOHNEBALLS = gameState.JohnemonMaster.JOHNEBALLS;
      johnemonWorld.day = gameState.day;
      johnemonWorld.logs = gameState.logs;
      johnemonWorld.worldName = gameState.worldName;
      johnemonMaster.johnemonCollection = gameState.JohnemonMaster.johnemonCollection.map(johnemon => 
        new Johnemon(johnemon.name, johnemon.level, johnemon.experience, johnemon.attackRange, johnemon.defenseRange, johnemon.maxLife, johnemon.actualLife, johnemon.shiny, johnemon.catchPhrase)
      );
      
      console.log("Jeu chargé avec succès !\n\n");
      mainGame();
    }
  });
}

if (fs.existsSync('save.json')) {
  rl.question("Une sauvegarde a été trouvée. Voulez-vous la charger ? (oui/non)\n", (answer) => {
    if (answer.toLowerCase() === "oui") {
      readline.moveCursor(process.stdout, 0, -1); 
      readline.clearLine(process.stdout, 0);
      loadGameState();
    } else {
      newGame();
    }
  });
} else {
  newGame();
}

function askForName() {
  rl.question("Je ne pense pas vous avoir vu auparavant. Quel est votre nom ? \n\n", (name) => {
    readline.moveCursor(process.stdout, 0, -1); 
    readline.clearLine(process.stdout, 0);
    console.log(`Alors vous êtes ${name.yellow} ! Quel beau nom !\n`);
    johnemonMaster.name = name;
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

function mainGame() {
  console.log(`\nLe jour ${johnemonWorld.day} commence...\n`);

  rl.question(`Que voulez-vous faire aujourd'hui ? \n\n 1- Soigner un ${johnemonWord} à ses PV Max\n 2- Ressusciter un ${johnemonWord} mid-Life\n 3- Libérer un ${johnemonWord} de votre équipe\n 4- Renommer un ${johnemonWord} de votre équipe\n 5- Afficher votre équipe\n 6- Ne rien faire ce jour\n 7- Sauvegarder le Jeu\n \n\n`, (choice) => {
    readline.moveCursor(process.stdout, 0, -1); 
    readline.clearLine(process.stdout, 0);
    switch(choice) {
      case '1':
      case '2':
      case '3':
      case '4':
        handleJohnemonManagement(choice);
        break;
      case '5':
        johnemonMaster.showCollection();
        mainGame();
        break;
      case '6':
        johnemonWorld.oneDayPasses("6");
        checkRandomEvent();
        break;
      case '7':
        johnemonWorld.oneDayPasses("7");
        mainGame();
        break;
      default:
        console.log("Choix invalide, veuillez réessayer.");
        mainGame();
        break;
    }
  });
}

function handleJohnemonManagement(choice) {
  johnemonMaster.showCollection();
  
  rl.question(`Quel ${johnemonWord} ? Veuillez entrer le numéro :\n\n`, (index) => {
    readline.moveCursor(process.stdout, 0, -1); 
    readline.clearLine(process.stdout, 0);
    const johnemonIndex = parseInt(index) - 1;
    if (johnemonIndex >= 0 && johnemonIndex < johnemonMaster.johnemonCollection.length) {
      let newName = null;
      if (choice === '4') {
        rl.question(`Quel est le nouveau nom pour votre ${johnemonWord} ?\n`, (name) => {
          readline.moveCursor(process.stdout, 0, -1); 
          readline.clearLine(process.stdout, 0);
          newName = name;
          johnemonWorld.oneDayPasses(choice, johnemonIndex, newName);
          console.log(`Le jour ${johnemonWorld.day} se termine.\n`);
          checkRandomEvent();
        });
      } else {
        johnemonWorld.oneDayPasses(choice, johnemonIndex);
        checkRandomEvent();
      }
    } else {
      console.log("Sélection de Johnemon invalide.");
      mainGame();
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
