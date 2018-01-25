//defines all (most) of the data types that are used in the game

class vec2{
	//a data type that acts as a 2-dimentional vector
  constructor(x = 0, y = x){
	  //member 'x' - the x component of the vector
	  //member 'y' - the y component of the vector
    this.x = x;
    this.y = y;
  }

  add(vec){
	  //adds two vectors together and returns the result
    var v = this.copy();
    v.x += vec.x;
    v.y += vec.y;
    return v;
  }
  multiply(factor){
	  //multiplies both the x and y component of this vector by the specified factor
    var v = this.copy();
    v.x *= factor;
    v.y *= factor;
    return v;
  }
  rounded(){
	  //rounds the x and y component of this vector to whole numbers
    var v = this.copy();
    v.x = Math.round(this.x);
    v.y = Math.round(this.y);
    return v;
  }
  normalized(mag = 1){
	  //returns a vector with the same direction as this vector but with a different, 
	  //specified magnitude
    this.multiply(1 / this.distance());
    this.multiply(mag);
  }
  distance(vec = new vec2()){
	  //returns the linear distance between this and another vector
    return Math.sqrt(Math.pow(vec.x - this.x, 2) + Math.pow(vec.y - this.y, 2));
  }
  direction(vec = null){
	  //returns the direction that this vecotr is pointing, in radians
    var v = vec == null ? this.copy() : vec.add(this.multiply(-1));
    return Math.atan2(v.y, v.x);
  }
  static fromAng(ang, mag = 1){
	  //calculates and returns a vector given an angle and magnitude
    return (new vec2(Math.cos(ang), Math.sin(ang))).multiply(mag);
  }

  toTilePos(){
	  //returns the board position that this vector is overlapping
    var v = this.copy();
    v.x -= boardLeft;
    v.y -= boardTop;
    v.x /= tilesize;
    v.y /= tilesize;
    v.x = Math.floor(v.x);
    v.y = Math.floor(v.y);
    return v;
  }
  toCoordPos(){
	  //returns the pixel position of a board location
    var v = this.copy();
    v.x *= tilesize;
    v.y *= tilesize;
    v.x += boardLeft;
    v.y += boardTop;
    return v;
  }
  toExpandedPos(){
	  //returns this multiplied by the tile size
    var v = this.copy();
    v.x *= tilesize;
    v.y *= tilesize;
    return v;
  }
  getTile(){
	  //get the tile that this board position is referring to
    if(this.x >= boardsize.x || boardsize.y <= this.y || this.x < 0 )
      return tile.closed;
    if(this.y < 0)
      return null;
    return tiles[this.x][this.y];
  }
  applyCanvasStretch(){
	  //stretches this vector to compensate for the amount that the canvas has been stretched
	  this.x *= adjustment.x;
	  this.y *= adjustment.y;
	  return this;
  }
  
  equals(vec, leniency = 0.0001){
	  //checks to see if this vector is equal to another, given a leniency factor
	  //used to avoid floating point miscalculations
    return (
      Math.abs(this.x - vec.x) <= leniency &&
      Math.abs(this.y - vec.y) <= leniency );
  }
  copy(){
	  //returns a new vector instance with the same x and y values
    return new vec2(this.x, this.y);
  }

  toString(){
    return "<" + this.x + ", " + this.y + ">";
  }
  static containsVec(vecarray, vec){
	  //returns true if an array contains the specified vector
    for(var i = vecarray.length - 1; i >= 0; i--){
      if(vecarray[i].equals(vec))
        return true;
    }
    return false;
  }  

  //direction standard vectors:
  static get right(){
    return new vec2(1, 0);
  }
  static get left(){
    return new vec2(-1, 0);
  }
  static get down(){
    return new vec2(0, 1);
  }
  static get up(){
    return new vec2(0, -1);
  }
}
class effect{
	//data type that contains information and methods for rendering and animating effects
  constructor(spritesheet, pos, width, height, frames, animinterval){
    this.pos = pos;
    this.spritesheet = spritesheet;
    this.size = new vec2(width, height);
    this.frameCount = frames;
    this.animInterval = animinterval;
    this.tilFrameIncrement = this.animInterval;
    this.curFrame = 0;
  }

  update(ts, index){
	  //handles the logic of the step
    this.animate(ts, index);
  }

  remove(index){
	  //removes an effect instance at `index` of the global effects array
    effects.splice(index, 1);
  }
  animate(ts, index){
	  //decrements the frame display time and increments the frame
	  //based on the given timescale(`ts`) and index(the index of 
	  //this instance in the global effects array)
    this.tilFrameIncrement += ts;
    if(this.tilFrameIncrement >= this.animInterval){
      var elapsedframes = Math.floor(this.tilFrameIncrement / this.animInterval); 
      this.tilFrameIncrement = this.tilFrameIncrement % this.animInterval;
      this.curFrame += elapsedframes;
      if(this.curFrame >= this.frameCount)
        this.remove(index);
    }
  }
  draw(ctx){
	  //renders this effect instance given the current canvas context2D 
    var spos = this.pos.add(this.size.multiply(-0.5)).rounded();
    spos.applyCanvasStretch();
    ctx.drawImage(this.spritesheet, this.size.x * this.curFrame, 0, this.size.x, this.size.y, spos.x, spos.y, this.size.x * adjustment.x, this.size.y * adjustment.y);
  }

