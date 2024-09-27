class Johnemon {
  constructor(name = this.generateRandomJohnemonName(), level = 1, experience = 0, attackRange = this.generateAttackRange(), defenseRange = this.generateDefenseRange(), maxLife = this.generateHealthPool(), actualLife = maxLife, shiny = this.generateShiny()) {
    this.name = name
    this.level = level;
    this.experience = experience;
    this.attackRange = attackRange;
    this.defenseRange = defenseRange;
    this.maxLife = maxLife;
    this.actualLife = actualLife;
    this.shiny = shiny;
    this.catchphrase = "";

  }
   generateAttackRange() {

    const attackRange= Math.floor(Math.random() * (8 - 1 + 1) + 1);
    return attackRange;
  }

   generateDefenseRange() {
    const defenseRange = Math.floor(Math.random() * (3 - 1 + 1) + 1);
    return defenseRange;


  }
   generateHealthPool() {
    const healthPool = Math.floor(Math.random() * (30 - 10 + 1) + 10);
    return healthPool;
  }

  generateShiny() {
    return Math.random() < 1 / 10;
}

    generateRandomJohnemonName() {
      const students = [
        "Oli", "via", 
        "No", "ra", 
        "Dia", "na", 
        "Moh", "ab", 
        "Ly", "ne", 
        "Ja", "son", 
        "Séba", "stien", 
        "Cri", "stelle", 
        "Fa", "rid", 
        "Thi", "bault", 
        "Edou", "ard", 
        "Vin", "cianne", 
        "Ben", "jamin", 
        "Ma", "tteo", 
        "Re", "da", 
        "Dona", "tien", 
        "Re", "naud", 
        "Ant", "oine", 
        "Jo", "sias", 
        "Sté", "phen", 
        "Moh", "amed", 
        "Ha", "kim", 
        "Pi", "erre", 
        "Hu", "go", 
        "Thé", "o", 
        "Max", "ime"
      ];
      
       
       const firstRandomPart = students[Math.floor(Math.random() * students.length)].toLowerCase();
       const secondRandomPart = students[Math.floor(Math.random() * students.length)].toLowerCase();
       
       const johnemonName = capitalizeFirstLetter(firstRandomPart + secondRandomPart);
       return johnemonName;
     }
   }
   
   
   function capitalizeFirstLetter(str) {
     return str.charAt(0).toUpperCase() + str.slice(1);
   }

  
module.exports = Johnemon;
