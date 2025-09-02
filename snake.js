const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const overlay = document.getElementById("overlay");

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const BLOCK_SIZE = 20;

    let snake, dx, dy, food, score, snakeLength, baseSpeed, maxSpeed, gameInterval;

    // 🎨 Colors
    const GREEN = "#00C800";
    const DARK_GREEN = "#009600";
    const TAIL_GREEN = "#00FA96";
    const RED = "#C80000";

    // Start screen
    function showStartScreen() {
      overlay.innerHTML = `
        <div class="title">🐍 Snake Game</div>
        <div class="btn">Press SPACE or TAP to Start</div>
      `;
      document.addEventListener("keydown", startListener);
      overlay.addEventListener("click", startGame); // mobile tap
    }

    function startListener(e) {
      if (e.code === "Space") {
        document.removeEventListener("keydown", startListener);
        overlay.innerHTML = "";
        startGame();
      }
    }

    // Game over screen
    function showGameOver() {
      overlay.innerHTML = `
        <div class="title" style="color:red">GAME OVER</div>
        <div class="btn">Score: ${score}</div>
        <div class="btn">Press C / TAP to Play Again</div>
      `;
      document.addEventListener("keydown", gameOverListener);
      overlay.addEventListener("click", restartGame);
    }

    function gameOverListener(e) {
      if (e.code === "KeyC") {
        restartGame();
      }
    }

    function restartGame() {
      document.removeEventListener("keydown", gameOverListener);
      overlay.removeEventListener("click", restartGame);
      overlay.innerHTML = "";
      startGame();
    }

    // Start the game
    function startGame() {
      snake = [{x: WIDTH/2, y: HEIGHT/2}];
      dx = 0;
      dy = 0;
      snakeLength = 1;
      score = 0;
      baseSpeed = 5;
      maxSpeed = 20;
      placeFood();
      overlay.innerHTML = "";
      clearInterval(gameInterval);
      gameInterval = setInterval(gameLoop, 1000 / baseSpeed);
    }

    // Place food at random grid location
    function placeFood() {
      food = {
        x: Math.floor(Math.random() * (WIDTH / BLOCK_SIZE)) * BLOCK_SIZE,
        y: Math.floor(Math.random() * (HEIGHT / BLOCK_SIZE)) * BLOCK_SIZE
      };
    }

    // Draw snake with head, body, tail
    function drawSnake() {
      for (let i = 0; i < snake.length; i++) {
        const block = snake[i];
        if (i === snake.length - 1) { // Head
          ctx.fillStyle = DARK_GREEN;
          roundRect(block.x, block.y, BLOCK_SIZE, BLOCK_SIZE, 7, true);
          // Eyes
          ctx.fillStyle = "white";
          ctx.beginPath(); ctx.arc(block.x + 5, block.y + 6, 4, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(block.x + 15, block.y + 6, 4, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = "black";
          ctx.beginPath(); ctx.arc(block.x + 5, block.y + 6, 2, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(block.x + 15, block.y + 6, 2, 0, Math.PI*2); ctx.fill();
        } else if (i === 0) { // Tail
          ctx.fillStyle = TAIL_GREEN;
          roundRect(block.x, block.y, BLOCK_SIZE, BLOCK_SIZE, 10, true);
        } else { // Body
          ctx.fillStyle = GREEN;
          roundRect(block.x, block.y, BLOCK_SIZE, BLOCK_SIZE, 8, true);
        }
      }
    }

    // Draw rounded rectangle helper
    function roundRect(x, y, w, h, r, fill) {
      ctx.beginPath();
      ctx.moveTo(x+r, y);
      ctx.lineTo(x+w-r, y);
      ctx.quadraticCurveTo(x+w, y, x+w, y+r);
      ctx.lineTo(x+w, y+h-r);
      ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
      ctx.lineTo(x+r, y+h);
      ctx.quadraticCurveTo(x, y+h, x, y+h-r);
      ctx.lineTo(x, y+r);
      ctx.quadraticCurveTo(x, y, x+r, y);
      ctx.closePath();
      if (fill) ctx.fill();
    }

    // Game loop
    function gameLoop() {
      // Move snake
      let head = {x: snake[snake.length-1].x + dx, y: snake[snake.length-1].y + dy};

      // Border collision
      if (head.x < 0 || head.x >= WIDTH || head.y < 0 || head.y >= HEIGHT) {
        clearInterval(gameInterval);
        showGameOver();
        return;
      }

      snake.push(head);
      if (snake.length > snakeLength) snake.shift();

      // Self collision
      for (let i = 0; i < snake.length-1; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
          clearInterval(gameInterval);
          showGameOver();
          return;
        }
      }

      // Clear & draw
      ctx.fillStyle = "black";
      ctx.fillRect(0,0,WIDTH,HEIGHT);

      // Food
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.ellipse(food.x+BLOCK_SIZE/2, food.y+BLOCK_SIZE/2, BLOCK_SIZE/2, BLOCK_SIZE/2, 0, 0, Math.PI*2);
      ctx.fill();

      // Snake
      drawSnake();

      // Score
      ctx.fillStyle = "white";
      ctx.font = "20px Bahnschrift";
      ctx.fillText("Score: " + score, 10, 25);

      // Eating food
      if (head.x === food.x && head.y === food.y) {
        snakeLength++;
        score++;
        placeFood();
        // Increase speed every 5 points
        let currentSpeed = Math.min(baseSpeed + Math.floor(score/5), maxSpeed);
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, 1000/currentSpeed);
      }
    }

    // Controls (Keyboard)
    document.addEventListener("keydown", (e) => {
      if (e.code === "ArrowLeft" && dx === 0) {dx = -BLOCK_SIZE; dy = 0;}
      else if (e.code === "ArrowRight" && dx === 0) {dx = BLOCK_SIZE; dy = 0;}
      else if (e.code === "ArrowUp" && dy === 0) {dx = 0; dy = -BLOCK_SIZE;}
      else if (e.code === "ArrowDown" && dy === 0) {dx = 0; dy = BLOCK_SIZE;}
    });

    // Mobile Swipe Controls
    let touchStartX = 0, touchStartY = 0;
    canvas.addEventListener("touchstart", (e) => {
      const t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
    });
    canvas.addEventListener("touchend", (e) => {
      const t = e.changedTouches[0];
      let dxTouch = t.clientX - touchStartX;
      let dyTouch = t.clientY - touchStartY;

      if (Math.abs(dxTouch) > Math.abs(dyTouch)) {
        if (dxTouch > 30 && dx === 0) {dx = BLOCK_SIZE; dy = 0;} // right
        else if (dxTouch < -30 && dx === 0) {dx = -BLOCK_SIZE; dy = 0;} // left
      } else {
        if (dyTouch > 30 && dy === 0) {dx = 0; dy = BLOCK_SIZE;} // down
        else if (dyTouch < -30 && dy === 0) {dx = 0; dy = -BLOCK_SIZE;} // up
      }
    });

    // On-Screen Button Controls
    document.getElementById("btnUp").addEventListener("click", () => { if (dy === 0) {dx = 0; dy = -BLOCK_SIZE;} });
    document.getElementById("btnDown").addEventListener("click", () => { if (dy === 0) {dx = 0; dy = BLOCK_SIZE;} });
    document.getElementById("btnLeft").addEventListener("click", () => { if (dx === 0) {dx = -BLOCK_SIZE; dy = 0;} });
    document.getElementById("btnRight").addEventListener("click", () => { if (dx === 0) {dx = BLOCK_SIZE; dy = 0;} });

    // Start screen first
    showStartScreen();