  static poof(pos){
	  //returns a new poof effect at `pos`
    var r = new effect(graphics.smoke, pos, 56, 56, 10, 1);
    return r;
  }
  static boom(pos){
	  //returns a new explosion effect at `pos`
    var r = new effect(graphics.explosion, pos, 96, 96, 12, 1.5);
    return r;
  }
}
class flash extends effect{
  constructor(pos, size, color, life){
    super(null, pos, size.x, size.y, 0, 1);
    this.color = color;
    this.life = life;
    this.maxLife = life;
  }
  
  update(ts, index){
    this.life -= ts;
    if(this.life <= 0)
      effects.splice(index, 1);
  }
  draw(ctx){
	var spos = this.pos;
	//spos.applyCanvasStretch();
	
    ctx.fillStyle = "rgba(" + this.color[0] + "," + this.color[1] + "," + this.color[2] + "," + this.color[3] * (this.life / this.maxLife) + ")";
    ctx.fillRect(spos.x, spos.y, this.size.x, this.size.y);
  }
}
class splashtxt extends flash{
  constructor(pos, txt, life){
    super(pos, new vec2(), null, life);
    this.txt = txt;
  }
  
  update(ts, index){
    this.life -= ts;
    if(this.life <= 0)
      effects.splice(index, 1);
  }
  draw(ctx){
	var spos = this.pos.copy();
    smallfont.drawTextCentered(ctx, spos, this.txt);
  }
}
class notification extends splashtxt{
  constructor(txt, life){
    super(new vec2().add(boardsize.toCoordPos()).multiply(0.5), txt, life);
    var n = 0;
    for(var i in effects)
      if(effects[i] instanceof notification)
        n++;
    this.pos.y += n * 40;
  }
  draw(ctx){
    spritefont.drawTextCentered(ctx, this.pos, this.txt);
  }
}
class tile{
	//data type containing methods and information about tiles
  constructor(type = 0, pos = new vec2()){
	  //initializes a `tile` object
	  //member 'type' - the type of tile that it is
	  //memebr 'pos' - the position on the board that this tile is occupying
	  //member 'openEnds' - array that contains which directions the ball can travel in from this tile
	  //member 'tagged' - whether or not this tile has been tagged by the ball
	  //member 'powered' - when you fill a horizontal line, all of the tiles in that column get 'powered'
    this.type = type;
    this.pos = pos;
    this.openEnds = tile.typeOpenEnds(this.type);
    this.tagged = false;
    this.powered = false;
  }
  renew(){
	  //refreshes the tile when you set it to a different 'type' than it was before
    this.openEnds = tile.typeOpenEnds(this.type);
  }

  tag(){
	  //when a ball tags a tile by rolling through it
    if(!this.tagged){
      taggedTiles.push(this);
      this.tagged = true;
    }
  }
  set(){
	  //sets this tile in place, refreshing the default values for this tile type
    switch(this.type){
      case tile.type_Quad:
        var ut = this.pos.add(vec2.up).getTile();
        var bt = this.pos.add(vec2.down).getTile();
        var lt = this.pos.add(vec2.left).getTile();
        var rt = this.pos.add(vec2.right).getTile();
        if(ut) ut.forceOpen(vec2.down);
        if(bt) bt.forceOpen(vec2.up);
        if(lt) lt.forceOpen(vec2.right);
        if(rt) rt.forceOpen(vec2.left);
        break;
      case tile.type_Ball:
        this.destroy();
        ballfall = false;
        spawnBall(this.pos);
        break;
      case tile.type_Bomb:
        this.detonate();
        break;
    }
  }
  destroy(){
	  //removes the tile from the board and leaves behind a poof effect
    effects.push(effect.poof(this.pos.toCoordPos().add(tilecenter)));
    tiles[this.pos.x][this.pos.y] = null;
    if(this.type != 17)
      tileFallHeight[this.pos.x] = Math.max(this.pos.y, tileFallHeight[this.pos.x]);
  }
  startFall(){
	  //this is called when a tile below this tile is destroyed and this till needs to fall down
	  //it flags the tile for falling by removing it from the board and temporarily putting it in
	  //the `fallingTiles` array
	  //and then all tiles in the `fallingTiles` array will be animated to fall down
    fallingTiles.push(this);
    tiles[this.pos.x][this.pos.y] = null;
  }
  checkEndFall(index){
	  //checks to see if the tile is done falling
    var donefalling = false;
    var bpos = this.pos.add(vec2.down);
    if(bpos.getTile())
      donefalling = true;
    if(bpos.y >= boardsize.y)
      donefalling = true;
    if(donefalling){
      fallingTiles.splice(index, 1);
      tiles[this.pos.x][this.pos.y] = this;
      this.set();
    }
    return donefalling;
  }
  isAlone(){
	  //returns true if there is no tiles around this tile
    return (
      (new vec2(this.pos.x, this.pos.y - 1).getTile() === null || new vec2(this.pos.x, this.pos.y - 1).getTile().type <= -1) &&
      (new vec2(this.pos.x, this.pos.y + 1).getTile() === null || new vec2(this.pos.x, this.pos.y + 1).getTile().type <= -1) &&
      (new vec2(this.pos.x + 1, this.pos.y).getTile() === null || new vec2(this.pos.x + 1, this.pos.y).getTile().type <= -1) &&
      (new vec2(this.pos.x - 1, this.pos.y).getTile() === null || new vec2(this.pos.x - 1, this.pos.y).getTile().type <= -1) );
  }

