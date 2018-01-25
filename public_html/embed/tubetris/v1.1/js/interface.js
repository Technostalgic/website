class menuScreen{
  constructor(){
    this.selectedItem = 0;
    this.buttons = [];
  }
  
  reset(){
    this.selectedItem = 0;
  }
  selectionChange(dir = 1){
  	game.playSound(sfx.roll);
    this.selectedItem += dir;
  }
  setSelection(sel){
  	if(sel == this.selectedItem)
  		return;
  	this.selectedItem = sel;
  	game.playSound(sfx.roll);
  }
  get selectedButton(){
    this.selectedItem = this.selectedItem % this.buttons.length;
    if(this.selectedItem < 0) 
      this.selectedItem += this.buttons.length;
    return this.buttons[this.selectedItem];
  }
  select(){
  	if(this.buttons.length <= 0)
  		return;
  	game.playSound(sfx.rollHit);
    this.selectedButton.select();
  }
  arrangeButtons(point = new vec2(width / 2, height / 2)){
    for(var i in this.buttons){
      this.buttons[i].pos = new vec2(point.x, point.y + i * 40);
    }
    return this;
  }

  drawBG(ctx){
    for(var x = Math.floor(dwidth / tilesize) + 1; x >= -1; x--)
      for(var y = Math.floor(dheight / tilesize) + 1; y >= -1; y--){
        var img = graphics.tile;
        if(x < 0 || y < 0 || x >= Math.floor(dwidth / tilesize) - 1 || y >= Math.floor(dheight / tilesize))
          img = graphics.tile_front;
        var spos = new vec2(x, y).toExpandedPos().add(new vec2(20, 10));
		spos.applyCanvasStretch();
        ctx.drawImage(img, spos.x, spos.y, tilesize * adjustment.x, tilesize * adjustment.y);
      }
  }
  draw(ctx, font){
    clrCanvas();
    this.drawBG(ctx);
    this.drawAux();
    for(var i in this.buttons)
      this.buttons[i].draw(ctx, font)
    if(this.buttons.length > 0)
      this.drawSelection(ctx);
  }
  drawSelection(ctx){
    var fls = lastTime % 1000 < 500;
    var sprtL = new vec2(16, fls ? 0 : 16);
    var sprtR = new vec2(0, fls ? 0 : 16);
    ctx.drawImage(graphics.arrows, sprtL.x, sprtL.y, 16, 16,
      (this.selectedButton.pos.x - this.selectedButton.size.x / 2 - 16) * adjustment.x, (this.selectedButton.pos.y - 12) * adjustment.y,
	  16 * adjustment.x, 16 * adjustment.y);
    ctx.drawImage(graphics.arrows, sprtR.x, sprtR.y, 16, 16,
      (this.selectedButton.pos.x + this.selectedButton.size.x / 2) * adjustment.x, (this.selectedButton.pos.y - 12) * adjustment.y,
	  16 * adjustment.x, 16 * adjustment.y);
  }
  drawAux(){}
  
  draw_mainMenu(ctx){
    spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 70), "Tubetris", 3);
  }
  draw_paused(ctx){
    spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 80), "pause", 2);
  }
  draw_options(ctx){
    spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 80), "options", 2);
  }
  draw_scoreBoard(ctx){
    spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 40), "scoreboard", 2);

    var spos = new vec2(0, (tilesize * 5 + 10));
    for (var i in scoreboard.scores){
      var score = scoreboard.scores[i];
	  if(this.scoreFocus){
		if(this.scoreFocus === i){
			ctx.fillStyle = "rgba(255,255,255,0.3)";
			ctx.fillRect(0, (i * tilesize * 2 + 170) * adjustment.y, width, tilesize * adjustment.y);
		}
	  }
      spritefont.drawTextCentered(ctx, new vec2(dwidth / 4, i * tilesize * 2).add(spos), score.name, 1);
      spritefont.drawTextCentered(ctx, new vec2(dwidth * 3 / 4, i * tilesize * 2).add(spos), score.points.toString(), 1);
    }
  }
  draw_controlsMenu(ctx){
    spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 40), "controls", 2);
  }
  draw_tutorialMenu(ctx){
    spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 40), "tutorial", 2);
    this.tutScreen.drawAux(ctx);
  }
  draw_gameover(ctx){
    spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 80), "game over", 2);
    spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 10 * tilesize), "Score:", 1);
    spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 11 * tilesize), score.toString(), 1);
  }
  draw_nameEntry(ctx){
    spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 80), "high score!", 2);
    spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 140), score.toString(), 2);
    spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 10 * tilesize), "enter name:", 1);

    var fchar = lastTime % 1000 < 500 ? ":" : " ";
    if(this.name.length >= 10){
		  fchar = "";
		  this.name = this.name.slice(0, 10);
    }
    spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 11 * tilesize), this.name + fchar, 1);
  }
  draw_credits(ctx){
    spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 80), "credits", 2);
	
    spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 5 * tilesize), "developer:", 1);
    //spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 6 * tilesize), "technonugget", 1);
	
  	spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 8 * tilesize), "pixel art:", 1);
  	spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 12 * tilesize), "music and sound:", 1);
    //spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 13 * tilesize), "megajackie", 1);
    //spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 14 * tilesize), "that one guy", 1);
  }
  draw_saveError(ctx){
    spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 80), "warning", 2);
	
    spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 6 * tilesize), "it appears that your", 1);
    spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 7 * tilesize), "browser settings do not", 1);
    spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 8 * tilesize), "allow local storage of", 1);
    spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 9 * tilesize), "cookies or website data", 1);
	
  	spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 11 * tilesize), "you can continue but", 1);
  	spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 12 * tilesize), "your scores and settings", 1);
  	spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 13 * tilesize), "will not be saved", 1);
  	spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 14 * tilesize), "please consider changing", 1);
  	spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 15 * tilesize), "your browser settings", 1);
  }
  draw_keybinding(ctx){
    spritefont.drawTextCentered(ctx, new vec2(dwidth / 2, 80), "key binding", 2);
  	spritefont.drawTextCentered(ctx, new vec2(dwidth * 3 / 4, 5 * tilesize), keyCodeToName(game.settings.controls.mUp)); //move up
  	spritefont.drawTextCentered(ctx, new vec2(dwidth * 3 / 4, 6 * tilesize), keyCodeToName(game.settings.controls.mDown)); //move down
  	spritefont.drawTextCentered(ctx, new vec2(dwidth * 3 / 4, 7 * tilesize), keyCodeToName(game.settings.controls.mLeft)); //move left
  	spritefont.drawTextCentered(ctx, new vec2(dwidth * 3 / 4, 8 * tilesize), keyCodeToName(game.settings.controls.mRight)); //move right
  	spritefont.drawTextCentered(ctx, new vec2(dwidth * 3 / 4, 9 * tilesize), keyCodeToName(game.settings.controls.bLeft)); //bump left
  	spritefont.drawTextCentered(ctx, new vec2(dwidth * 3 / 4, 10 * tilesize), keyCodeToName(game.settings.controls.bRight)); //bump right
  	spritefont.drawTextCentered(ctx, new vec2(dwidth * 3 / 4, 11 * tilesize), keyCodeToName(game.settings.controls.bDown)); //bump down
  	spritefont.drawTextCentered(ctx, new vec2(dwidth * 3 / 4, 12 * tilesize), keyCodeToName(game.settings.controls.quickDrop)); //quick drop
  	spritefont.drawTextCentered(ctx, new vec2(dwidth * 3 / 4, 13 * tilesize), keyCodeToName(game.settings.controls.rotate)); //rotate
  	spritefont.drawTextCentered(ctx, new vec2(dwidth * 3 / 4, 14 * tilesize), keyCodeToName(game.settings.controls.rotateCC)); //rotate cc
  	spritefont.drawTextCentered(ctx, new vec2(dwidth * 3 / 4, 15 * tilesize), keyCodeToName(game.settings.controls.pauseSelect)); //pause select
  }
  
  typeName(event){
  }
  
  static get screen_mainMenu(){
    var r = new menuScreen();
    r.drawAux = function(){ r.draw_mainMenu(context); };
    r.buttons = [
      new button("start game").setAction(function(){ startGame(); }),
      new button("tutorial").setAction(function(){ startTutorial(); }),
      new button("options").setAction(function(){ game.switchMode(gameController.mode_options); }),
      new button("scoreboard").setAction(function(){ resetGame(); game.switchMode(gameController.mode_scoreBoard); }),
  	  new button("credits").setAction(function(){ game.switchMode(gameController.mode_credits); })
      ];
    return r.arrangeButtons();
  }
  static get screen_options(){
    var r = new menuScreen();
    r.drawAux = function(){ r.draw_options(context); };
    var animButton = new button("animation speed:" + game.settingsText_animStepRate(), new vec2(22 * 18 + 8, 40));
    var sfxButton = new button("sound effects:" + game.settings.sfxEnabled.toString())
    var musicButton = new button("music:" + game.settings.musicEnabled.toString());
    r.buttons = [
  		musicButton.setAction(function(){ game.settingsChange_musicEnabled(); musicButton.text = "music:" + game.settings.musicEnabled.toString(); game.saveSettings(); }),
  		sfxButton.setAction(function(){game.settingsChange_sfxEnabled(); sfxButton.text = "sound effects:" + game.settings.sfxEnabled.toString(); game.saveSettings(); }),
  		animButton.setAction(function(){ game.settingsChange_animStepRate(); animButton.text = "animation speed:" + game.settingsText_animStepRate(); game.saveSettings(); }),
  		new button("edit key bindings").setAction(function(){ game.switchMode(gameController.mode_keybinding); }),
  		new button("main menu").setAction(function(){ game.switchMode(gameController.mode_mainMenu); game.saveSettings(); })
  	];
    return r.arrangeButtons();
  }
  static get screen_paused(){
    var r = new menuScreen();
    r.drawAux = function(){ r.draw_paused(context); };
    r.buttons = [
      new button("resume").setAction(function(){ game.switchMode(game.lastMode); }),
      new button("quit").setAction(function(){ resetGame(); game.switchMode(gameController.mode_mainMenu); game.stopMusic(); game.loadSettings(); })
      ];
    return r.arrangeButtons();
  }
  static get screen_scoreBoard(){
    var r = new menuScreen();
    scoreboard.scores = scoreboard.retrieveData();
    r.scoreFocus = scoreboard.highScorePlace(score);
    r.drawAux = function(){ r.draw_scoreBoard(context); };
    r.buttons = [
      new button("start game").setAction(function(){ startGame(); }),
      new button("main menu").setAction(function(){ resetGame(); game.switchMode(gameController.mode_mainMenu); })
      ];
    return r.arrangeButtons(new vec2(dwidth / 2, dheight - 100));
  }
  static get screen_controlsMenu(){
    var r = new menuScreen();
    r.drawAux = function(){ r.draw_controlsMenu(context); };
    r.buttons = [
      new button("back").setAction(function(){ game.switchMode(gameController.mode_options); }),
      new button("main menu").setAction(function(){ resetGame(); game.switchMode(gameController.mode_mainMenu); })
      ];
    return r.arrangeButtons(new vec2(width / 2, height - 100));
  }
  static get screen_gameover(){
    var r = new menuScreen();
  	if(scoreboard.testHighScore(score))
		if(game.settings.savingEnabled)
			return menuScreen.screen_nameEntry;
	
    r.drawAux = function(){ r.draw_gameover(context); };
    r.buttons = [
      new button("restart").setAction(function(){ startGame(); }),
      new button("main menu").setAction(function(){ resetGame(); game.switchMode(gameController.mode_mainMenu); })
      ];
    return r.arrangeButtons(new vec2(dwidth / 2, dheight - 100));
  }
  static get screen_nameEntry(){
	  var r = new menuScreen();
	  r.drawAux = function(){ r.draw_nameEntry(context); };
	  r.name = "";
	  addEventListener('keydown', typeName);
	  return r;
  }
  static get screen_credits(){
    var r = new menuScreen();
    r.drawAux = function(){ r.draw_credits(context); };
    r.buttons = [
		  new button("technonugget").setPos(new vec2(width / 2, 6 * tilesize + 20)).setAction(function(){ window.open("https://technostalgic.itch.io"); }),
		  new button("surt").setPos(new vec2(width / 2, 9 * tilesize + 20)).setAction(function(){ window.open("http://opengameart.org/users/surt"); }),
		  new button("j robot").setPos(new vec2(width / 2, 10 * tilesize + 20)).setAction(function(){ window.open("http://opengameart.org/users/j-robot"); }),
		  new button("gega").setPos(new vec2(width / 2, 13 * tilesize + 20)).setAction(function(){ window.open("http://opengameart.org/users/gega"); }),
		new button("subspaceaudio").setPos(new vec2(width / 2, 14 * tilesize + 20)).setAction(function(){ window.open("http://opengameart.org/users/subspaceaudio"); }),
		new button("ogrebane").setPos(new vec2(width / 2, 15 * tilesize + 20)).setAction(function(){ window.open("http://opengameart.org/users/ogrebane"); }),
		  new button("main menu").setPos(new vec2(width / 2, height - 100)).setAction(function(){ game.switchMode(gameController.mode_mainMenu); })
		];
    return r;
  }
  static get screen_saveError(){
    var r = new menuScreen();
    r.drawAux = function(){ r.draw_saveError(context); };
    r.buttons = [
			new button("continue").setAction(function(){ game.settings.savingEnabled = false; game.switchMode(gameController.mode_mainMenu); })
		];
    return r.arrangeButtons(new vec2(dwidth / 2, dheight - 100));
  }
  static get screen_keybinding(){
    var r = new menuScreen();
    r.drawAux = function(){ r.draw_keybinding(context); };
    r.buttons = [
			new button("move up").setPos(new vec2(dwidth / 4, 5 * tilesize + 20)).setAction(function(){ setControl(0); }),
			new button("move down").setPos(new vec2(dwidth / 4, 6 * tilesize + 20)).setAction(function(){ setControl(1); }),
			new button("move left").setPos(new vec2(dwidth / 4, 7 * tilesize + 20)).setAction(function(){ setControl(2); }),
			new button("move right").setPos(new vec2(dwidth / 4, 8 * tilesize + 20)).setAction(function(){ setControl(3); }),
			new button("bump left").setPos(new vec2(dwidth / 4, 9 * tilesize + 20)).setAction(function(){ setControl(4); }),
			new button("bump right").setPos(new vec2(dwidth / 4, 10 * tilesize + 20)).setAction(function(){ setControl(5); }),
			new button("bump down").setPos(new vec2(dwidth / 4, 11 * tilesize + 20)).setAction(function(){ setControl(6); }),
			new button("quick drop").setPos(new vec2(dwidth / 4, 12 * tilesize + 20)).setAction(function(){ setControl(7); }),
			new button("rotate").setPos(new vec2(dwidth / 4, 13 * tilesize + 20)).setAction(function(){ setControl(8); }),
			new button("rotate cc").setPos(new vec2(dwidth / 4, 14 * tilesize + 20)).setAction(function(){ setControl(9); }),
			new button("pause select").setPos(new vec2(dwidth / 4, 15 * tilesize + 20)).setAction(function(){ setControl(10); }),
			new button("defaults").setPos(new vec2(dwidth / 2, dheight - 120)).setAction(function(){ game.setDefaultKeybindings(); }),
			new button("main menu").setPos(new vec2(dwidth / 2, dheight - 80)).setAction(function(){ game.switchMode(gameController.mode_mainMenu); game.saveKeybindings(); })
		];
    return r;
  }
}
class button{
  constructor(text = "button", size = new vec2(text.length * 18 + 8, 40)){
    this.pos = new vec2();
    this.size = size;
    this.text = text;
  }
  
