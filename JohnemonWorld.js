import JohnemonMaster from './JohnemonMaster.js';
import JohnemonArena from './JohnemonArena.js';
const johnemonArena = new JohnemonArena();

class JohnemonWorld {
  constructor(johnemonMaster, saveGameState) {
    this.day = 1;
    this.logs = [];
    this.johnemonMaster = johnemonMaster;
    this.saveGameState = saveGameState;
    this.worldName = '';
  }
  oneDayPasses(choice, johnemonIndex = null, newName = null) {
    switch (choice) {
      case "1":
        if (johnemonIndex !== null) {
          this.johnemonMaster.healJohnemon(johnemonIndex);
          this.randomizeEvent(); 
        } else {
          console.log("Index invalide pour soigner.");
        }
        break;
      case "2":
        if (johnemonIndex !== null) {
          this.johnemonMaster.reviveJohnemon(johnemonIndex);
          this.randomizeEvent(); 
        } else {
          console.log("Index invalide pour réssusciter.");
        }
        break;
      case "3":
        if (johnemonIndex !== null) {
          this.johnemonMaster.releaseJohnemon(johnemonIndex);
          this.randomizeEvent(); 
        } else {
          console.log("Index invalide, pour relacher.");
        }
        break;
      case "4":
        if (johnemonIndex !== null && newName) {
          this.johnemonMaster.renameJohnemon(johnemonIndex, newName);
          this.randomizeEvent();  
        } else {
          console.log("Paramètres invalides pour le renommage.");
        }
        break;
      case "5": 
        this.johnemonMaster.showCollection();
        break;

      case "6": 
      console.log("Tu décides de ne rien faire aujourd'hui.\n");
      this.randomizeEvent();
      break;

      case "7":
        this.saveGameState();
        console.log("La partie a été sauvegardée")
        break;

      default:
        console.log("Choix invalide, veuillez réessayer.");
        break;
    }

   
  }

  randomizeEvent() {
    const battleChance = 0.5; 
    if (Math.random() < battleChance) {
      return 'battle';
    } else {
      console.log("Rien d'intéressant ne s'est passé aujourd'hui.");
      this.day += 1;
      return 'none';
      
    }
  }
  

  addLog(newLog) {
    const timestamp = new Date().toISOString();
    this.logs.push(`[${timestamp}] ${newLog}`);
  }
}

export default JohnemonWorld;