  getSpriteRect(){
	  //returns the sprite's position and width/height on the spritesheet
    return tile.typeSpriteRect(this.type);
  }
  getRotatedType(){
	  //returns the value of the type of tile when it is rotated ccw
	  //tiles don't actually "rotate", they just transform into different type tiles
    return tile.typeRotate(this.type);
  }
  forceOpen(dir){
	  //forces a specified direction on this tile to be open by transforming it into
	  //a completely different tile type
    this.type = tile.typeForceOpen(this.type, dir)
    if(!vec2.containsVec(this.openEnds, dir))
      this.openEnds.push(dir);
  }
  explode(){
	  //explodes and tags all the tiles around it
    effects.push(effect.boom(this.pos.toCoordPos().add(tilecenter)));
    game.playSound(sfx.explosion);
    
    var tt = [];
    tt.push(this.pos.add(new vec2(-1, -1)).getTile());
    tt.push(this.pos.add(new vec2(0, -1)).getTile());
    tt.push(this.pos.add(new vec2(1, -1)).getTile());
    tt.push(this.pos.add(new vec2(-1, 0)).getTile());
    tt.push(this.pos.add(new vec2(1, 0)).getTile());
    tt.push(this.pos.add(new vec2(-1, 1)).getTile());
    tt.push(this.pos.add(new vec2(0, 1)).getTile());
    tt.push(this.pos.add(new vec2(1, 1)).getTile());
    for(var i in tt){
      if(tt[i]){
        if(tt[i].type === tile.type_Bomb)
          tt[i].detonate();
        else if(tt[i].type >= 0)
          tt[i].tag();
      }
    }
  }
  detonate(){
	  //explodes and detonates all the tiles around it.
    effects.push(effect.boom(this.pos.toCoordPos().add(tilecenter)));
    game.playSound(sfx.explosion);

    this.destroy();
    var bt = [
      this.pos.add(new vec2(-1, -1)).getTile(),
      this.pos.add(new vec2(0, -1)).getTile(),
      this.pos.add(new vec2(1, -1)).getTile(),
      this.pos.add(new vec2(-1, 0)).getTile(),
      this.pos.add(new vec2(1, 0)).getTile(),
      this.pos.add(new vec2(-1, 1)).getTile(),
      this.pos.add(new vec2(0, 1)).getTile(),
      this.pos.add(new vec2(1, 1)).getTile(),
    ];
    for(var i in bt){
      if(bt[i]){
        if(bt[i].type === tile.type_Bomb)
          bt[i].detonate();
        else if(bt[i].type >= 0)
          bt[i].destroy();
      }
    }

    if(this.powered)
      detonateBombs();
    
    if(balls.length <= 0)
      checkFallingTiles();
  }
  interactBall(balltarget){
	  //this is called when a ball travels through this tile
	  //param 'balltarget' - the ball that passes through
    balltarget.interacted.push(this.pos);
    switch(this.type){
      default: break;
      case 16:
        balltarget.moveDir = new vec2();
        balltarget.speed = 5.25;
        balltarget.pause();
        addScore(250, this.pos);
        break;
      case tile.type_Bomb:
        balltarget.setToDestroy();
        this.detonate();
        addScore(50, this.pos);
        break;
    }
    if(this.powered){
      this.explode();
      addScore(100, this.pos);
      this.powered = false;
    }
  }

  get drawimg(){
	  //gets the image of this tile to be drawn
    if(!this.tagged)
      return graphics.tubes;
    return graphics.tubes_black;
  }
  draw(ctx, pos){
	  //renders this specific tile instance at the specified board position
    var sprt = this.getSpriteRect();
    var spos = pos.toCoordPos().rounded();
	spos.applyCanvasStretch();
    if(this.powered)
      ctx.fillStyle = 'rgba(75, 75, 0, 0.5)';
    else
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(spos.x, spos.y, tilesize * adjustment.x, tilesize * adjustment.y);
    ctx.drawImage(this.drawimg, sprt.x, sprt.y, 32, 32, spos.x, spos.y, tilesize * adjustment.x, tilesize * adjustment.y);
  }
  drawActual(ctx, pos, background = true){
	  //renders this tile at the specified pixel position
    var sprt = this.getSpriteRect();
    var spos = pos.rounded();
	spos.applyCanvasStretch();
    if(background){
      if(this.powered)
        ctx.fillStyle = 'rgba(75, 75, 0, 0.5)';
      else
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(spos.x, spos.y, tilesize * adjustment.x, tilesize * adjustment.y);
    }
    ctx.drawImage(this.drawimg, sprt.x, sprt.y, 32, 32, spos.x, spos.y, tilesize * adjustment.x, tilesize * adjustment.y);
  }
  
  static declareStatic(){
	  //declares the static members of the `tile` class
    tile.fallProgress = 0;
  }
  static drawTileBG(ctx){
	  //draws the background behind the tiles
    for(var x = tiles.length - 1; x >= 0; x--){
      for(var y = tiles[x].length - 1; y >= 0; y--){
        var cpos = new vec2(x,y).toCoordPos();
		cpos.applyCanvasStretch()
        ctx.drawImage(graphics.tile, cpos.x, cpos.y, tilesize * adjustment.x, tilesize * adjustment.y);
      }
    }
  }
  
