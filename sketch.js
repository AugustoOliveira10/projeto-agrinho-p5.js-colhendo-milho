let player;
let milhos = [];
let score = 0;
let totalMilhos = 5;
let gameOver = false;
let comicFrame = 0;
let treePositions = [];
let comicTimer = 0;  // para controlar o tempo das cutscenes

// Posição do sol no canto superior direito
const solX = 730;
const solY = 70;

function setup() {
  createCanvas(800, 400);
  textAlign(CENTER, CENTER);
  textFont('Arial');
  textSize(20);

  player = new Player(100, 100);

  // Criar milhos fora da área do sol
  for (let i = 0; i < totalMilhos; i++) {
    let x, y, dSol;
    do {
      x = random(50, width - 50);
      y = random(50, height - 50);
      dSol = dist(x, y, solX, solY);
    } while (dSol < 60); // repetir até achar posição longe do sol
    milhos.push(new Milho(x, y));
  }

  // Árvores mais espalhadas (usando grid solto), sem sobrepor o sol
  for (let x = 50; x < width; x += 100) {
    for (let y = 50; y < height; y += 100) {
      let tx = x + random(-30, 30);
      let ty = y + random(-30, 30);
      let dSol = dist(tx, ty, solX, solY);
      if (random() < 0.4 && dSol > 60) {
        treePositions.push([tx, ty]);
      }
    }
  }
}

function draw() {
  if (!gameOver) {
    drawField();
    drawMilhos();
    player.move();
    player.show();
    checkColheita();
    drawScore();
  } else {
    if (comicFrame <= 5) {
      showComic();
    } else {
      showThankYouScreen();
    }
  }
}

// ===== PARTE 1: Campo e Colheita =====
function drawField() {
  background(100, 200, 100); // Campo verde

  // Sol no canto superior direito
  fill(255, 204, 0);
  ellipse(solX, solY, 60, 60);

  // Árvores mais naturais
  for (let pos of treePositions) {
    drawTree(pos[0], pos[1]);
  }
}

function drawTree(x, y) {
  fill(139, 69, 19);
  rect(x, y + 20, 10, 30);
  fill(34, 139, 34);
  ellipse(x + 5, y + 10, 30, 30);
}

function drawMilhos() {
  for (let m of milhos) {
    m.show();
  }
}

function checkColheita() {
  for (let i = milhos.length - 1; i >= 0; i--) {
    if (player.eats(milhos[i])) {
      milhos.splice(i, 1);
      score++;
    }
  }

  if (score === totalMilhos) {
    gameOver = true;
    setTimeout(() => comicFrame = 1, 1000);
  }
}

function drawScore() {
  fill(0);
  textSize(16);
  textAlign(LEFT, TOP);
  text("Milhos colhidos: " + score + "/" + totalMilhos, 10, 10);

  // Instruções para jogar
  textSize(14);
  fill(50);
  text("Use as setas do teclado para mover o fazendeiro.", 10, 30);
  text("Para coletar milhos, passe por cima deles.", 10, 50);
}

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 30;
    this.speed = 2;
  }

  move() {
    if (keyIsDown(LEFT_ARROW)) this.x -= this.speed;
    if (keyIsDown(RIGHT_ARROW)) this.x += this.speed;
    if (keyIsDown(UP_ARROW)) this.y -= this.speed;
    if (keyIsDown(DOWN_ARROW)) this.y += this.speed;

    this.x = constrain(this.x, 0, width - this.size);
    this.y = constrain(this.y, 0, height - this.size);
  }

  show() {
    textSize(30);
    text("🧑‍🌾", this.x + 15, this.y + 15);
  }

  eats(milho) {
    return dist(this.x, this.y, milho.x, milho.y) < 25;
  }
}

class Milho {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  show() {
    textSize(24);
    text("🌽", this.x, this.y);
  }
}

// ===== PARTE 2: História em Quadrinhos =====
function showComic() {
  background(255);
  textAlign(CENTER, CENTER);
  textSize(24);
  fill(0);
  text("🌽 A Jornada do Milho 🌽", width / 2, 30);

  comicTimer++;

  if (comicTimer > 360) { // 6 segundos a 60fps para avançar
    if (comicFrame < 5) comicFrame++;
    else comicFrame++;  // para avançar para a tela final
    comicTimer = 0;
  }

  if (comicFrame === 1) {
    drawComicFrame("O fazendeiro colheu o milho e carregou o carrinho...", () => {
      textSize(60);
      text("🧑‍🌾", 200, 180);
      text("🌽🌽🌽", 330, 180);
      text("🛒", 470, 180);
    });
  } else if (comicFrame === 2) {
    drawComicFrame("O caminhão segue rumo à cidade...", () => {
      textSize(60);
      text("🚛", 150 + frameCount % 500, 200);
    });
  } else if (comicFrame === 3) {
    drawComicFrame("O milho chegou ao mercado local!", () => {
      textSize(60);
      text("🏪", 300, 150);
      textSize(40);
      text("🌽🌽🌽🌽", 300, 220);
    });
  } else if (comicFrame === 4) {
    drawComicFrame("Uma família comprou os alimentos...", () => {
      textSize(60);
      text("👨‍👩‍👧‍👦", 320, 180);
      text("🛍️", 420, 180);
    });
  } else if (comicFrame === 5) {
    drawComicFrame("E todos comemoraram com uma refeição deliciosa!", () => {
      textSize(60);
      text("👨‍👩‍👧‍👦", 300, 150);
      textSize(40);
      text("🍽️🌽🍞🥗", 300, 220);
    });
  }
}

function drawComicFrame(subtitle, contentFn) {
  textSize(18);
  text(subtitle, width / 2, 60);
  fill(240);
  noStroke();
  rect(100, 80, 600, 300, 10);
  contentFn();
}

// ===== TELA DE AGRADECIMENTO =====
function showThankYouScreen() {
  background(220, 255, 220);
  fill(0, 150, 0);
  textSize(40);
  textAlign(CENTER, CENTER);
  text("Obrigado por jogar! 🌽😊", width / 2, height / 2);
}
