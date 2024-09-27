// JohnemonArena.js

const Johnemon = require("./Johnemon");
const JohnemonMaster = require("./JohnemonMaster");
const JohnemonWorld = require("./JohnemonWorld");

class JohnemonArena {
 
  calculateDamage(attacker, defender) {
    const attackRoll = Math.floor(Math.random() * attacker.attackRange) + 1;
    const attackMultiplier = 1 + (attacker.level * 0.1);
    const totalAttack = attackRoll * attackMultiplier;

    const defenseMultiplier = 1 + (defender.level * 0.1);
    const totalDefense = defender.defenseRange * defenseMultiplier;

    let damage = totalAttack - totalDefense;
    damage = Math.max(0, Math.floor(damage)); 

    defender.actualLife -= damage;
    defender.actualLife = Math.max(0, defender.actualLife); 

    return damage;
  }

  checkBattleStatus(playerJohnemon, enemyJohnemon) {
    if (enemyJohnemon.actualLife <= 0) {
      return 'enemyDefeated';
    }

    if (playerJohnemon.actualLife <= 0) {
      return 'playerDefeated';
    }

    return 'ongoing'; 
  }


 
    tryToCatch(enemyJohnemon) {
     
      const missingHpPercentage = (1 - (enemyJohnemon.actualLife / enemyJohnemon.maxLife)) * 100;
  
    
      const catchRate = Math.min(100, missingHpPercentage + 10); 
  
      const captureAttempt = Math.random() * 100;
  
      return captureAttempt <= catchRate;
  }


  fleeBattle() {
    return Math.random() > 0.5;
  }

 
  attack(attacker, defender) {
    const damage = this.calculateDamage(attacker, defender);
    return {
      damageDealt: damage,
      defenderLife: defender.actualLife
    };
  }

  attemptCapture(enemyJohnemon) {
    return this.tryToCatch(enemyJohnemon);
  }

  
  useHealingItem(johnemonMaster, targetJohnemon) {
    if (johnemonMaster.healingItems <= 0) {
      return { success: false, message: "Vous n'avez plus d'objets de soin." };
    }

    johnemonMaster.healingItems -= 1;
    targetJohnemon.actualLife = targetJohnemon.maxLife;

    return { success: true, message: `${targetJohnemon.name} a été soigné à pleine vie.` };
  }

  
  attemptFlee() {
    return this.fleeBattle();
  }

 
  processPlayerAction(action, playerJohnemon, enemyJohnemon, johnemonMaster) {
    let battleStatus = 'ongoing';
    let message = '';

    switch(action) {
      case 'attack':
        const attackResult = this.attack(playerJohnemon, enemyJohnemon);
        message += `${playerJohnemon.name} attaque et inflige ${attackResult.damageDealt} dégâts.\n`;
        message += `${enemyJohnemon.name} a maintenant ${attackResult.defenderLife} PV.\n`;
        break;

      case 'catch':
        const captureSuccess = this.attemptCapture(enemyJohnemon);
        if (captureSuccess) {
          message += `Félicitations ! Vous avez capturé ${enemyJohnemon.name}.\n`;
          johnemonMaster.johnemonCollection.push(enemyJohnemon);
          battleStatus = 'captured';
        } else {
          message += `Échec de la capture de ${enemyJohnemon.name}.\n`;
        }
        break;

      case 'useItem':
        const healResult = this.useHealingItem(johnemonMaster, playerJohnemon);
        message += `${healResult.message}\n`;
        break;

      case 'flee':
        const fleeSuccess = this.attemptFlee();
        if (fleeSuccess) {
          message += `Vous avez réussi à fuir le combat.\n`;
          battleStatus = 'fled';
        } else {
          message += `Échec de la fuite. Le combat continue.\n`;
        }
        break;

      default:
        message += "Action invalide.\n";
        break;
    }

    
    if (battleStatus === 'ongoing') {
      const status = this.checkBattleStatus(playerJohnemon, enemyJohnemon);
      if (status === 'enemyDefeated') {
        message += `${enemyJohnemon.name} a été vaincu !\n`;
        battleStatus = 'enemyDefeated';
      } else if (status === 'playerDefeated') {
        message += `${playerJohnemon.name} a été vaincu...\n`;
        battleStatus = 'playerDefeated';
      }
    }

    return { battleStatus, message };
  }

  
  enemyTurn(playerJohnemon, enemyJohnemon) {
    if (enemyJohnemon.actualLife <= 0) return { battleStatus: 'enemyDefeated', message: '' };

    const damage = this.calculateDamage(enemyJohnemon, playerJohnemon);
    const message = `${enemyJohnemon.name} attaque et inflige ${damage} dégâts.\n${playerJohnemon.name} a maintenant ${playerJohnemon.actualLife} PV.\n`;

    const status = this.checkBattleStatus(playerJohnemon, enemyJohnemon);
    let battleStatus = 'ongoing';
    if (status === 'playerDefeated') {
      battleStatus = 'playerDefeated';
    }

    return { battleStatus, message };
  }

}

module.exports = JohnemonArena;