  static typeOpenEnds(type = 0){
    switch(type){
      // straight pieces
      case 0: return [vec2.right, vec2.left];
      case 1: return [vec2.down, vec2.up];
      case 2: return [vec2.right, vec2.left];
      case 3: return [vec2.down, vec2.up];
      case 4: return [vec2.right, vec2.left];
      case 5: return [vec2.down, vec2.up];
      case 6: return [vec2.right, vec2.left];
      case 7: return [vec2.down, vec2.up];
      // elbow peices
      case 8: return [vec2.left, vec2.down];
      case 9: return [vec2.right, vec2.down];
      case 10: return [vec2.left, vec2.up];
      case 11: return [vec2.right, vec2.up];
      // T-junction peices
      case 12: return [vec2.right, vec2.left, vec2.down];
      case 13: return [vec2.right, vec2.left, vec2.up];
      case 14: return [vec2.down, vec2.up, vec2.left];
      case 15: return [vec2.down, vec2.up, vec2.right];
      // quad
      case 16: return [vec2.down, vec2.up, vec2.left, vec2.right];
      // bomb
      case 18: return [vec2.down, vec2.up, vec2.left, vec2.right];
    }
    return [];
  }
  static typeSpriteRect(type = 0){
    switch(type){
      // straight pieces
      case 0: return new vec2(0, 0);
      case 1: return new vec2(32, 0);
      case 2: return new vec2(64, 0);
      case 3: return new vec2(96, 0);
      case 4: return new vec2(0, 32);
      case 5: return new vec2(32, 32);
      case 6: return new vec2(64, 32);
      case 7: return new vec2(96, 32);
      // elbow peices
      case 8: return new vec2(0, 64);
      case 9: return new vec2(32, 64);
      case 10: return new vec2(64, 64);
      case 11: return new vec2(96, 64);
      // T-junction peices
      case 12: return new vec2(0, 96);
      case 13: return new vec2(32, 96);
      case 14: return new vec2(64, 96);
      case 15: return new vec2(96, 96);
      // quad
      case 16: return new vec2(0, 128);
      // ball
      case 17: return new vec2(32, 128);
      // bomb
      case 18: return new vec2(64, 128);
    }
  }
  static typeRotate(type = 0){
    switch(type){
      // straight pieces
      case 0: return 1;
      case 1: return 0;
      case 2: return 3;
      case 3: return 2;
      case 4: return 7;
      case 5: return 6;
      case 6: return 4;
      case 7: return 5;
      // elbow peices
      case 8: return 9;
      case 9: return 11;
      case 10: return 8;
      case 11: return 10;
      // T-junction
      case 12: return 15;
      case 13: return 14;
      case 14: return 12;
      case 15: return 13;
      // quad
      case 16: return 16;
      // ball
      case 17: return 17;
      // bomb
      case 18: return 18;
    }
  }
  static typeForceOpen(type = 0, dir){
    if(dir.equals(vec2.up))
      switch(type){
        // straight pieces
        case 0: return 13;
        case 1: return 1;
        case 2: return 13;
        case 3: return 3;
        case 4: return 13;
        case 5: return 13;
        case 6: return 6;
        case 7: return 7;
        // elbow peices
        case 8: return 14;
        case 9: return 15;
        case 10: return 10;
        case 11: return 11;
        // T-junction
        case 12: return 16;
        case 13: return 13;
        case 14: return 14;
        case 15: return 15;
      }
    if(dir.equals(vec2.down))
      switch(type){
        // straight pieces
        case 0: return 12;
        case 1: return 1;
        case 2: return 12;
        case 3: return 3;
        case 4: return 12;
        case 5: return 12;
        case 6: return 6;
        case 7: return 7;
        // elbow peices
        case 8: return 8;
        case 9: return 9;
        case 10: return 14;
        case 11: return 15;
        // T-junction
        case 12: return 12;
        case 13: return 16;
        case 14: return 14;
        case 15: return 15;
      }
    if(dir.equals(vec2.left))
      switch(type){
        // straight pieces
        case 0: return 0;
        case 1: return 14;
        case 2: return 2;
        case 3: return 14;
        case 4: return 4;
        case 5: return 5;
        case 6: return 14;
        case 7: return 14;
        // elbow peices
        case 8: return 8;
        case 9: return 12;
        case 10: return 10;
        case 11: return 13;
        // T-junction
        case 12: return 12;
        case 13: return 13;
        case 14: return 14;
        case 15: return 16;
      }
    if(dir.equals(vec2.right))
      switch(type){
        // straight pieces
        case 0: return 0;
        case 1: return 15;
        case 2: return 2;
        case 3: return 15;
        case 4: return 4;
        case 5: return 5;
        case 6: return 15;
        case 7: return 15;
        // elbow peices
        case 8: return 12;
        case 9: return 9;
        case 10: return 13;
        case 11: return 11;
        // T-junction
        case 12: return 12;
        case 13: return 13;
        case 14: return 16;
        case 15: return 15;
      }
      return type;
  }
  
  static get closed(){
    var r = new tile();
    r.openEnds = [];
    r.type = -1;
    return r;
  }
  static get tube_Horizontal(){
    return new tile(0);
  }
  static get tube_Vertical(){
    return new tile(1);
  }
  static get type_Horizontal(){
    return 0;
  }
  static get type_Vertical(){
    return 1;
  }
  static get type_Elbow_bl(){
    return 8;
  }
  static get type_Elbow_br(){
    return 9;
  }
  static get type_Elbow_tl(){
    return 10;
  }
  static get type_Elbow_tr(){
    return 11;
  }
  static get type_T_hb(){
    return 12;
  }
  static get type_T_ht(){
    return 13;
  }
  static get type_T_vl(){
    return 14;
  }
  static get type_T_vr(){
    return 15;
  }
  static get type_Quad(){
    return 16;
  }
  static get type_Ball(){
    return 17;
  }
  static get type_Bomb(){
    return 18;
  }
}
tile.declareStatic();
class ball{
	// data type containg methods and information regarding a dynamic ball instance
	// NOTE: seperate from the 'ball' type of tile
  constructor(){
    this.speed = 1;
    this.pos = new vec2();
    this.nextPos = null;
    this.moveDir = vec2.down;
    this.prefHDir = 0;
    this.rollback = true;
    this.paused = false;
    this.firstMove = true;
    this.interacted = [];
  }
  get colPos(){
	  //gets the collision point on the ball
    return this.pos.add(tilecenter);
  }