  select(){}
  setPos(pos){
	this.pos = pos;
	return this;
  }
  setAction(func){
    this.select = func;
    return this;
  }
  containsPoint(point){
    var tl = this.pos.add(this.size.multiply(-0.5));
    var br = tl.add(this.size);
    return (
      (point.x >= tl.x && point.x <= br.x) &&
      (point.y >= tl.y && point.y <= br.y) );
  }

  draw(ctx, font){
    font.drawTextCentered(ctx, this.pos.add(new vec2(0, this.size.y / -2)), this.text);
  }
}
class font{
  constructor(fontsheet, charwidth, charheigth, spacing = charwidth){
    this.imgdata = fontsheet;
    this.w = charwidth;
    this.dw = spacing;
    this.h = charheigth;
  }
  charSprites(text){
    var r = [];
    for(var i in text){
      if(text.charCodeAt(i) < 128)
        r.push(this.charSprite(text.charCodeAt(i)));
    }
    return r;
  }
  charSprite(charbyte){
    if(charbyte >= 48 && charbyte < 58)
      return new vec2(this.w * (charbyte - 48), 0);
    else if(charbyte >= 65 && charbyte < 91){
      var byte = charbyte - 65;
      if(byte < 13)
        return new vec2(this.w * byte, this.h);
      return new vec2(this.w * (byte - 13), this.h * 2);
    }
    else if(charbyte >= 97 && charbyte < 123){
      var byte = charbyte - 97;
      if(byte < 13)
        return new vec2(this.w * byte, this.h);
      return new vec2(this.w * (byte - 13), this.h * 2);
    }
    else if(charbyte == 58)
      return new vec2(this.w * 11, 0);

    return new vec2(this.w * 12, 0);
  }

