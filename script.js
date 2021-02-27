function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

class Game {
  constructor() {
    this.width = 10;
    this.length = 10;
    this.box_list = [];
    this.snake_made = false;
    this.food_made = false;
    this.startingX = null;
    this.startingY = null;
    this.foodX = null;
    this.foodY = null;
    this.player = null;
  }
  
  setup(){
    var div_el;
    var div_row;
    var game_field = document.getElementById("game_field"); 
    
    for (var l=0; l<this.length; l++){
      //Generate Row
      div_row = document.createElement('div');
      div_row.className = 'row';
      for (var w=0; w<this.width; w++){
        //Generate column
        div_el = document.createElement('div');
        var rand_int = getRandomInt(33)
        if (rand_int==1 && this.snake_made==false){
          div_el.className = 'snake';
          this.snake_made = true;
        }
        else if (rand_int==2 && this.food_made==false){
          div_el.className = 'food';
          this.food_made = true;
        }
        else if (l == this.length - 1 && this.snake_made==false){
          div_el.className = 'snake';
          this.snake_made = true;
        }
        else if (l==this.length - 2 && this.food_made == false){
          div_el.className = 'food';
          this.food_made = true;
        }
        else{
          div_el.className = 'ground';
        }

        //Note down food and snake coordinates
        if (div_el.className=='food'){
          this.foodX = l;
          this.foodY = w;
        }
        else if (div_el.className=='snake'){
          this.startingX = l;
          this.startingY = w;
        }

        //Add to row node
        div_row.appendChild(div_el);
      }
      //Add to game_field node
      this.box_list.push(div_row);
      game_field.appendChild(div_row);
    }

    this.player = new Player(this.startingX, this.startingY, this);
    //this.player.add_tail(new Tail(this.player.x-1, this.player.y-1, this.player));
  }

  draw() {
    for (var l=0; l<this.length; l++){
      for (var w=0; w<this.width; w++){
        this.box_list[l].children[w].className = 'ground';
      }
    }
    this.box_list[this.foodX].children[this.foodY].className = 'food';
    this.box_list[this.player.x].children[this.player.y].className = 'snake';
    var player_tail = this.player.tail;
    while (player_tail !== null){
      this.box_list[player_tail.x].children[player_tail.y].className = 'snake';
      player_tail = player_tail.tail;
    }
  }
  
  make_food(){
    this.foodX = getRandomInt(this.length);
    this.foodY = getRandomInt(this.width);
    while (this.is_snake(this.foodX, this.foodY)){
      this.foodX = getRandomInt(this.length);
      this.foodY = getRandomInt(this.width);
    }
    
      //draw
      //this.box_list[this.foodX].children[this.foodY].className = 'food';
  }

  is_food(x, y){
    if (this.foodX == x && this.foodY == y){
      this.make_food();
      return true;
    }
    return false;
  }

  is_snake(x, y){
    /** This is just itself why would this work?
    if (this.player.x == x && this.player.y == y){
      return true;
    }
    **/
    var next = this.player.tail;
    while (next !== null) {
      if (next.x == x && next.y == y){
        return true;
      }
      next = next.tail;
    }
    return false;
  }

}

class Tail {
  constructor(x, y, head, seg) {
    this.x = x;
    this.y = y;
    this.last_x = x;
    this.last_y = y;
    this.head = head;
    this.tail = null;
    this.segment = seg;
  }

  move(){
    this.last_x=this.x;
    this.last_y=this.y;
    this.x = this.head.last_x;
    this.y = this.head.last_y;
    if (this.tail !== null){
      this.tail.move();
    }
  }

  add_tail(tail){
    if (this.tail === null){
      this.tail = tail;
      return this.tail;
    }
    else{
      return this.tail.add_tail(tail);
    }
  }
}


class Player extends Tail{
  constructor(snakeX, snakeY, game) {
    super(snakeX, snakeY, null, 1);
    this.length = 0;
    this.tail = null;
    this.tail_last = null;
    this.game = game;
    this.direction_code = 'right';
    this.directions = [1,0];
  }

  move(){    
    this.last_x  = this.x;
    this.last_y = this.y;
    this.x = this.x + this.directions[0];
    this.y = this.y + this.directions[1];
    if (this.x > this.game.length-1){
      this.x = 0;
    }
    if (this.y > this.game.width-1){
      this.y = 0;
    }
    if (this.x < 0){
      this.x = this.game.length-1;
    }
    if (this.y < 0){
      this.y = this.game.width-1;
    }
    if (this.tail !== null){
      this.tail.move();
    }
    if (game.is_food(this.last_x, this.last_y)){
      this.length++;
      document.getElementById("output").textContent = "Score: " + this.length;
      var newtail_x = (this.tail == null ? this.last_x : this.tail_last.last_x);
      var newtail_y = (this.tail == null ? this.last_y : this.tail_last.last_y);
      var new_tail = new Tail(newtail_x, newtail_y, (this.tail_last == null ? this : this.tail_last), this.length);
      this.tail_last = this.add_tail(new_tail);
    }
    //draw
    //this.game.box_list[this.x].children[this.y].className = 'snake';
    return game.is_snake(this.x, this.y);
  }
  
  checkValid(direction){
    let new_x = this.x + direction[0];
    let new_y = this.y + direction[0];
    if (new_x == this.tail.x && new_y == this.tail.y){
      return false; 
    }
    return true;
  }

  left(){
    if (this.checkValid([-1,0])){
      this.directions = [-1,0];
      this.direction_code='left';
    }
  }

  right(){
    if (this.checkValid([1,0])){
      this.directions = [1,0];
      this.direction_code='right';
    }
  }

  up(){
    if (this.checkValid([0,-1])){
      this.directions = [0,-1];
      this.direction_code='up';
    }
  }

  down(){
    if (this.checkValid([0,1])){
      this.directions = [0,1];
      this.direction_code='down';
    }
  }
}