  getOpenDirections(){
	  //returns the directions of the ball that are not obstructed
    var r = [];
    var ct = this.colPos.toTilePos().getTile();

    var ut = this.colPos.toTilePos().add(vec2.up).getTile();
    if (ut != null){
      if(vec2.containsVec(ut.openEnds, vec2.down))
        if(ct){
          if(vec2.containsVec(ct.openEnds, vec2.up))
            r.push(vec2.up);
        } else r.push(vec2.up)
    }
    else if(ct){
      if(vec2.containsVec(ct.openEnds, vec2.up))
        r.push(vec2.up);
    } else r.push(vec2.up)

    var lt = this.colPos.toTilePos().add(vec2.left).getTile();
    if(lt != null){
      if(vec2.containsVec(lt.openEnds, vec2.right))
        if(ct){
          if(vec2.containsVec(ct.openEnds, vec2.left))
            r.push(vec2.left);
        } else r.push(vec2.left)
    }
    else if(ct){
      if(vec2.containsVec(ct.openEnds, vec2.left))
        r.push(vec2.left);
    } else r.push(vec2.left)

    var rt = this.colPos.toTilePos().add(vec2.right).getTile();
    if(rt != null){
      if(vec2.containsVec(rt.openEnds, vec2.left))
        if(ct){
          if(vec2.containsVec(ct.openEnds, vec2.right))
            r.push(vec2.right);
        } else r.push(vec2.right)
    }
    else if(ct){
      if(vec2.containsVec(ct.openEnds, vec2.right))
        r.push(vec2.right);
    } else r.push(vec2.right)

    var bt = this.colPos.toTilePos().add(vec2.down).getTile();
    if(bt != null){
      if(vec2.containsVec(bt.openEnds, vec2.up))
        if(ct){
          if(vec2.containsVec(ct.openEnds, vec2.down))
            r.push(vec2.down);
        } else r.push(vec2.down)
    }
    else if(ct){
      if(vec2.containsVec(ct.openEnds, vec2.down))
        r.push(vec2.down);
    } else r.push(vec2.down)

    return r;
  }
  getPossibleDirections(){
	  //returns all of the possible directions that the ball can move in
    var pm = this.getOpenDirections();
    for (var i = pm.length - 1; i >= 0; i--) {
      if(pm[i].equals(this.moveDir.multiply(-1))){
        pm.splice(i, 1);
        continue;
      }
      if(pm[i].equals(vec2.up))
        if(this.speed <= 1){
          pm.splice(i, 1);
          continue;
        }
    }
    return pm;
  }
  outOfBounds(){
	  //returns true if the ball is out of bounds
    var p = this.colPos.toTilePos();
    return (
      p.x < 0 || p.y < 0 ||
      p.x >= boardsize.x ||
      p.y >= boardsize.y );
  }
  destroy(index){
	  //removes the ball from the world and destroys all of the tiles it tagged
    balls.splice(index, 1);
    checkDestroyTagged();
  }
  destroyCheck(index){
	  //checks to see if the ball should be romoved from the world
    if(this.outOfBounds())
      this.destroy(index);
  }
  setToDestroy(){
	  //sets the positions of the ball to be out of bounds so that it is destroyed 
	  //during the next step
    if(this.pos.equals(new vec2(-tilesize)))
      return;
  
	//creates poof effect at the ball's current location and then moves it out of bounds
    effects.push(effect.poof(this.colPos));
    this.pos = new vec2(-tilesize);
  }