  drawText(ctx, pos, text, size = 1){
    var csp = this.charSprites(text);
    for(var i in csp){
      var spos = pos.add(new vec2(i * this.dw * size, 0));
	  spos.applyCanvasStretch()
      ctx.drawImage(this.imgdata, csp[i].x, csp[i].y, this.w, this.h, spos.x, spos.y, this.w * size * adjustment.x, this.h * size * adjustment.y);
    }
  }
  drawTextCentered(ctx, pos, text, size = 1){
    pos = pos.add(new vec2(this.dw * size * text.length * -.5, 0));
    this.drawText(ctx, pos, text, size);
  }

  static loadGameFont(){
    var img = new Image();
    img.src = "gfx/BlockFont.png";
    return new font(img, 18, 32);
  }
  static loadSmallFont(compressed = true){
    var img = new Image();
    img.src = "gfx/font.png";
    return new font(img, 12, 8, compressed ? 8 : 10);
  }
}
class hud{
  constructor(){
  }

  drawBorder(ctx){
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    
    //draw shadow:
    var shadowsize = new vec2(4, 2);
    var pos = new vec2(0, 0).toCoordPos();
    pos.applyCanvasStretch();
    var size = boardsize.toExpandedPos();
    size.applyCanvasStretch();
    ctx.fillRect(pos.x, pos.y, size.x, shadowsize.y);
    ctx.fillRect(pos.x + size.x - shadowsize.x, pos.y + shadowsize.y, shadowsize.x, size.y - shadowsize.y);
    
    //draw border:
	//top border
    for(var x = -1; x < dwidth / tilesize; x++){
      var pos = new vec2(x, -1).toCoordPos();
      pos.applyCanvasStretch();
      ctx.drawImage(graphics.tile_front, pos.x, pos.y, tilesize * adjustment.x, tilesize * adjustment.y);
    }
	//bottom border
    for(var x = -1; x < dwidth / tilesize; x++){
      var pos = new vec2(x, 20).toCoordPos();
	  console.log(x);
      pos.applyCanvasStretch();
      ctx.drawImage(graphics.tile_front, pos.x, pos.y, tilesize * adjustment.x, tilesize * adjustment.y);
    }
    for(var y = boardsize.toCoordPos().y; y * adjustment.y <= canvas.height; y += tilesize * adjustment.y){
      for(var x = -1; x < dwidth / tilesize; x++){
        var pos = new vec2(x, y).toCoordPos();
        pos.applyCanvasStretch();
        ctx.drawImage(graphics.tile_front, pos.x, pos.y, tilesize * adjustment.x, tilesize * adjustment.y);
      }
      console.log(y);
    }
    for(var y = 0; y < dheight / tilesize; y++){
      var pos = new vec2(-1, y).toCoordPos();
      pos.applyCanvasStretch();
      ctx.drawImage(graphics.tile_front, pos.x, pos.y, tilesize * adjustment.x, tilesize * adjustment.y);
    }
    for(var x = boardsize.x; x < dwidth / tilesize; x++)
      for(var y = 0; y < boardsize.y; y++){
        var pos = new vec2(x, y).toCoordPos();
        pos.applyCanvasStretch();
        ctx.drawImage(graphics.tile_front, pos.x, pos.y, tilesize * adjustment.x, tilesize * adjustment.y);
      }

    //draw slot for next piece
    for(var x = boardsize.x + 1; x < dwidth / tilesize - 2; x++)
      for(var y = 1; y <= 2; y++){
        var pos = new vec2(x, y).toCoordPos();
        pos.applyCanvasStretch();
        ctx.drawImage(graphics.tile, pos.x, pos.y, tilesize * adjustment.x, tilesize * adjustment.y);
      }
    this.drawNextPiece(ctx); //I wonder what this could be
    //draw slot shadow
    var pos = new vec2(boardsize.x + 1, 1).toCoordPos();
    pos.applyCanvasStretch();
    var size = new vec2(4, 2).toExpandedPos();
    size.applyCanvasStretch();
    ctx.fillRect(pos.x, pos.y, size.x, shadowsize.y);
    ctx.fillRect(pos.x + size.x - shadowsize.x, pos.y + shadowsize.y, shadowsize.x, size.y - shadowsize.y);
  }
  drawNextPiece(ctx){
    if(nextpiece)
      nextpiece.drawCentered(ctx, new vec2(boardsize.x + 3, 2).toCoordPos(), false);
  }
  drawText(ctx){
    spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, 0).toCoordPos(), "Next:");
    spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, 4).toCoordPos(), "Time til:");
    spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, 5).toCoordPos(), "Ball:" + curlvl.tilBall);
    spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, 6).toCoordPos(), "Bonus:" + curlvl.tilBonus);
    spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, 7).toCoordPos(), "Bomb:" + curlvl.tilBomb);
    spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, 9).toCoordPos(), "Momentum:");
    spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, 10).toCoordPos(), balls.length <= 0 ? "none" : (balls[0].speed * 4).toString());
    spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, boardsize.y - 7).toCoordPos(), "Level " + curlvl.num);
    spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, boardsize.y - 6).toCoordPos(), "Pieces:" + curlvl.pieces);
    spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, boardsize.y - 4).toCoordPos(), "Score:");
    spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, boardsize.y - 3).toCoordPos(), score.toString());
    spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, boardsize.y - 2).toCoordPos(), "High:");
    spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, boardsize.y - 1).toCoordPos(), scoreboard.scores[0].points.toString());
  }
  draw(ctx){
    this.drawBorder(ctx);
    this.drawText(ctx);
  }
}
class arrow{
  constructor(dir){
    this.dir = dir;
  }

