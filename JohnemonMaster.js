//johnemonMaster.js
import Johnemon from './Johnemon.js';

class JohnemonMaster {
  constructor() {
    this.name = "";
    this.johnemonCollection = [];
    this.healingItems = 5; 
    this.reviveItems = 3; 
    this.JOHNEBALLS = 10; 
  }

  healJohnemon(index) { 
    const johnemon = this.johnemonCollection[index];
    if (!johnemon) {
      console.log("Johnemon non trouvé.");
      return;
    }
    if (this.healingItems === 0) {
      console.log("Tu n'as plus d'objets de soin.");
      return;
    }
    this.healingItems -= 1;
    johnemon.actualLife = johnemon.maxLife;
    console.log(`${johnemon.name} a été soigné\n\n`);
  }

  reviveJohnemon(index) {
    const johnemon = this.johnemonCollection[index];
    if (!johnemon) {
      console.log("Johnemon non trouvé.");
      return;
    }
    if (this.reviveItems === 0) {
      console.log("Tu n'as plus d'objets de revive.");
      return;
    }
    if (johnemon.actualLife > 0) {
      console.log(`${johnemon.name} est déjà en vie.`);
      return;
    }
    this.reviveItems -= 1;
    johnemon.actualLife = johnemon.maxLife / 2; 
    console.log(`${johnemon.name} a été réssuscité avec ${johnemon.actualLife} PV.`);
  }

  releaseJohnemon(index) {
    if (index < 0 || index >= this.johnemonCollection.length) {
      console.log("Index invalide.");
      return;
    }
    const [releasedJohnemon] = this.johnemonCollection.splice(index, 1);
    console.log(`${releasedJohnemon.name}a été relaché.`);
  }

  renameJohnemon(index, newName) {
    const johnemon = this.johnemonCollection[index];
    if (!johnemon) {
      console.log("Johnemon non trouvé.");
      return;
    }
    johnemon.name = newName;
    console.log(`Le Johnemon a été renommé en ${newName}.`);
  }

  showCollection() {
    console.log('Voici ton équipe :\n');
    this.johnemonCollection.forEach((johnemon, index) => {
      const nameDisplay = johnemon.shiny ? johnemon.name.rainbow : johnemon.name; 
      console.log(`${index + 1}- ${nameDisplay} - Niveau: ${johnemon.level} - PV: ${johnemon.actualLife}/${johnemon.maxLife} - Attaque: ${johnemon.attackRange} - Defense: ${johnemon.defenseRange}\n`)
    });
  }
}

export default JohnemonMaster;