  roll(ts){
	  //ball travels to next pipe and calculates where it will go next
    if(this.paused){
      return;
    }

    if(!this.nextPos)
      this.chooseNextPos();
    else
      this.moveToNextPos(ts);

    var curtile = this.colPos.toTilePos().getTile();
    if(curtile)
      if(curtile.type >= 0)
      curtile.tag();
  }
  chooseNextPos(){
	  //calculates where the ball's next movement should be to
    if(!this.firstMove)
      if(this.colPos.toTilePos().getTile() == null)
        this.setToDestroy();

    var pm = this.getOpenDirections();
    var rbc = false;
    var pd = this.getPossibleDirections();
    this.firstMove = false;

    if(vec2.containsVec(pd, vec2.down)){
      if(this.moveDir.equals(vec2.up)){
        if(this.speed <= 1)
          this.direct(vec2.down);
        else
          this.direct(vec2.up);
      }
      else
        this.direct(vec2.down);
    }
    else if(vec2.containsVec(pd, this.moveDir))
      this.direct(this.moveDir);
    else if(pd.length > 1){
      this.pause();
      return;
    }
    else if(pd.length === 1)
      this.direct(pd[0])
    else{
      if(this.moveDir.equals(vec2.down))
        this.speed -= .5;
      if(this.speed < 1) this.setToDestroy();
      else this.direct(this.moveDir.multiply(-1));
    }
    
    if(this.speed < 0.25)
      this.speed = 0.25;
    if(!rbc)
      this.rollback = true;
    game.playSound(sfx.roll);
  }
  moveToNextPos(ts){
	  //moves towards the ball's destination based on the animation speed
    var mdist = (100 / Math.max(game.settings.animStepRate, 1)) * (2 * ts * Math.max(Math.min(this.speed, 5.25), 1));
    if(this.colPos.distance(this.nextPos.toCoordPos().add(tilecenter)) <= mdist){
      this.pos = this.nextPos.toCoordPos();
      this.nextPos = null;

      var curtile = this.colPos.toTilePos().getTile();
      if(curtile)
        if(!vec2.containsVec(this.interacted, curtile.pos))
          curtile.interactBall(this);
    }
    else{
      var mdir = this.colPos.direction(this.nextPos.toCoordPos().add(tilecenter));
      var pchng = vec2.fromAng(mdir, mdist);
      this.pos = this.pos.add(pchng);
    }
  }
  direct(dir){
	  //points the ball in a specified direction, eg: vec2.left
    this.moveDir = dir;
    this.nextPos = this.colPos.toTilePos().add(dir);
    if(dir.equals(vec2.right) || dir.equals(vec2.left))
      this.speed -= 0.25;
    else if(dir.equals(vec2.down))
      this.speed += 1;
    else 
      this.speed -= 1.25;
  }
  pause(){
	  //pauses and gives the user a choice in which direction to travel
    this.paused = true;
    game.playSound(sfx.ballPause);
  }
  drawDirectionChoice(ctx){
	  //draws all the possible directions that this ball can move as flashing arrow indicators
    var pd = this.getPossibleDirections();
    for(var i in pd){
      var spos = this.colPos.add(pd[i].multiply(16));
      new arrow(pd[i]).draw(ctx, spos);
    }
  }
  notifyDirection(dir){
	  //when the user selects a direction for the ball to follow when paused
    if(this.paused){
      if(vec2.containsVec(this.getPossibleDirections(), dir)){
        this.paused = false;
        this.direct(dir);
		    game.playSound(sfx.ballDirect);
      }
    }
    else
      this.controlDir = null;
  }
  draw(ctx){
	  //render's the ball on the provided canvasContext
    var spos = this.pos.rounded();
	spos.applyCanvasStretch();
    ctx.drawImage(graphics.tubes, 32, 128, tilesize, tilesize, spos.x, spos.y, tilesize * adjustment.x, tilesize * adjustment.y);
    if(this.paused)
      this.drawDirectionChoice(ctx);
  }
}
class fallpiece{
	//datatype that contains methods and information that define a falling piece
	//that the user can control
  constructor(){
	  //member 'tiles' - the tiles that this piece is made up of
	  //member 'realPos' - the row/column of the tile that the piece's origin lies on
	  //member 'visualPos' - the pixel position that the piece is drawn at, allows for
	  //	smoother movement animations
	  //member 'modularRotation' - if true, the origin will always be at the top left of this piece
    this.tiles = [];
    this.realPos = new vec2(Math.floor(boardsize.x / 2), -1);
    this.visualPos = this.realPos.toCoordPos();
    this.modularRotation = false;
    this.bumpDown();
  }

  bumpDown(){
	  //moves the piece downward or sets it in place if it can't move downward
    if(this.onGround()){
      this.set();
      return;
    }
    this.realPos.y += 1;
    if(!this.empty())
		game.playSound(sfx.move);
  }
  drop(){
	  //drops the piece down until it hits the ground
    while(!this.empty())
      this.bumpDown();
  }
  bumpLeft(){
	  //moves the piece one tile to the left if possible
    var lp = this.realPos.copy();
    this.realPos.x -= 1;
    this.moveCheck(lp);
    if(!this.empty())
		game.playSound(sfx.move);
  }
  bumpRight(){
	  //moves the piece one tile to the right if possible
    var lp = this.realPos.copy();
    this.realPos.x += 1;
    this.moveCheck(lp);
    if(!this.empty())
		game.playSound(sfx.move);
  }
  moveCheck(lastpos){
	  //if it is overlapping with another tile, this piece with revert back to the
	  //previous position provided
    for(var i = this.tiles.length - 1; i >= 0; i--){
      var rp = this.realPos.add(this.tiles[i].pos);
      if(rp.x < 0){
        this.realPos = lastpos;
        return;
      }
      if(rp.x >= boardsize.x){
        this.realPos = lastpos;
        return;
      }
      if(rp.getTile())
        this.realPos = lastpos;
    }
  }
  rotate(dir = 1, check = true){
	  //rotate's the piece if possible
    if(dir === -1){
      for (var i = 3; i > 0; i--)
        this.rotate(1, false);
      if(check) this.rotCheck(-1);
      return;
    }
    var stl = new vec2(-1);
    var tl = new vec2();
    for (var i = this.tiles.length - 1; i >= 0; i--) {
      this.tiles[i].pos = new vec2(this.tiles[i].pos.y, -this.tiles[i].pos.x);
      this.tiles[i].type = this.tiles[i].getRotatedType();
      this.tiles[i].renew();
      tl.x = Math.min(this.tiles[i].pos.x, tl.x);
      tl.y = Math.min(this.tiles[i].pos.y, tl.y);
    }
    if(this.modularRotation){
      for(var i in this.tiles)
        this.tiles[i].pos = this.tiles[i].pos.add(stl.add(tl.multiply(-1)));
    }
    if(check) {
      this.rotCheck(1);
      if(!this.empty())
		  game.playSound(sfx.move);
    }
  }
  rotCheck(dir = 1){
	  //if it is overlapping with another tile, it rotates back the other direction
    for(var i = this.tiles.length - 1; i >= 0; i--){
      var rp = this.realPos.add(this.tiles[i].pos);
      if(rp.x < 0){
        this.rotate(dir * -1, false);
        return;
      }
      if(rp.x >= boardsize.x){
        this.rotate(dir * -1, false);
        return;
      }
      if(rp.getTile())
        this.rotate(dir * -1, false);
    }
  }
  overlapsTile(){
	  //returns true if this piece overlaps any existing tile
    for (var i = this.tiles.length - 1; i >= 0; i--) {
      var rp = this.realPos.add(this.tiles[i].pos);
      if(rp.getTile())
        return true;
    }
    return false;
  }
  containsType(type){
	  //returns true if this piece contains a specified tile type
    for(var i in this.tiles)
      if(this.tiles[i].type === type)
        return true;
    return false;
  }

