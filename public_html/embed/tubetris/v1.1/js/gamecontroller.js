//a sort of state machine

class tutorialSequence{
  constructor(){
    this.sequence = 0;
    this.playing = true;
    this.messages = [];
    this.nextSeqCond = null;
		this.tileState = null;
	
    this.init();
    this.doSequence();
  }

  init(){
    timetilDrop = 0;
    fallingpiece = fallpiece_preset.piece_tut1.createPiece();
    nextpiece = fallpiece_preset.piece_tut2.createPiece();
    curlvl.tilBall = 1;
  }
  update(ts){
    if(!this.playing){
      this.updateWait(ts);
      return;
    }
    if(this.nextSeqCond)
      if(this.nextSeqCond()){
        this.nextSeqCond = null;
        this.doNextSequence();
      }
    handleTiles(ts);
    this.updateFallingPiece(ts);
	
    for(var i = balls.length - 1; i >= 0; i--){
      balls[i].roll(ts);
      balls[i].destroyCheck(i);
    }
    
    handleEffects(ts);
  }
  draw(ctx){
	if(!this.playing){
		this.drawMessages(context);
		return;
	}
	game.drawGameplay(ctx);
  }
  updateWait(ts){
    tile.drawTileBG(context);
    drawTiles(context);
    fallingpiece.draw(context);
    for(var i = balls.length - 1; i >= 0; i--)
      balls[i].draw(context);
    if(ballfall)
      drawIndicators(context);
    handleEffects(ts, context);
    game.playerHUD.draw(context);
    if(this.allowedControls)
    	if(this.allowedControls.includes(controlEnum.pauseSelect))
    		this.drawContinueMessage(context);
  }
  drawMessages(ctx){
    for(var i in this.messages){
      this.messages[i].draw(ctx);
    }
  }
  drawContinueMessage(ctx){
  	if(lastTime % 1000 < 500)
  		return;
  	var spos = boardsize.y - 2;
  	new message("press spacebar", new vec2(boardsize.x / 2, spos)).draw(ctx);
  	new message("to continue", new vec2(boardsize.x / 2, spos + 0.5)).draw(ctx);
  }
  setTileState(){
	  var t = [];
	  for(var x in tiles){
		  t.push([]);
		  for(var y in tiles[x])
			  t[x].push(tiles[x][y])
	  }
	  this.tileState = t;
  }
  getLastTileState(){
	  tiles = [];
	  for(var x in this.tileState){
		tiles.push([]);
		for(var y in this.tileState[x])
			tiles[x].push(this.tileState[x][y]);
	  }
  }
  
  updateFallingPiece(ts){
    if(this.turnIsUp()){
      this.completeTurn();
    }
  	timetilDrop -= ts;
  	if(timetilDrop <= 0){
  	  fallingpiece.bumpDown();
  	  timetilDrop = 50;
  	}
  	handleSeshScore();
  }
  turnIsUp(){
    return (
    	(fallingpiece.empty() || fallingpiece == null) &&
    	(balls.length <= 0 && fallingTiles.length <= 0 && taggedTiles.length <= 0 && effects.length <= 0));
  }
  completeTurn(){
		if(fallingpiece.empty() || fallingpiece == null)
			this.getNextPiece();
  }
  getNextPiece(){
  	fallingpiece = nextpiece;
	  nextpiece = fallpiece_preset.piece_tut1.createPiece();

  	if(fallingpiece.overlapsTile())
  	  loseGame();
		
		if(fallingpiece.containsType(tile.type_Ball)){
  		ballfall = true;
  		indicators = [];
  		findIndicators();
		}
		else{
			ballfall = false;
			indicators = [];
		}
	  timetilDrop = 0;
  }

  setMessages(messages){
    this.messages = messages;
    this.sortMessages();
  }
  sortMessages(){
    var b = 0;
    for(var i in this.messages){
      if(!this.messages[i].pos){
        this.messages[i].pos =  new vec2().add(boardsize.multiply(0.5)).add(new vec2(0, -5 + b));
        b += 1;
      }
      if(!this.messages[i].pos.y){
        this.messages[i].pos.y =  new vec2().add(boardsize.multiply(0.5)).add(new vec2(0, -5 + b)).y;
        b += 1;
      }
      if(!this.messages[i].pos.x)
        this.messages[i].pos.x =  new vec2().add(boardsize.multiply(0.5)).add(new vec2(0)).x;
    }
  }