  getSprt(){
    if(this.dir.equals(vec2.left))
      return new vec2(0, 0);
    else if(this.dir.equals(vec2.right))
      return new vec2(16, 0);
    else if(this.dir.equals(vec2.up))
      return new vec2(32, 0);
    else
      return new vec2(48, 0);
  }
  draw(ctx, pos){
    var blink = lastTime % 500 < 250;
    var sprt = this.getSprt();
    pos = pos.rounded();
	pos.applyCanvasStretch()
	
    ctx.drawImage(graphics.arrows, sprt.x, sprt.y + blink ? 16 : 0, 16, 16, pos.x - (8 * adjustment.x), pos.y - (8 * adjustment.y), 16 * adjustment.x, 16 * adjustment.y);
  }
}
class scoreboard{
  constructor(){}
  
  static load(){
    scoreboard.scores = scoreboard.retrieveData();
  }

  static testHighScore(points){
    for(var i in scoreboard.scores){
      var score = scoreboard.scores[i];
      if(points >= score.points)
        return true;
    }
    return false;
  }
  static highScorePlace(points){
    for(var i in scoreboard.scores){
      var score = scoreboard.scores[i];
      if(points >= score.points)
        return i;
    }
	return null;
  }
  static addScore(newscore){
    for(var i = 0; i < scoreboard.scores.length; i++){
      var score = scoreboard.scores[i];
      if(newscore.points >= score.points){
        scoreboard.scores.splice(i, 0, newscore)
        scoreboard.scores.pop();
		scoreboard.setData();
        return;
      }
    }
  }