  set(){
	  //sets the piece in place
    for(var i = this.tiles.length - 1; i >= 0; i--){
      var rp = this.tiles[i].pos.add(this.realPos);
      tiles[rp.x][rp.y] = this.tiles[i];
      tiles[rp.x][rp.y].pos = rp;
      tiles[rp.x][rp.y].set();
      if(checkColumnFull(rp.y))
        pierceColumn(rp.y);
    }
	 game.playSound(sfx.snap);
    this.tiles = [];
  }
  empty(){
	  //returns true if this piece has nothing in it
    return this.tiles.length <= 0;
  }

  onGround(){
	  //returns true if 'bumpDown()' would result in the piece being set in place
    for(var i = this.tiles.length - 1; i >= 0; i--){
      var rp = this.tiles[i].pos.add(this.realPos);
      if(rp.y >= boardsize.y - 1)
        return true;
      if(tiles[rp.x][rp.y + 1])
        return true;
    }
    return false;
  }

  draw(ctx){
	  //handles the rendering for this instance
    this.visualPos = this.visualPos.add(this.realPos.toCoordPos()).multiply(0.5);
    for(var i = this.tiles.length - 1; i >= 0; i--){
      var spos = this.visualPos.add(this.tiles[i].pos.toExpandedPos()).rounded();
	  //spos.applyCanvasStretch();
      this.tiles[i].drawActual(ctx, spos);
    }
  }
  drawCentered(ctx, pos, bg = true){
	  //renders the piece centered around a specified position, used for HUD
    var spos = new vec2();
    var l = 0;
    var r = 32;
    var t = 0;
    var b = 32;
    for(var i in this.tiles){
      l = Math.min(l, this.tiles[i].pos.x * tilesize);
      r = Math.max(r, this.tiles[i].pos.x * tilesize + tilesize);
      t = Math.min(t, this.tiles[i].pos.y * tilesize);
      b = Math.max(b, this.tiles[i].pos.y * tilesize + tilesize);
    }
    spos = new vec2(r - l, b - t).multiply(.5).add(new vec2(l, t));
    spos = pos.add(spos.multiply(-1));
    for(var i in this.tiles){
      var p = spos.add(this.tiles[i].pos.toExpandedPos()).rounded();
      this.tiles[i].drawActual(ctx, p, bg);
    }
  }
}
class fallpiece_preset{
	//datatype that holds data and methods for creating a `fallpiece` based
	//on a structure that you define
  constructor(){
	  //member 'tilerolls' - all the possible tile types and positions that the
	  //	created 'fallpiece' object is made up of
	  //member 'modularRotation' - if true, the top-left tile of the fallpiece 
	  //	will always be the orgin on which it pivots
    this.tileRolls = [];
    this.modularRotation = false;
  }

  createPiece(){
	  //constructs a `fallpiece` object based on the preset's structure
    var p = new fallpiece();
    for(var t = this.tileRolls.length - 1; t >= 0; t--){
      var rl = this.tileRolls[t].length;
      var tt = new tile(weightedRandomSelection(this.tileRolls[t][0]), this.tileRolls[t][1]);
      p.tiles.push(tt);
    }
    p.modularRotation = this.modularRotation;
    return p;
  }
  
  static getRandomPiece(presetlist){
	  //returns a random piece based off the given preset list. See `weightedRandomSelection()`
    return weightedRandomSelection(presetlist).createPiece();
  }

  //static presets used for specific lessons in the tutorial
  static get piece_tut1(){
    var r = new fallpiece_preset();
    r.tileRolls = [
      [[[tile.type_Horizontal, 1]], new vec2(0, 0)],
      [[[tile.type_Horizontal, 2]], new vec2(-1, 0)],
      [[[tile.type_Elbow_tl, 2]], new vec2(1, 0)],
      [[[tile.type_Vertical, 1]], new vec2(1, -1)]
      ];
    return r;
  }
  static get piece_tut2(){
    var r = new fallpiece_preset();
    r.tileRolls = [
    [[[tile.type_Elbow_br, 1]], new vec2(-1, -1)],
    [[[tile.type_Elbow_bl, 3]], new vec2(0, -1)],
    [[[tile.type_Elbow_tr, 3]], new vec2(0, 0)],
    [[[tile.type_Elbow_tl, 1]], new vec2(1, 0)],
    ];
    return r;
  }