  doNextSequence(){
    this.sequence++;
    this.doSequence();
  }
  doSequence(){
    var r = this;
    switch(this.sequence){
		case 0:
			this.wait([
				new message("welcome to the", null, true, 1),
				new message("tutorial", null, true, 1),
				new message("press spacebar", new vec2(null, 8), false),
				new message("to continue", new vec2(null, 8.5), false)]);
			break;
		case 1:
			this.resume([]);
			this.setNextSequenceDelay(1000);
			break;
		case 2:
			r.wait([
				new message("this is the", new vec2(null, 5)),
				new message("falling piece", new vec2(null, 5.5)),
				new message("that you are", new vec2(null, 6)),
				new message("able to control", new vec2(null, 6.5)),
				]);
			break;
		case 3:
			this.wait([
				new message("you can bump it", new vec2(null, 5)),
				new message("to the left or", new vec2(null, 5.5)),
				new message("right with the", new vec2(null, 6)),
				new message("left and right", new vec2(null, 6.5), true, 1),
				new message("arrow keys", new vec2(null, 7.5)),
				new message("try it out", new vec2(null, 9.5))
				], [controlEnum.bLeft, controlEnum.bRight]);
			break;
		case 4:
			this.resume([controlEnum.bLeft, controlEnum.bRight, controlEnum.bDown]);
			this.setNextSequenceCondition(tutorialSequence.cond_pieceYBelow10);
			break;
		case 5:
			this.wait([
				new message("a key part of", new vec2(null, 5)),
				new message("the strategy of", new vec2(null, 5.5)),
				new message("the game is", new vec2(null, 6)),
				new message("choosing where", new vec2(null, 6.5)),
				new message("to place your", new vec2(null, 7.5)),
				new message("falling pieces", new vec2(null, 8))
				]);
			break;
		case 6:
			fallingpiece.bumpLeft();
			this.wait([
				new message("a good place for", new vec2(null, 5)),
				new message("this piece would", new vec2(null, 5.5)),
				new message("be in the", new vec2(null, 6)),
				new message("bottom right", new vec2(null, 6.5), true, 1),
				new message("corner", new vec2(null, 7.5)),
				new message("so go ahead and", new vec2(null, 12)),
				new message("place it on the", new vec2(null, 12.5)),
				new message("righthand side", new vec2(null, 13))
				], [controlEnum.bRight]);
			break;
		case 7:
			this.resume([controlEnum.bLeft, controlEnum.bRight]);
			this.setNextSequenceCondition(tutorialSequence.cond_pieceAtRight);
			break;
		case 8:
			this.wait([
				new message("good job", new vec2(null, 3.5)),
				new message("now in order to", new vec2(null, 4.5)),
				new message("speed things up", new vec2(null, 5)),
				new message("a bit you can", new vec2(null, 5.5)),
				new message("use the", new vec2(null, 6)),
				new message("down arrow", new vec2(null, 6.5), true, 1),
				new message("", new vec2(null, 7.5)),
				new message("this bumps the", new vec2(null, 12)),
				new message("piece downward", new vec2(null, 12.5))
				], [controlEnum.bDown]);
			break;
		case 9:
			this.resume([controlEnum.bDown]);
			this.setNextSequenceCondition(tutorialSequence.cond_pieceAtTop);
			break;
		case 10:
			nextpiece = fallpiece_preset.piece_ball.createPiece();
			this.wait([
				new message("nice", new vec2(null, 3.5)),
				new message("now a new piece", new vec2(null, 4.5)),
				new message("has spawned", new vec2(null, 5)),
				new message("each time a piece", new vec2(null, 6)),
				new message("is placed a new", new vec2(null, 6.5)),
				new message("and random one", new vec2(null, 7)),
				new message("will replace it", new vec2(null, 7.5))
				]);
			break;
		case 11:
			this.resume([controlEnum.bLeft, controlEnum.bRight]);
			timetilDrop = 0;
			this.setNextSequenceDelay(1000);
			break;
		case 12:
			this.wait([
				new message("this piece does", new vec2(null, 4.5)),
				new message("not fit well", new vec2(null, 5)),
				new message("together with", new vec2(null, 5.5)),
				new message("the other one", new vec2(null, 6)),
				new message("currently", new vec2(null, 6.5)),
				new message("but you can use", new vec2(null, 7.5)),
				new message("up arrow", new vec2(null, 8), true, 1),
				new message("to rotate it", new vec2(null, 9)),
				new message("and make it fit", new vec2(null, 9.5))
				], [controlEnum.rotate]);
			break;
		case 13:
			this.resume([controlEnum.rotate]);
			this.setNextSequenceCondition(tutorialSequence.cond_piece2Rotated);
			break;
		case 14:
			this.wait([
				new message("now it will fit", new vec2(null, 6)),
				new message("into the end of", new vec2(null, 6.5)),
				new message("the other piece", new vec2(null, 7)),
				new message("place it", new vec2(null, 8)),
				new message("accordingly", new vec2(null, 8.5))
				], [controlEnum.bLeft, controlEnum.bRight, controlEnum.bDown, controlEnum.pauseSelect]);
			break;
		case 15:
			this.setTileState();
			this.resume([controlEnum.bLeft, controlEnum.bRight, controlEnum.bDown, controlEnum.pauseSelect]);
			this.setNextSequenceCondition(tutorialSequence.cond_piecePlaced);
			break;
		case 16:
			if(fallingpiece.realPos.equals(new vec2(6, 18)))
				this.doNextSequence();
			else{
				fallingpiece = fallpiece_preset.piece_tut2.createPiece();
				fallingpiece.rotate(-1);
				this.sequence = 14;
				this.doSequence();
				this.getLastTileState();
			}
			break;
		case 17:
			this.wait([
				new message("the goal here is", new vec2(null, 8)),
				new message("to make as long", new vec2(null, 8.5)),
				new message("of a connected", new vec2(null, 9)),
				new message("pipe system as", new vec2(null, 9.5)),
				new message("possible", new vec2(null, 10)),
				]);
			break;
		case 18:
			this.wait([
				new message("and this next", new vec2(null, 4)),
				new message("piece is why", new vec2(null, 4.5)),
				new message("it is a special", new vec2(null, 5)),
				new message("piece and acts", new vec2(null, 5.5)),
				new message("differently than", new vec2(null, 6)),
				new message("the others", new vec2(null, 6.5))
				]);
			break;
		case 19:
			fallingpiece.bumpDown();
			this.resume([controlEnum.bLeft, controlEnum.bRight, controlEnum.pauseSelect]);
			this.setNextSequenceDelay(1000);
			break;
		case 20:
			this.wait([
				new message("this is a ball", new vec2(null, 4), true, 1),
				new message("and when it is", new vec2(null, 5)),
				new message("placed it will", new vec2(null, 5.5)),
				new message("roll through", new vec2(null, 6), true, 1),
				new message("the pipes and", new vec2(null, 7), true, 1),
				new message("clear them", new vec2(null, 8), true, 1),
				new message("until it leaves", new vec2(null, 9)),
				new message("the pipes or", new vec2(null, 9.5)),
				new message("runs out of", new vec2(null, 10)),
				new message("momentum", new vec2(null, 10.5), true, 1)
			]);
			break;
		case 21:
			this.resume();
			this.setNextSequenceCondition(tutorialSequence.cond_pieceYBelow10);
			break;
		case 22:
			this.wait([
				new message("flashing arrows", new vec2(null, 6), true, 1),
				new message("appear as", new vec2(null, 7)),
				new message("indicators of", new vec2(null, 7.5)),
				new message("where you should", new vec2(null, 8)),
				new message("place the ball", new vec2(null, 8.5))
				]);
			break;
		case 23:
			this.wait([
				new message("in this case the", new vec2(null, 7)),
				new message("best area to", new vec2(null, 7.5)),
				new message("place the ball", new vec2(null, 8)),
				new message("is the leftmost", new vec2(null, 8.5)),
				new message("indicator", new vec2(null, 9)),
				new message("it is higher than", new vec2(null, 12)),
				new message("the other and the", new vec2(null, 12.5)),
				new message("ball will gain", new vec2(null, 13)),
				new message("more momentum", new vec2(null, 13.5), true, 1)
				]);
			break;
		case 24:
			this.wait([
				new message("go ahead and", new vec2(null, 6)),
				new message("place it there", new vec2(null, 6.5)),
				new message("using the", new vec2(null, 7)),
				new message("arrow keys", new vec2(null, 7.5), true, 1)
				], [controlEnum.bLeft, controlEnum.bRight, controlEnum.bDown, controlEnum.pauseSelect]);
			break;
			case 25:
			this.resume();
			this.setNextSequenceCondition(tutorialSequence.cond_ballPlaced);
			break;
			case 26:
			if(fallingpiece.realPos.equals(new vec2(6, 17)))
				this.doNextSequence();
			else{
				ballfall = true;
				findIndicators();
				balls = [];
				fallingpiece = fallpiece_preset.piece_ball.createPiece();
				this.sequence = 23;
				this.doSequence();
			}
			break;
		case 27:
			this.wait([
				new message("notice the", new vec2(null, 12)),
				new message("direction arrows", new vec2(null, 12.5), true, 1),
				new message("surrounding the", new vec2(null, 13.5)),
				new message("ball", new vec2(null, 14))
				]);
			break;
		case 28:
			this.wait([
				new message("these are all the", new vec2(null, 12)),
				new message("possible directions", new vec2(null, 12.5), true, 1),
				new message("that the ball can", new vec2(null, 13.5)),
				new message("travel in", new vec2(null, 14))
				]);
			break;
		case 29:
			this.wait([
				new message("this happens when", new vec2(null, 10)),
				new message("the ball comes to", new vec2(null, 10.5)),
				new message("an intersection", new vec2(null, 11)),
				new message("where there is", new vec2(null, 11.5)),
				new message("more than one", new vec2(null, 12)),
				new message("possible path for", new vec2(null, 12.5)),
				new message("it to travel", new vec2(null, 13)),
				new message("along", new vec2(null, 13.5)),
				]);
			break;
		case 30:
			this.wait([
				new message("you can choose to", new vec2(null, 12)),
				new message("move the ball", new vec2(null, 12.5), true, 1),
				new message("in any of these", new vec2(null, 13.5)),
				new message("directions using", new vec2(null, 14)),
				new message("the arrow keys", new vec2(null, 14.5), true, 1)
				]);
			break;
		case 31:
			this.wait([
				new message("move it to the", new vec2(null, 12)),
				new message("right", new vec2(null, 12.5), true, 1)
				], [controlEnum.mRight]);
			break;
		case 32:
			this.resume([]);
			control_mRight();
			this.setNextSequenceDelay(1500);
			break;
		case 33:
			this.wait([
				new message("the ball has now", new vec2(null, 12)),
				new message("reached the end", new vec2(null, 12.5)),
				new message("of its line", new vec2(null, 13)),
				new message("and will be", new vec2(null, 13.5)),
				new message("destroyed", new vec2(null, 14), true, 1)
				]);
			break;
		case 34:
			this.wait([
				new message("along with its", new vec2(null, 12)),
				new message("destruction it", new vec2(null, 12.5)),
				new message("will also romove", new vec2(null, 13)),
				new message("the darkened", new vec2(null, 13.5)),
				new message("tubes that it has", new vec2(null, 14)),
				new message("travelled through", new vec2(null, 14.5))
				]);
			break;
		case 35:
			this.wait([
				new message("each tube removed", new vec2(null, 12)),
				new message("earns you points", new vec2(null, 12.5), true, 1),
				new message("and more tubes", new vec2(null, 13.5)),
				new message("destroyed with", new vec2(null, 14)),
				new message("a single turn", new vec2(null, 14.5)),
				new message("gives you more", new vec2(null, 15)),
				new message("points", new vec2(null, 15.5))
				]);
			break;
		case 36:
			this.resume([]);
			this.setNextSequenceDelay(1000);
			break;
		case 37:
			this.wait([
				new message("congratulations", new vec2(null, 7), true, 1),
				new message("you made it", new vec2(null, 13)),
				new message("through the", new vec2(null, 13.5)),
				new message("basics", new vec2(null, 14))
				]);
			break;
		case 38:
			this.loadTiles(tutorialSequence.tiles_lesson1);
			fallingpiece = fallpiece_preset.piece_bonus.createPiece();
			nextpiece = fallpiece_preset.piece_ball.createPiece();
			this.wait([
				new message("now its time to", new vec2(null, 8)),
				new message("learn about some", new vec2(null, 8.5)),
				new message("of the more", new vec2(null, 9)),
				new message("advanced", new vec2(null, 9.5)),
				new message("mechanics", new vec2(null, 10))
				]);
			break;
		case 39:
			this.resume();
			this.setNextSequenceCondition(tutorialSequence.cond_pieceYAt2);
			break;
		case 40:
			this.wait([
				new message("this is another", new vec2(null, 4)),
				new message("special piece", new vec2(null, 4.5)),
				new message("this one is a", new vec2(null, 5)),
				new message("bonus piece", new vec2(null, 5.5), true, 1),
				new message("and it is very", new vec2(null, 6.5)),
				new message("useful for", new vec2(null, 7)),
				new message("connecting", new vec2(null, 7.5), true, 1),
				new message("dead ends", new vec2(null, 8.5), true, 1)
				]);
			break;
		case 41:
			this.wait([
				new message("place it on the", new vec2(null, 4)),
				new message("ground", new vec2(null, 4.5)),
				new message("in between the", new vec2(null, 5), true, 1),
				new message("other two pieces", new vec2(null, 6), true, 1),
				new message("and you will see", new vec2(null, 7)),
				new message("why", new vec2(null, 7.5))
				]);
			break;
		case 42:
			this.resume();
			this.setNextSequenceCondition(tutorialSequence.cond_piecePlaced);
			break;
		case 43:
			var t = new vec2(4, 19).getTile();
			if(t)
				this.doNextSequence();
			else{
				this.loadTiles(tutorialSequence.tiles_lesson1);
				fallingpiece = fallpiece_preset.piece_bonus.createPiece();
				this.sequence = 41;
				this.doSequence();
			}
			break;
		case 44:
			//nextpiece = fallpiece_preset.piece_bomb.createPiece();
			this.wait([
				new message("it has joined the", new vec2(null, 4)),
				new message("two pieces", new vec2(null, 4.5)),
				new message("together", new vec2(null, 5)),
				new message("creating an even", new vec2(null, 6)),
				new message("larger pipe", new vec2(null, 6.5)),
				new message("system", new vec2(null, 7))
				]);
			break;
		case 45:
			fallingpiece.realPos = new vec2(1, 17);
			this.wait([
				new message("now if we place", new vec2(null, 4)),
				new message("a ball in this", new vec2(null, 4.5)),
				new message("left tube", new vec2(null, 5)),
				new message("we can get rid of", new vec2(null, 6)),
				new message("many more pipes", new vec2(null, 6.5)),
				new message("than before", new vec2(null, 7))
				]);
			break;
		case 46:
			this.resume([]);
			fallingpiece.bumpDown();
			this.setNextSequenceCondition(tutorialSequence.cond_ballPaused);
			break;
		case 47:
			this.wait([
				new message("also when the", new vec2(null, 4)),
				new message("ball passes", new vec2(null, 4.5)),
				new message("through the quad", new vec2(null, 5)),
				new message("piece it stops", new vec2(null, 5.5)),
				new message("and lets you", new vec2(null, 6)),
				new message("choose the", new vec2(null, 6.5), true, 1),
				new message("direction", new vec2(null, 7.5), true, 1),
				new message("it also gives", new vec2(null, 9)),
				new message("the ball", new vec2(null, 9.5)),
				new message("20 momentum", new vec2(null, 10), true, 1)
				]);
			break;
		case 48:
			this.wait([
				new message("move the ball to", new vec2(null, 9)),
				new message("the right to", new vec2(null, 9.5)),
				new message("progress", new vec2(null, 10))
				], [controlEnum.mRight]);
			break;
		case 49:
			this.resume();
			control_mRight;
			this.setNextSequenceCondition(tutorialSequence.cond_pieceAtTop);
			break;
		case 50:
			this.wait([
				new message("notice how the", new vec2(null, 4)),
				new message("remaining pipes", new vec2(null, 4.5)),
				new message("fell down to the", new vec2(null, 5)),
				new message("ground", new vec2(null, 5.5))
				]);
			break;
		case 51:
			this.wait([
				new message("pipes fall after", new vec2(null, 4)),
				new message("the ball is used", new vec2(null, 4.5)),
				new message("it happens if", new vec2(null, 5.5)),
				new message("1 of 2 possible", new vec2(null, 6)),
				new message("conditions are", new vec2(null, 6.5)),
				new message("met", new vec2(null, 7))
				]);
			break;
		case 52:
			this.wait([
				new message("they will fall if", new vec2(null, 4)),
				new message("a pipe directly", new vec2(null, 4.5)),
				new message("below them is", new vec2(null, 5)),
				new message("destroyed", new vec2(null, 5.5)),
				new message("or if they are", new vec2(null, 6.5)),
				new message("floating in the", new vec2(null, 7)),
				new message("air without any", new vec2(null, 7.5)),
				new message("other pipes", new vec2(null, 8)),
				new message("nearby", new vec2(null, 8.5))
				]);
			break;
		case 53:
			this.loadTiles(tutorialSequence.tiles_lesson2);
			fallingpiece = fallpiece_preset.piece_ball.createPiece();
			fallingpiece.realPos = new vec2(8, 16);
			this.wait([
				new message("for example", new vec2(null, 4)),
				new message("if we destroy the", new vec2(null, 4.5)),
				new message("pipes down there", new vec2(null, 5))
				]);
			break;
		case 54:
			this.resume([]);
			fallingpiece.bumpDown();
			this.setNextSequenceCondition(tutorialSequence.cond_pieceAtTop);
			break;
		case 55:
			this.wait([
				new message("then these pipes", new vec2(null, 4)),
				new message("on the right will", new vec2(null, 4.5)),
				new message("fall down", new vec2(null, 5))
				]);
			break;
		case 56:
			this.wait([
				new message("there is one last", new vec2(null, 4)),
				new message("type of special", new vec2(null, 4.5)),
				new message("piece that you", new vec2(null, 5)),
				new message("should know about", new vec2(null, 5.5)),
				new message("which is a", new vec2(null, 6)),
				new message("bomb", new vec2(null, 6.5), true, 1)
				]);
			break;
		case 57:
			this.wait([
				new message("the bomb piece is", new vec2(null, 4)),
				new message("useful when you", new vec2(null, 4.5)),
				new message("need to get", new vec2(null, 5)),
				new message("rid of pipes", new vec2(null, 5.5)),
				new message("but cannot run a", new vec2(null, 6)),
				new message("ball through them", new vec2(null, 6.5))
				]);
			break;
		case 58:
			fallingpiece = fallpiece_preset.piece_bomb.createPiece();
			nextpiece = fallpiece_preset.piece_ball.createPiece();
			this.loadTiles(tutorialSequence.tiles_lesson3);
			this.wait([
				new message("for example", new vec2(null, 4)),
				new message("here is a nice", new vec2(null, 4.5)),
				new message("long tube system", new vec2(null, 5)),
				new message("but it is blocked", new vec2(null, 5.5)),
				new message("and you cannot", new vec2(null, 6)),
				new message("run a ball", new vec2(null, 6.5)),
				new message("through it", new vec2(null, 7))
				]);
			break;
		case 59:
			this.wait([
				new message("use this bomb to", new vec2(null, 4)),
				new message("destroy the pipes", new vec2(null, 4.5), true, 1),
				new message("that are blocking", new vec2(null, 5.5)),
				new message("the entrance to", new vec2(null, 6)),
				new message("the tube system", new vec2(null, 6.5))
				], [controlEnum.bRight, controlEnum.bLeft, controlEnum.bDown, controlEnum.pauseSelect]);
			break;
		case 60:
			this.resume();
			this.setNextSequenceCondition(tutorialSequence.cond_pieceYBelow10);
			break;
		case 61:
			this.setNextSequenceCondition(tutorialSequence.cond_pieceAtTop);
			break;
		case 62:
			if(tiles[1][11] || !tiles[1][12]){
				this.sequence = 59;
				fallingpiece = fallpiece_preset.piece_bomb.createPiece();
				nextpiece = fallpiece_preset.piece_ball.createPiece();
				ballfall = false;
				indicators = [];
				this.loadTiles(tutorialSequence.tiles_lesson3);
				this.doSequence();
			}
			else this.doNextSequence();
			break;
		case 63:
			this.wait([
				new message("good job", new vec2(null, 4)),
				new message("now you can place", new vec2(null, 5)),
				new message("the ball into the", new vec2(null, 5.5)),
				new message("pipes", new vec2(null, 6))
				], [controlEnum.bRight, controlEnum.bLeft, controlEnum.bDown, controlEnum.pauseSelect]);
			break;
		case 64:
			this.resume();
			this.setNextSequenceCondition(tutorialSequence.cond_ballPlaced);
			break;
		case 65:
			if(!fallingpiece.realPos.equals(new vec2(1, 11))){
				this.sequence = 63;
				this.doSequence();
				fallingpiece = fallpiece_preset.piece_ball.createPiece();
				balls = [];
				ballfall = true;
				indicators = [];
				findIndicators();
			}
			else {
				this.setNextSequenceCondition(tutorialSequence.cond_ballPaused);
			}
			break;
		case 66:
			this.wait([
				new message("move left", new vec2(null, 4)),
				new message("to progress", new vec2(null, 4.5))
				], [controlEnum.mLeft]);
		 break;
		case 67:
			this.resume([]);
			balls[0].notifyDirection(vec2.left);
			this.setNextSequenceCondition(tutorialSequence.cond_ballPaused);
			break;
		case 68:
			this.wait([
				new message("move left again", new vec2(null, 4)),
				new message("to progress", new vec2(null, 4.5))
				], [controlEnum.mLeft]);
		 break;
		 case 69:
		 	this.resume([]);
			balls[0].notifyDirection(vec2.left);
		 	this.setNextSequenceCondition(tutorialSequence.cond_pieceAtTop);
		 	break;
		case 70:
			this.wait([
				new message("if you score 750", new vec2(null, 4)),
				new message("points or more", new vec2(null, 4.5)),
				new message("with a single", new vec2(null, 5)),
				new message("ball you will", new vec2(null, 5.5)),
				new message("gain a bonus ball", new vec2(null, 6), true, 1)
				]);
		 	break;
		case 71:
			this.wait([
				new message("which can be used", new vec2(null, 4)),
				new message("to remove even", new vec2(null, 4.5)),
				new message("more pipes", new vec2(null, 5))
				]);
		 	break;
		case 72:
			this.wait([
				new message("but in this case", new vec2(null, 4)),
				new message("we cant really", new vec2(null, 4.5)),
				new message("do a whole lot", new vec2(null, 5)),
				new message("with it", new vec2(null, 5.5))
				]);
		 	break;
		case 73:
			this.loadTiles(tutorialSequence.tiles_lesson4);
			indicators = [];
			findIndicators();
			this.wait([
				new message("so lets", new vec2(null, 4)),
				new message("experiment with", new vec2(null, 4.5)),
				new message("the physics of", new vec2(null, 5)),
				new message("the ball a little", new vec2(null, 5.5))
				]);
		 	break;
		 case 74:
			this.wait([
				new message("where do you", new vec2(null, 4)),
				new message("think the best", new vec2(null, 4.5)),
				new message("place to put a", new vec2(null, 5)),
				new message("a ball would be", new vec2(null, 5.5))
				]);
		 	break;
		 case 75:
			this.wait([
				new message("the obvious", new vec2(null, 4)),
				new message("answer seems to", new vec2(null, 4.5)),
				new message("be the highest", new vec2(null, 5)),
				new message("entry point", new vec2(null, 5.5))
				]);
		 	break;
		 case 76:
		 	fallingpiece.realPos = new vec2(6, 11);
			this.wait([
				new message("so lets try it", new vec2(null, 4))
				]);
		 	break;
		case 77:
			this.resume([]);
			this.setNextSequenceCondition(tutorialSequence.cond_pieceAtTop);
			fallingpiece.bumpDown();
			balls[0].pause();
			balls[0].notifyDirection(vec2.right);
		 	break;
		case 78:
			this.wait([
				new message("it didnt go as", new vec2(null, 4)),
				new message("far as we could", new vec2(null, 4.5)),
				new message("have made it", new vec2(null, 5))
				]);
		 	break
		case 79:
			this.wait([
				new message("remember the ball", new vec2(null, 4)),
				new message("can only live", new vec2(null, 4.5)),
				new message("inside the pipes", new vec2(null, 5)),
				new message("as soon as it", new vec2(null, 5.5), true, 1),
				new message("leaves it is", new vec2(null, 6.5), true, 1),
				new message("destroyed", new vec2(null, 7.5), true, 1)
				]);
		 	break;
		case 80:
			this.wait([
				new message("and from this run", new vec2(null, 4)),
				new message("we can derive", new vec2(null, 4.5)),
				new message("that the ball", new vec2(null, 5)),
				new message("will always fall", new vec2(null, 5.5), true, 1),
				new message("down when given", new vec2(null, 6.5), true, 1),
				new message("the opportunity", new vec2(null, 7.5), true, 1),
				new message("even if the pipes", new vec2(null, 8.5)),
				new message("dont extend", new vec2(null, 9)),
				new message("downward", new vec2(null, 9.5))
				]);
		 	break;
		case 81:
			fallingpiece = fallpiece_preset.piece_ball.createPiece();
			this.loadTiles(tutorialSequence.tiles_lesson4);
			indicators = [];
			findIndicators();
			this.wait([
				new message("so now lets try", new vec2(null, 4)),
				new message("something else", new vec2(null, 4.5))
				]);
			break;
		case 82:
			fallingpiece.realPos = new vec2(9, 12);
			this.wait([
				new message("from here we can", new vec2(null, 4)),
				new message("expect a pretty", new vec2(null, 4.5)),
				new message("good run", new vec2(null, 5))
				]);
		 	break;
		case 83:
			this.resume([]);
			this.setNextSequenceCondition(tutorialSequence.cond_ballPaused);
			fallingpiece.bumpDown();
			break;
		case 84:
			this.wait([
				new message("that was a bit", new vec2(null, 4)),
				new message("weird", new vec2(null, 4.5))
				]);
			break;
		case 85:
			this.wait([
				new message("what happened", new vec2(null, 4)),
				new message("there was that", new vec2(null, 4.5)),
				new message("the ball fell", new vec2(null, 5)),
				new message("down but when it", new vec2(null, 5.5)),
				new message("hit the bottom", new vec2(null, 6)),
				new message("it still had", new vec2(null, 6.5)),
				new message("enough momentum", new vec2(null, 7)),
				new message("stored to turn", new vec2(null, 7.5)),
				new message("around and come", new vec2(null, 8)),
				new message("back up", new vec2(null, 8.5))
				]);
		 	break;
		case 86:
			this.wait([
				new message("continue on to", new vec2(null, 4)),
				new message("the left", new vec2(null, 4.5))
				],	[controlEnum.mLeft]);
		 	break;
		case 87:
			this.resume([]);
			balls[0].notifyDirection(vec2.left);
			this.setNextSequenceCondition(tutorialSequence.cond_pieceAtTop);
			break;
		case 88:
			this.wait([
				new message("well that was a", new vec2(null, 4)),
				new message("pretty good run", new vec2(null, 4.5))
				]);
			break;
		case 89:
			this.wait([
				new message("anyway that just", new vec2(null, 4)),
				new message("about concludes", new vec2(null, 4.5)),
				new message("the tutorial", new vec2(null, 5))
				]);
			break;
		case 90:
			this.wait([
				new message("if you dont like", new vec2(null, 4)),
				new message("the controls you", new vec2(null, 4.5)),
				new message("can change them", new vec2(null, 5)),
				new message("in the options", new vec2(null, 5.5)),
				new message("menu", new vec2(null, 6))
				]);
			break;
		case 91:
			this.wait([
				new message("also you can", new vec2(null, 4)),
				new message("pause or quit", new vec2(null, 4.5)),
				new message("the game or", new vec2(null, 5)),
				new message("tutorial at any", new vec2(null, 5.5)),
				new message("time with", new vec2(null, 6)),
				new message("spacebar", new vec2(null, 6.5))
				]);
			break;
		case 92:
			this.wait([
				new message("which is how you", new vec2(null, 4)),
				new message("can return to", new vec2(null, 4.5)),
				new message("the main menu", new vec2(null, 5)),
				new message("after this", new vec2(null, 5.5)),
				new message("message", new vec2(null, 6))
				]);
			break;
		case 93:
			this.resume([controlEnum.pauseSelect]);
			this.setNextSequenceCondition(tutorialSequence.cond_falseEnd);
			break;
    }
  }

