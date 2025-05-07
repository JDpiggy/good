const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gold = 100;
let frame = 0;

const TILE_SIZE = 40;
const towers = [];
const troops = [];
let enemies = [];

const grass = new Image();
grass.src = 'assets/tiles/grass.png';

const enemyTypes = [
  { color: "red", speed: 1, hp: 100 },
  { color: "blue", speed: 2, hp: 70 },
  { color: "green", speed: 0.5, hp: 200 }
];

function drawMap() {
  ctx.drawImage(grass, 0, 0, canvas.width, canvas.height);
}

function drawCircleUnit(x, y, color, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.stroke();
}

function drawHealthBar(x, y, hp, maxHp) {
  ctx.fillStyle = "red";
  ctx.fillRect(x - 20, y - 30, 40, 5);
  ctx.fillStyle = "lime";
  ctx.fillRect(x - 20, y - 30, 40 * (hp / maxHp), 5);
}

function spawnEnemy() {
  const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
  enemies.push({ x: 0, y: 100 + Math.random() * 500, ...type, maxHp: type.hp });
}

function updateEnemies() {
  for (const e of enemies) {
    e.x += e.speed;
  }
  enemies = enemies.filter(e => e.hp > 0 && e.x < canvas.width);
}

function drawEnemies() {
  for (const e of enemies) {
    drawCircleUnit(e.x, e.y, e.color, 20);
    drawHealthBar(e.x, e.y, e.hp, e.maxHp);
  }
}

function placeTower() {
  if (gold >= 50) {
    towers.push({ x: 300, y: 300, damage: 10, level: 1 });
    gold -= 50;
    updateGold();
  }
}

function upgradeTower() {
  if (gold >= 100 && towers.length > 0) {
    towers[0].damage += 10;
    towers[0].level += 1;
    gold -= 100;
    updateGold();
  }
}

function mergeTowers() {
  if (towers.length >= 2 && towers[0].level === towers[1].level) {
    towers[0].damage += towers[1].damage;
    towers[0].level += 1;
    towers.splice(1, 1);
    updateGold();
  }
}

function drawTowers() {
  towers.forEach(t => drawCircleUnit(t.x, t.y, "white", 20));
}

function placeTroop() {
  if (gold >= 30) {
    troops.push({ x: 200, y: 200, damage: 5, range: 60 });
    gold -= 30;
    updateGold();
  }
}

function drawTroops() {
  troops.forEach(t => drawCircleUnit(t.x, t.y, "orange", 12));
}

function attackEnemies() {
  [...towers, ...troops].forEach(unit => {
    enemies.forEach(enemy => {
      const dx = enemy.x - unit.x;
      const dy = enemy.y - unit.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        enemy.hp -= unit.damage;
        if (enemy.hp <= 0) gold += 10;
      }
    });
  });
  updateGold();
}

function updateGold() {
  document.getElementById("gold").textContent = gold;
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  drawEnemies();
  drawTowers();
  drawTroops();
  updateEnemies();
  attackEnemies();

  frame++;
  if (frame % 180 === 0) spawnEnemy();

  requestAnimationFrame(gameLoop);
}

grass.onload = () => gameLoop();