  //static presets for general purpose
  static get piece_L(){
    var r = new fallpiece_preset();
    r.tileRolls = [
      [[[tile.type_Horizontal, 1]], new vec2(0, 0)],
      [[[tile.type_Horizontal, 2], [tile.type_Elbow_br, 1], [tile.type_Elbow_tr, 1]], new vec2(-1, 0)],
      [[[tile.type_Elbow_tl, 2], [tile.type_T_ht, 1], [tile.type_T_vl, 1]], new vec2(1, 0)],
      [[[tile.type_Vertical, 1], [tile.type_T_hb, 1]], new vec2(1, -1)]
      ];
    return r;
  }
  static get piece_L2(){
    var r = new fallpiece_preset();
    r.tileRolls = [
      [[[tile.type_Horizontal, 1]], new vec2(0, 0)],
      [[[tile.type_Horizontal, 2], [tile.type_Elbow_bl, 1], [tile.type_Elbow_tl, 1]], new vec2(1, 0)],
      [[[tile.type_Elbow_tr, 2], [tile.type_T_ht, 1], [tile.type_T_vr, 1]], new vec2(-1, 0)],
      [[[tile.type_Vertical, 1], [tile.type_T_hb, 1]], new vec2(-1, -1)]
      ];
    return r;
  }
  static get piece_T(){
    var r = new fallpiece_preset();
    r.tileRolls = [
      [[[tile.type_T_ht, 1], [tile.type_Quad, 0.2]], new vec2(0, 0)],
      [[[tile.type_Horizontal, 2], [tile.type_Elbow_br, 1], [tile.type_T_ht, 1], [tile.type_T_hb, 1]], new vec2(-1, 0)],
      [[[tile.type_Horizontal, 2], [tile.type_Elbow_bl, 1], [tile.type_T_ht, 1], [tile.type_T_hb, 1]], new vec2(1, 0)],
      [[[tile.type_Vertical, 1], [tile.type_T_hb, 1]], new vec2(0, -1)]
      ];
    return r;
  }
  static get piece_Z(){
    var r = new fallpiece_preset();
    r.tileRolls = [
    [[[tile.type_Horizontal, 1], [tile.type_Elbow_br, 1], [tile.type_Elbow_tr, 1]], new vec2(-1, -1)],
    [[[tile.type_Elbow_bl, 3], [tile.type_T_hb, 1], [tile.type_T_vl, 1]], new vec2(0, -1)],
    [[[tile.type_Elbow_tr, 3], [tile.type_T_ht, 1], [tile.type_T_vr, 1]], new vec2(0, 0)],
    [[[tile.type_Horizontal, 1], [tile.type_Elbow_bl, 1], [tile.type_Elbow_tl, 1]], new vec2(1, 0)],
    ];
    return r;
  }
  static get piece_Z2(){
    var r = new fallpiece_preset();
    r.tileRolls = [
    [[[tile.type_Horizontal, 1], [tile.type_Elbow_br, 1], [tile.type_Elbow_tr, 1]], new vec2(-1, 0)],
    [[[tile.type_Elbow_tl, 3], [tile.type_T_ht, 1], [tile.type_T_vl, 1]], new vec2(0, 0)],
    [[[tile.type_Elbow_br, 3], [tile.type_T_hb, 1], [tile.type_T_vr, 1]], new vec2(0, -1)],
    [[[tile.type_Horizontal, 1], [tile.type_Elbow_bl, 1], [tile.type_Elbow_tl, 1]], new vec2(1, -1)]
    ];
    return r;
  }
  static get piece_square(){
    var r = new fallpiece_preset();
    r.tileRolls = [
    [[[tile.type_Elbow_br, 1], [tile.type_T_hb, 1], [tile.type_T_vr, 1]], new vec2(-1, -1)],
    [[[tile.type_Elbow_bl, 1], [tile.type_Quad, 0.5]], new vec2(0, -1)],
    [[[tile.type_Elbow_tr, 1], [tile.type_Quad, 0.5]], new vec2(-1, 0)],
    [[[tile.type_Elbow_tl, 1], [tile.type_T_ht, 1], [tile.type_T_vl, 1]], new vec2(0, 0)]
    ];
    r.modularRotation = true;
    return r;
  }
  static get piece_long(){
    var r = new fallpiece_preset();
    r.tileRolls = [
    [[[tile.type_Horizontal, 5], [tile.type_T_vr, 2], [tile.type_Elbow_br, 1], [tile.type_Elbow_tr, 1]], new vec2(-2, 0)],
    [[[tile.type_Horizontal, 3], [tile.type_T_hr, 1], [tile.type_T_hl, 1]], new vec2(-1, 0)],
    [[[tile.type_Horizontal, 3], [tile.type_T_hr, 1], [tile.type_T_hl, 1]], new vec2(0, 0)],
    [[[tile.type_T_vl, 1], [tile.type_Elbow_bl, 1], [tile.type_Elbow_tl, 1], [tile.type_Quad, 0.2]], new vec2(1, 0)],
    ];
    return r;
  }
  static get piece_bonus(){
    var r = new fallpiece_preset();
    r.tileRolls = [
    [[[tile.type_Quad, 1]], new vec2(0)],
    ];
    return r;
  }
  static get piece_ball(){
    var r = new fallpiece_preset();
    r.tileRolls = [
      [[[tile.type_Ball, 1]], new vec2(0, 0)]
    ];
    return r;
  }
  static get piece_bomb(){
    var r = new fallpiece_preset();
    r.tileRolls = [
      [[[tile.type_Bomb, 1]], new vec2(0, 0)]
    ];
    return r;
  }
}

function weightedRandomSelection(weightedlist){
	//returns an item from the weighted list randomly
	//syntax: [[item, weight], [item, weight]]
  var totalweight = 0;
    var cdf = [0];
    for (var i = 0; i < weightedlist.length; i++) {
      totalweight += weightedlist[i][1];
      cdf.push(cdf[cdf.length-1] + weightedlist[i][1]);
    }
    cdf.splice(0, 1);
    cdf.push(totalweight);
    var randsel = Math.random() * totalweight;
    var i = 0;
    while(cdf[i] < randsel)
      i++;
    return weightedlist[i][0];
}