  static cond_pieceAtRight(){
    timetilDrop = 60;
    return fallingpiece.realPos.x >= boardsize.x - 2;
  }
  static cond_pieceAtTop(){
    return fallingpiece.realPos.y <= 2;
  }
  static cond_piece2Rotated(){
    timetilDrop = 60;
    for(var t in fallingpiece.tiles)
      if(fallingpiece.tiles[t].pos.y == 1)
        return true;
    return false;
  }
  static cond_pieceXAt6(){
    if(fallingpiece.realPos.y >= 14)
      timetilDrop = 60;
    return fallingpiece.realPos.x == 6;
  }
  static cond_pieceYAt18(){
    return fallingpiece.realPos.y >= 18;
  }
  static cond_pieceYAt2(){
    return fallingpiece.realPos.y >= 2;
  }
  static cond_pieceYBelow10(){
    return fallingpiece.realPos.y >= 10;
  }
  static cond_ballPlaced(){
    return balls.length > 0;
  }
  static cond_ballPaused(){
  	if(balls.length > 0)
  		return balls[0].paused;
  	return false;
  }
  static cond_piecePlaced(){
		return tutorial.turnIsUp();
  }
  static cond_falseEnd(){
  	timetilDrop = 60;
  	return false;
  }

  loadTiles(tilelayout){
  	poofTiles();
  	tiles = tilelayout;
  	setTilePositions();
  	poofTiles();
  }