  static setData(){
	if(!game.settings.savingEnabled)
		return;
	try{
    var str = "";
		for(var i in scoreboard.scores){
		var score = scoreboard.scores[i];
		str += score.name + "&" + score.points.toString() + "|";
		}
		str = str.substr(0, str.length - 1);
		localStorage.setItem("sdev_tubetris_scoreboard", str);
	}
	catch(err){
		game.warnStorageDisabled();
	}
  }
  static retrieveData(){
	if(!game.settings.savingEnabled)
		return scoreboard.defaultScores();
	try{
		var strdata = localStorage.getItem("sdev_tubetris_scoreboard");
		if(!strdata){
			return scoreboard.defaultScores();
		}
		strdata = strdata.split('|');
		if(strdata.length < 5)
			return scoreboard.defaultScores();
		var r = [];
		for(var i in strdata){
		var strscore = strdata[i].split('&');
		r.push({ name:strscore[0], points:Number.parseInt(strscore[1]) });
		}
	}
	catch(err){
		game.warnStorageDisabled();
		return scoreboard.defaultScores();
	}
    return r;
  }
  static defaultScores(){
    var r = [
      {name:"techno", points:25000},
      {name:"nugget", points:20000},
      {name:"soundless", points:15000},
      {name:"dev", points:10000},
      {name:"ty4playing", points:5000}
      ];
    return r;
  }
}