  static get tiles_lesson1(){
  	return [
  		[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(1),new tile(11)],
			[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(0)],
			[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(10)],
			[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(1),new tile(13),new tile(9)],
			[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(0),new tile(0)],
			[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(14),new tile(10)],
			[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]
		];
  }
  static get tiles_lesson2(){
  	return [
  		[null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(0),null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(0),null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(0),null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(0),null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(0),null,null,null,null,new tile(1),new tile(11)],
			[null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(0),null,null,null,null,null,new tile(0)],
			[null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(0),null,null,null,null,null,new tile(0)],
			[null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(0),null,null,null,null,new tile(9),new tile(10)],
			[null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(0),null,null,null,new tile(1),new tile(10),null],
			[null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(0),null,null,null,null,null,null]
		];
  }
  static get tiles_lesson3(){
  	return [
  		[null,null,null,null,null,null,null,null,null,null,null,new tile(0),null,null,null,null,new tile(1),new tile(1),new tile(1),new tile(11)],
  		[null,null,null,null,null,null,null,null,null,null,null,new tile(0),new tile(11),null,null,null,null,null,new tile(12),new tile(13)],
  		[null,null,null,null,null,null,null,null,null,null,null,new tile(0),new tile(8),new tile(11),null,null,null,null,new tile(0),null],
  		[null,null,null,null,null,null,null,null,null,null,null,new tile(8),null,new tile(8),new tile(11),null,null,new tile(15),new tile(10),null],
  		[null,null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(0),new tile(9),new tile(1),new tile(10),null,null],
  		[null,null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(8),new tile(13),null,null,null,null],
  		[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  		[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  		[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  		[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]
  	];
  }
  static get tiles_lesson4(){
  	return [
  		[null,null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(15),new tile(15),new tile(14),new tile(11),null,null],
  		[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(14),null,new tile(12),new tile(1),new tile(11)],
  		[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(13),null,new tile(0)],
  		[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(12),new tile(1),new tile(0)],
  		[null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(9),new tile(1),new tile(1),null,new tile(0),null,null],
  		[null,null,null,null,null,null,null,null,null,null,null,null,new tile(9),new tile(14),new tile(15),null,new tile(15),new tile(10),null,null],
  		[null,null,null,null,null,null,null,null,null,null,null,null,new tile(0),null,new tile(0),null,new tile(0),null,null,null],
  		[null,null,null,null,null,null,null,null,null,null,null,new tile(12),new tile(10),null,new tile(0),null,new tile(0),null,null,null],
  		[null,null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(8),new tile(15),new tile(10),null,null,null],
  		[null,null,null,null,null,null,null,null,null,null,null,null,null,new tile(1),new tile(1),new tile(10),null,null,null,null]
  	];
  }
  
  wait(messages = null, allowedControls = null){
    if(allowedControls)
      this.allowedControls = allowedControls;
    else{
      this.allowedControls = [controlEnum.pauseSelect];
    }
    if(messages)
      this.setMessages(messages);
    if(this.playing)
      game.playSound(sfx.roll);
    this.playing = false;
  }
  resume(allowedControls = null){
    this.allowedControls = allowedControls;
    this.messages = [];
    this.playing = true;
  }
  setNextSequenceCondition(condition){
    this.nextSeqCond = condition;
  }
  setNextSequenceDelay(ms){
    var r = this;
    setTimeout(function(){ r.doNextSequence(); }, ms)
  }
  controlAllowed(control){
    if(!this.allowedControls)
      return true;
    var dn = false;
    var ce = game.controlEnumeration(control)
    for(var i in ce)
      if(this.allowedControls.includes(ce[i]))
        dn = true;
    return dn;
  }
  handleControl(control){
    if(!this.playing){
      if(this.controlAllowed(control)){
        game.playSound(sfx.rollHit);
        this.doNextSequence();
        if(this.playing && control != game.settings.controls.pauseSelect)
          this.handleControl(control)
      }
      return;
    }
    if(!this.controlAllowed(control))
      return;
    if(control == game.settings.controls.bLeft) control_left(); 
    if(control == game.settings.controls.bRight) control_right(); 
    if(control == game.settings.controls.bDown) control_down(); 
    if(control == game.settings.controls.quickDrop) control_drop(); 
    if(control == game.settings.controls.rotate) control_rotate(); 
    if(control == game.settings.controls.rotateCC) control_rotateCC();
    if(control == game.settings.controls.mLeft) control_mLeft(); 
    if(control == game.settings.controls.mRight) control_mRight(); 
    if(control == game.settings.controls.mDown) control_mDown(); 
    if(control == game.settings.controls.mUp) control_mUp(); 
    if(control == game.settings.controls.pauseSelect) control_pause();
  }
}
class message{
  constructor(text, pos = null, uselargefont = false, fontsize = 2){
    this.text = text;
    this.pos = pos;
    this.font = smallfontUC;
    if(uselargefont)
      this.font = spritefont;
    this.fontsize = fontsize;
  }
  draw(ctx){
    this.font.drawTextCentered(ctx, this.pos.toCoordPos(), this.text, this.fontsize);
  }
}
class gameController{
  constructor(){
	  //initializes a game controller object
    this.settings = {
		  musicEnabled:true,
		  sfxEnabled:true,
		  animStepRate:100,
		  savingEnabled:true,
		  controls: {
		  	mUp:38,			    //0
		  	mDown:40,		    //1
		  	mLeft:37,		    //2
		  	mRight:39,	  	//3
		  	bLeft:37,		    //4
		  	bRight:39,		  //5
	   		bDown:40,		    //6
		  	quickDrop:0,	  //7
		  	rotate:38,	  	//8
		  	rotateCC:0,		  //9
		  	pauseSelect:32	//10
		  }
    };
    this.mode = gameController.mode_mainMenu;
    this.lastMode = -1;
    this.playerHUD = new hud();
    this.mainMenuScreen = null;
    this.pausedScreen = null;
    this.optionsScreen = null;
    this.scoreBoardScreen = null;
    this.controlsMenuScreen = null;
    this.tutorialScreen = null;
    this.gameoverScreen = null;
    this.creditsScreen = null;
    this.saveErrorScreen = null;
    this.keybindingScreen = null;
  }
  loadScreens(){
    this.mainMenuScreen = menuScreen.screen_mainMenu;
    this.pausedScreen = menuScreen.screen_paused;
    this.optionsScreen = menuScreen.screen_options;
    this.scoreBoardScreen = menuScreen.screen_scoreBoard;
    this.controlsMenuScreen = menuScreen.screen_controlsMenu;
    this.tutorialScreen = menuScreen.screen_tutorial;
    this.gameoverScreen = menuScreen.screen_gameover;
    this.creditsScreen = menuScreen.screen_credits;
  	this.saveErrorScreen = menuScreen.screen_saveError;
  	this.keybindingScreen = menuScreen.screen_keybinding;
  }

  switchMode(mode){
	  //switches the game mode from one to the specified
		this.lastMode = this.mode;
    this.mode = mode;
		if(this.mode == gameController.mode_gameplay)
			this.startMusic();
    if(mode === gameController.mode_tutorial)
      this.tutorialScreen = menuScreen.screen_tutorial;
    if(mode === gameController.mode_scoreBoard)
      this.scoreBoardScreen = menuScreen.screen_scoreBoard;
    if(mode === gameController.mode_paused)
      this.pausedScreen.selectedItem = 0;
  }
  controlEnumeration(keycode){
	  //enumerates the controls assigned to the specified keycode
    var r = [];
    
    if(keycode == this.settings.controls.mUp) r.push(0);
    if(keycode == this.settings.controls.mDown) r.push(1);
    if(keycode == this.settings.controls.mLeft) r.push(2);
    if(keycode == this.settings.controls.mRight) r.push(3);
    if(keycode == this.settings.controls.bLeft) r.push(4);
    if(keycode == this.settings.controls.bRight) r.push(5);
    if(keycode == this.settings.controls.bDown) r.push(6);
    if(keycode == this.settings.controls.quickDrop) r.push(7);
    if(keycode == this.settings.controls.rotate) r.push(8);
    if(keycode == this.settings.controls.rotateCC) r.push(9);
    if(keycode == this.settings.controls.pauseSelect) r.push(10);
    
    return r;
  }

  mode_update(ts){
	  //handles the logic step for the current mode
    switch(this.mode){
      case gameController.mode_mainMenu: this.menuUpdate(this.mainMenuScreen, ts); return;
      case gameController.mode_controlsMenu: this.menuUpdate(this.controlsMenuScreen, ts); return;
      case gameController.mode_option: this.menuUpdate(this.optionsScreen, ts); return;
      case gameController.mode_gameplay: this.updateGameplay(ts); return;
      case gameController.mode_paused: this.menuUpdate(this.pausedScreen, ts); return;
      case gameController.mode_scoreBoard: this.menuUpdate(this.scoreBoardScreen, ts); return;
      case gameController.mode_tutorial: this.updateTutorial(ts); return;
      case gameController.mode_gameover: this.menuUpdate(this.gameoverScreen, ts); return;
      case gameController.mode_credits: this.menuUpdate(this.creditsScreen, ts); return;
      case gameController.mode_saveError: this.menuUpdate(this.saveErrorScreen, ts); return;
      case gameController.mode_keybinding: this.menuUpdate(this.keybindingScreen, ts); return;
    }
  }
  mode_draw(ctx){
	  //handles rendereng for the current mode
    switch(this.mode){
      case gameController.mode_mainMenu: this.menuDraw(this.mainMenuScreen, ctx); return;
      case gameController.mode_controlsMenu: this.menuDraw(this.controlsMenuScreen, ctx); return;
      case gameController.mode_option: this.menuDraw(this.optionsScreen, ctx); return;
      case gameController.mode_gameplay: this.drawGameplay(ctx); return;
      case gameController.mode_paused: this.menuDraw(this.pausedScreen, ctx); return;
      case gameController.mode_scoreBoard: this.menuDraw(this.scoreBoardScreen, ctx); return;
      case gameController.mode_tutorial: this.drawTutorial(ctx); return;
      case gameController.mode_gameover: this.menuDraw(this.gameoverScreen, ctx); return;
      case gameController.mode_credits: this.menuDraw(this.creditsScreen, ctx); return;
      case gameController.mode_saveError: this.menuDraw(this.saveErrorScreen, ctx); return;
      case gameController.mode_keybinding: this.menuDraw(this.keybindingScreen, ctx); return;
    }
  }
  
  mode_handleControl(control){
	  //handles control input based on the current mode
    switch(this.mode){
      case gameController.mode_mainMenu: this.handleControlMenu(this.mainMenuScreen, control); return;
      case gameController.mode_controlsMenu: this.handleControlMenu(this.controlsMenuScreen, control); return;
      case gameController.mode_option: this.handleControlMenu(this.optionsScreen, control); return;
      case gameController.mode_gameplay: this.handleControlGameplay(control); return;
      case gameController.mode_paused: this.handleControlMenu(this.pausedScreen, control); return;
      case gameController.mode_scoreBoard: this.handleControlMenu(this.scoreBoardScreen, control); return;
      case gameController.mode_tutorial: this.handleControlTutorial(control); return;
      case gameController.mode_gameover: this.handleControlMenu(this.gameoverScreen, control); return;
      case gameController.mode_credits: this.handleControlMenu(this.creditsScreen, control); return;
      case gameController.mode_saveError: this.handleControlMenu(this.saveErrorScreen, control); return;
      case gameController.mode_keybinding: this.handleControlMenu(this.keybindingScreen, control); return;
    }
  }
  mode_handleMouseOver(event){
	  //handles mouse movement based on the current step
    switch(this.mode){
      case gameController.mode_mainMenu: this.handleMouseOverMenu(this.mainMenuScreen, event); return;
      case gameController.mode_controlsMenu: this.handleMouseOverMenu(this.controlsMenuScreen, event); return;
      case gameController.mode_option: this.handleMouseOverMenu(this.optionsScreen, event); return;
      case gameController.mode_gameplay: this.handleMouseOverGameplay(new vec2(event.offsetX, event.offsetY)); return;
      case gameController.mode_paused: this.handleMouseOverMenu(this.pausedScreen, event); return;
      case gameController.mode_scoreBoard: this.handleMouseOverMenu(this.scoreBoardScreen, event); return;
      case gameController.mode_tutorial: this.handleMouseOverGameplay(new vec2(event.offsetX, event.offsetY)); return;
      case gameController.mode_gameover: this.handleMouseOverMenu(this.gameoverScreen, event); return;
      case gameController.mode_credits: this.handleMouseOverMenu(this.creditsScreen, event); return;
      case gameController.mode_saveError: this.handleMouseOverMenu(this.saveErrorScreen, event); return;
      case gameController.mode_keybinding: this.handleMouseOverMenu(this.keybindingScreen, event); return;
    }
  }
  mode_handleMouseClick(event){
	  //handles mouse click events based on the current mode
    switch(this.mode){
      case gameController.mode_mainMenu: this.handleMouseClickMenu(this.mainMenuScreen, new vec2(event.offsetX, event.offsetY)); return;
      case gameController.mode_controlsMenu: this.handleMouseClickMenu(this.controlsMenuScreen, new vec2(event.offsetX, event.offsetY)); return;
      case gameController.mode_option: this.handleMouseClickMenu(this.optionsScreen, new vec2(event.offsetX, event.offsetY)); return;
      case gameController.mode_gameplay: this.handleMouseClickGameplay(new vec2(event.offsetX, event.offsetY)); return;
      case gameController.mode_paused: this.handleMouseClickMenu(this.pausedScreen, new vec2(event.offsetX, event.offsetY)); return;
      case gameController.mode_scoreBoard: this.handleMouseClickMenu(this.scoreBoardScreen, new vec2(event.offsetX, event.offsetY)); return;
      case gameController.mode_tutorial: this.handleMouseClickGameplay(new vec2(event.offsetX, event.offsetY)); return;
      case gameController.mode_gameover: this.handleMouseClickMenu(this.gameoverScreen, new vec2(event.offsetX, event.offsetY)); return;
      case gameController.mode_credits: this.handleMouseClickMenu(this.creditsScreen, new vec2(event.offsetX, event.offsetY)); return;
      case gameController.mode_saveError: this.handleMouseClickMenu(this.saveErrorScreen, new vec2(event.offsetX, event.offsetY)); return;
      case gameController.mode_keybinding: this.handleMouseClickMenu(this.keybindingScreen, new vec2(event.offsetX, event.offsetY)); return;
    }
  }
  mode_handleMouseUp(event){
	  //handles mouse release events based on the current mode
    switch(this.mode){
      case gameController.mode_gameplay: this.handleMouseUpGameplay(new vec2(event.offsetX, event.offsetY)); return;
      case gameController.mode_tutorial: this.handleMouseUpGameplay(new vec2(event.offsetX, event.offsetY)); return;
    }
  }
  handleMouseOverGameplay(offset){
	  //handles mouse movement while in a gameplay mode
	  if(!dragstart)
		  return;
	  var sideway = 30;
	  var down = 50;
	  var up = 40;
	  if(offset.x >= dragstart.x + sideway){
		  control_right();
		  control_mRight();
		  dragstart = offset.copy();
	  }
	  if(offset.x <= dragstart.x - sideway){
		  control_left();
		  control_mLeft();
		  dragstart = offset.copy();
	  }
	  if(offset.y >= dragstart.y + down){
		  control_down();
		  control_mDown();
		  dragstart = offset.copy();
	  }
	  if(offset.y <= dragstart.y - up){
		  control_rotate();
		  control_mUp();
		  dragstart = offset.copy();
	  }
  }
  handleMouseClickGameplay(offset){
	  //handles mouse clicks while in a gameplay mode
	  dragstart = offset.copy();
  }
  handleMouseUpGameplay(offset){
	  dragstart = null;
  }
  handleControlGameplay(control){
      if(control == this.settings.controls.bLeft) control_left(); 
      if(control == this.settings.controls.bRight) control_right(); 
      if(control == this.settings.controls.bDown) control_down(); 
      if(control == this.settings.controls.quickDrop) control_drop(); 
      if(control == this.settings.controls.rotate) control_rotate(); 
      if(control == this.settings.controls.rotateCC) control_rotateCC();
      if(control == this.settings.controls.mLeft) control_mLeft(); 
      if(control == this.settings.controls.mRight) control_mRight(); 
      if(control == this.settings.controls.mDown) control_mDown(); 
      if(control == this.settings.controls.mUp) control_mUp(); 
      if(control == this.settings.controls.pauseSelect) control_pause();   
  }
  handleControlTutorial(control){
    tutorial.handleControl(control);
  }
  handleControlMenu(screen, control){
    if(clistening >= 0)
      return;
    switch(control){
      case this.settings.controls.mDown: screen.selectionChange(1); return;
      case this.settings.controls.mUp: screen.selectionChange(-1); return;
      case this.settings.controls.bDown: screen.selectionChange(1); return;
      case this.settings.controls.rotate: screen.selectionChange(-1); return;
      case this.settings.controls.pauseSelect: screen.select(); return;
    }
  }
  handleMouseOverMenu(screen, event){
    if(clistening >= 0)
      return;
  	for(var i in screen.buttons){
  		var rect = {
  			size: screen.buttons[i].size,
  			pos: screen.buttons[i].pos.add(screen.buttons[i].size.multiply(-0.5))
  		};
  		if(event.offsetY >= rect.pos.y * adjustment.y && event.offsetY <= rect.pos.y * adjustment.y + rect.size.y){
  			screen.setSelection(i);
  			return;
  		}
  	}
  }
  handleMouseClickMenu(screen, offset){
    if(clistening >= 0)
      return;
    var sel = false;
		for(var i in screen.buttons){
  			var rect = {
  				size: screen.buttons[i].size.copy(),
  				pos: screen.buttons[i].pos.copy().add(screen.buttons[i].size.multiply(-0.5))
  			};
			rect.size.applyCanvasStretch();
			rect.pos.applyCanvasStretch();
  			if(offset.y >= rect.pos.y && offset.y <= rect.pos.y + rect.size.y){
  				screen.setSelection(i);
				if(offset.x >= rect.pos.x && offset.x <= rect.pos.x + rect.size.x)
					sel = true;
  			}
  		}
		if(sel)
			screen.select();
  }
  handleMouseUpMenu(screen, offset){
  }
  
  updateGameplay(ts){
    handleTiles(ts, context);
    handleFallingPiece(ts);
		handleFallingTiles(ts);
    for(var i = balls.length - 1; i >= 0; i--){
      balls[i].roll(ts);
      balls[i].destroyCheck(i);
    }
    handleEffects(ts);
  }
  drawGameplay(ctx){
		drawTiles(ctx);
		fallingpiece.draw(ctx);
		drawFallingTiles(ctx);
		balls.forEach(function(b){
			b.draw(ctx);
			});
		if(ballfall)
			drawIndicators(ctx);
		drawEffects(ctx);
		this.playerHUD.draw(ctx);
  }
  
  updateTutorial(ts){
    tutorial.update(ts);
  }
  drawTutorial(ctx){
	  tutorial.draw(ctx);
  }
  
  menuUpdate(screen, ts){
  }
  menuDraw(screen, ctx){
    screen.draw(context, spritefont);
  }

  playSound(sound, fromstart = true){
		if(!this.settings.sfxEnabled)
			return;
		if(fromstart)
			sound.currentTime = 0;
		sound.play();
  }
  startMusic(){
  	if(!this.settings.musicEnabled)
  		return;
  	sfx.music.addEventListener('ended', gameController.startMusicLoop);
  	sfx.music.play();
  }
  stopMusic(){
  	sfx.music.pause();
  	sfx.music.currentTime = 0;
  }
  pauseMusic(){
  	sfx.music.pause();
  }
  static startMusicLoop(){
  	sfx.music.currentTime = 0;
  	sfx.music.play();
  }
  
  settingsChange_musicEnabled(){
  	this.settings.musicEnabled = !this.settings.musicEnabled;
  }
  settingsChange_sfxEnabled(){
  	this.settings.sfxEnabled = !this.settings.sfxEnabled;
  }
  settingsChange_animStepRate(){
    if (this.settings.animStepRate >= 100)
      this.settings.animStepRate = 40;
    else if(this.settings.animStepRate >= 40)
      this.settings.animStepRate = 0;
    else this.settings.animStepRate = 100;
  }
  settingsText_animStepRate(){
  	if (game.settings.animStepRate >= 100)
  		return "normal";
  	else if(game.settings.animStepRate >= 40)
  		return "fast";
  	else return "instant";
  }
  
  static get game(){
    return new gameController();
  }
  static get mode_mainMenu(){ return 0; }
  static get mode_gameplay(){ return 1; }
  static get mode_paused() { return 2; }
  static get mode_optionsMenu() { return 3; }
  static get mode_controlsMenu() { return 4; }
  static get mode_scoreBoard() { return 5; }
  static get mode_tutorial() { return 6; }
  static get mode_gameover() { return 7; }
  static get mode_credits() { return 8; }
  static get mode_tutorial() { return 9; }
  static get mode_saveError() { return 10; }
  static get mode_keybinding() { return 11; }
  
  setDefaultKeybindings(){
		  this.settings.controls = {
			mUp:38,			//0
			mDown:40,		//1
			mLeft:37,		//2
			mRight:39,		//3
			bLeft:37,		//4
			bRight:39,		//5
			bDown:40,		//6
			quickDrop:0,	//7
			rotate:38,		//8
			rotateCC:0,		//9
			pauseSelect:32	//10
		  }
  }
  loadKeybindings(){
	  if(!this.settings.savingEnabled){
		  this.setDefaultKeybindings();
		  return;
	  }
	  try{
		  var kb = localStorage.getItem("sdev_tubetris_keybindings");
		  if(!kb){
			this.setDefaultKeybindings();
			return;
		  }
		  kb = kb.split('|');
		  if(kb.length.length < 10){
			this.setDefaultKeybindings();
			return;
		  }
		  for(var i = 0; i < kb.length; i++)
			  setControlToKey(i, Number.parseInt(kb[i]));
	  }
	  catch(err){
		this.warnStorageDisabled();
	  }
  }
  saveKeybindings(){
	  if(!this.settings.savingEnabled)
		  return;
	  try{
	  var strdata = this.settings.controls.mUp.toString() + '|' +
		this.settings.controls.mDown.toString() + '|' +
		this.settings.controls.mLeft.toString() + '|' +
		this.settings.controls.mRight.toString() + '|' +
		this.settings.controls.bLeft.toString() + '|' +
		this.settings.controls.bRight.toString() + '|' +
		this.settings.controls.bDown.toString() + '|' +
		this.settings.controls.quickDrop.toString() +'|' +
		this.settings.controls.rotate.toString() + '|' +
		this.settings.controls.rotateCC.toString() +'|' +
		this.settings.controls.pauseSelect.toString();
		
		localStorage.setItem("sdev_tubetris_keybindings", strdata);
	  }
	  catch(err){
		this.warnStorageDisabled();
	  }
  }
  
  loadSettings(){
		if(!this.settings.savingEnabled){
			this.setDefaultSettings();
			return;
		}
	
		try{
			var settings = localStorage.getItem("sdev_tubetris_config");
			if(!settings){
				this.setDefaultSettings();
				return;
			}
			settings = settings.split('|');
			if(settings.length <= 1){
				this.setDefaultSettings();
				return;
			}
			this.settings.musicEnabled = settings[0].split(':')[1] === "true";
			this.settings.sfxEnabled = settings[1].split(':')[1] === "true";
			this.settings.animStepRate = Number.parseInt(settings[2].split(':')[1]);
		}
		catch(err){
			this.warnStorageDisabled();
		}
  }
  setDefaultSettings(){
  	this.settings.musicEnabled = true;
  	this.settings.sfxEnabled = true;
  	this.settings.animStepRate = 100;
  }
  saveSettings(){
		if(!this.settings.savingEnabled)
			return;
		try{
			var strdat = "music:" + this.settings.musicEnabled.toString() + "|sfx:" + this.settings.sfxEnabled.toString() + "|animRate:" + this.settings.animStepRate.toString();
			localStorage.setItem("sdev_tubetris_config", strdat);
		}
		catch(err){
			this.warnStorageDisabled();
		}
  }
  warnStorageDisabled(){
	  this.switchMode(gameController.mode_saveError);
  }
}
class level{
  constructor(lvlnum = 1){
    this.num = lvlnum;
    this.pieces = this.num * 5 + 10;
    this.ballInterval = Math.floor(this.num / 3 + 5);
    this.bonusInterval = Math.round(this.num * 2 + 10);
    this.bombInterval = Math.round(this.num * 2 + 5);
    this.tilBall = this.ballInterval;
    this.tilBonus = this.bonusInterval;
    this.tilBomb = this.bombInterval;
    this.dropInterval = Math.max(20, 40 - this.num * 2);
  }

  updateIntervals(){
  	var n = new level(this.num);
    this.pieces = n.pieces;
    this.ballInterval = n.ballInterval;
    this.bonusInterval = n.bonusInterval;
    this.bombInterval = n.bombInterval;
    this.dropInterval = n.dropInterval;
  }
  getNextPiece(){
  	this.tilBall--;
  	this.tilBonus--;
  	this.tilBomb--;
  	this.pieces--;
  	if(this.pieces <= 0)
  		this.nextLevel();
  	if(this.tilBall <= 0){
  		this.resetBallInt();
  		return fallpiece_preset.piece_ball.createPiece();
  	}
  	if(this.tilBonus <= 0){
  		this.resetBonusInt();
  		return fallpiece_preset.piece_bonus.createPiece();
  	}
  	if(this.tilBomb <= 0){
  		this.resetBombInt();
  		return fallpiece_preset.piece_bomb.createPiece();
  	}
  	return fallpiece_preset.getRandomPiece(fpPresets);
  }
  resetBallInt(){
  	this.tilBall = this.ballInterval;
  }
  resetBonusInt(){
  	this.tilBonus = this.bonusInterval;
  	while(this.tilBonus === this.tilBomb || this.tilBall === this.tilBonus)
  		this.tilBonus--;
  }
  resetBombInt(){
  	this.tilBomb = this.bombInterval;
  	while(this.tilBomb === this.tilBonus || this.tilBomb === this.tilBall)
  		this.tilBomb++;

  }
  nextLevel(){
  	game.playSound(sfx.levelUp);

  	this.num++;
  	this.updateIntervals();
  }
}
