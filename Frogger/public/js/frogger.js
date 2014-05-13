"use strict";
var WIDTH = 650;
var HEIGHT = 450;
var CELL = 30;
var CAR_SIZE = [50,100];
var LOG_SIZE = [100, 150, 200];
var sprite = new Image();
sprite.src = "js/frogger_sprites.png";

function Board(context){
    
    var self = this;
    var top = CELL;
    var bottom = HEIGHT-CELL*2;
    var left = CELL;
    var right = WIDTH-CELL*2;
    var waterBottom = CELL*6;
    var waterTop = CELL*2;
    
    var interval, timeInterval;
    var timeout = 60;

    var totalTime = 0;
    
    var frogger;
    var cars = new Array();
    var logs = new Array();
    var lilies = new Array();
    
    this.start = function(){
        totalTime=0;
        frogger = new Frogger();
        frogger.startPosition();
        //initialisation des voitures, des rondins et des nenuphars
        for(var i=0;i<5;i++){
            cars[i] = new Array();
            logs[i] = new Array();
            lilies[i] = new Lily(i*137+18,CELL,55);
            var carSize = CAR_SIZE[Math.floor(Math.random()*2)];
            var logSize = LOG_SIZE[Math.floor(Math.random()*3)];
            var carSpace = carSize + (WIDTH-3*carSize)/3;
            var logSpace = logSize + (WIDTH-3*logSize)/3;
            var carSpeed = Math.floor(Math.random()*4+2);
            var logSpeed = Math.floor(Math.random()*4+2);
            for(var j=0;j<3;j++){
                if(i%2==0){
                    cars[i][j] = new Car(j*carSpace,i*CELL+8*CELL,carSize, "left", carSpeed);
                    logs[i][j] = new Log(j*logSpace,i*CELL+2*CELL,logSize, "left", logSpeed);
                }else{
                    cars[i][j] = new Car(j*carSpace,i*CELL+8*CELL,carSize, "right", carSpeed);
                    logs[i][j] = new Log(j*logSpace,i*CELL+2*CELL,logSize, "right", logSpeed);
                }
            }
        }
        window.addEventListener('keydown', onKeyDown, true);
        interval = window.setInterval(update, 40);
        timeInterval = window.setInterval(time, 1000);
        window.setInterval(function(){
           totalTime++;
        }, 1000)
    }
    
    var draw = function(){
        context.clearRect(0, 0, WIDTH, HEIGHT);
        //dessin de la map
        //riviere
        context.fillStyle = "#00F";
        context.fillRect(0, 0, WIDTH, CELL*7);
        //route
        context.fillStyle = "#000";
        context.fillRect(0, waterBottom+2*CELL, WIDTH, CELL*5);
        //zone de vide
        context.drawImage(sprite, 0, 120, 399,32, 0, CELL*7, WIDTH, CELL);
        context.drawImage(sprite, 0, 120, 399,32, 0, bottom, WIDTH, CELL);
        //herbe
        context.drawImage(sprite, 0, 55, 399,52, 0, 0, WIDTH, CELL*2);  
        //temps
        var size = timeout*100/60;
        context.strokeStyle = "#0f0";
        context.strokeRect(440, HEIGHT-20, 100, 10);
        context.fillStyle = "#0f0";
        context.fillRect(440+(100-size), HEIGHT-20, size, 10);
        
        for(var i=0;i<5;i++){
            lilies[i].draw(context);
            for(var j=0;j<3;j++){
                cars[i][j].draw(context);
                logs[i][j].draw(context);
            }
        }
        frogger.draw(context);
    }
    
    var update = function(){
        draw();
        var isDead = null;
        var nbWin = null;
        for(var i=0;i<5;i++){
            //nenuphar !
            if(frogger.x >= lilies[i].x && frogger.x + CELL <= lilies[i].x + lilies[i].w && frogger.y == lilies[i].y){//grenouille sur les nenuphars
                if(lilies[i].froggerOn == true){
                    isDead = true;
                }else{
                    waterLillyCaptured(timeout);

                    isDead = false;
                    lilies[i].froggerOn = true;
                    timeout = 60;
                    frogger.startPosition();
                }
            }
            if(lilies[i].froggerOn){
                nbWin++;
            }
            
            for(var j=0;j<3;j++){
                if(frogger.y <= waterBottom && frogger.y >= waterTop){//grenouille sur les rondins
                    if(frogger.x >= logs[i][j].x && frogger.x + CELL <= logs[i][j].x + logs[i][j].w && frogger.y == logs[i][j].y){
                        isDead = false;
                        if(logs[i][j].direction == "left")
                            frogger.x -= logs[i][j].speed;
                        else
                            frogger.x += logs[i][j].speed;
                    }else if(isDead == null){
                        isDead = true;
                    }
                }//grenouille qui se fait shooter :(
                else if(frogger.x + CELL > cars[i][j].x && frogger.x < cars[i][j].x + cars[i][j].w && frogger.y == cars[i][j].y){
                    isDead = true;
                }
                
                cars[i][j].move();
                logs[i][j].move();
            }
        }
        if(frogger.x < 0 || frogger.x + CELL > WIDTH || isDead == null && frogger.y == CELL){
            isDead = true;
        }
        
        if(isDead){
            dead();
        }else if(nbWin == 5){
            win();
        }
        
    }
    
    var time = function(){
        timeout--;
        if(timeout <= 0)
            dead();
    }
    
    var dead = function(){
        frogger.dead();
        window.clearInterval(interval);
        window.clearInterval(timeInterval);
        var message = "GAME OVER";
        if(frogger.life > 0){
            window.setTimeout(function(){
                interval = window.setInterval(update, 40);
                timeInterval = window.setInterval(time, 1000);
                timeout = 60;
                frogger.startPosition();
            }, 2000);
            message = "YOU LOSE";
        }
        else{
            partyLost(timeout);
        }
        context.fillStyle = "#fff";
        context.font = "50px Arial";
        context.fillText(message, WIDTH/2-100,HEIGHT/2);
    }
    
    var win = function(){
        partyWon(totalTime);
        window.clearInterval(interval);
        window.clearInterval(timeInterval);
        context.fillStyle = "#fff";
        context.font = "50px Arial";
        context.fillText("YOU WIN", WIDTH/2-100,HEIGHT/2);

    }
    
    var onKeyDown = function(e){
        switch(e.keyCode){
            case 37:
                frogger.moveLeft();
                break;
            case 38:
                frogger.moveUp();
                break;
            case 39:
                frogger.moveRight();
                break;
            case 40:
                frogger.moveDown();
                break;
        }
    }
    
}

function Frogger(){
    
    var size = CELL;
    this.x = 0;
    this.y = 0;
    this.life = 3;
    var orientation = "up";
    
    this.draw = function(context){
        switch(orientation){
            case "up":
                context.drawImage(sprite, 10, 367, 26,20, this.x, this.y, CELL, CELL);
                break;
            case "down":
                context.drawImage(sprite, 76, 367, 26,20, this.x, this.y, CELL, CELL);
                break;
            case "left":
                context.drawImage(sprite, 76, 336, 26,22, this.x, this.y, CELL, CELL);
                break;
            case "right":
                context.drawImage(sprite, 10, 335, 26,22, this.x, this.y, CELL, CELL);
                break;
        }
    for(var i=0;i<this.life;i++)
        context.drawImage(sprite, 76, 336, 26,22, i*30, HEIGHT-CELL, CELL, CELL);
    }
    
    this.startPosition = function(){
        this.x = 100;
        this.y = HEIGHT-2*CELL;
    }
    
    this.moveUp = function(){
        orientation = "up";
        this.y -= size;
    }
    this.moveDown = function(){
        if(this.y+CELL <= HEIGHT-CELL*2){
            orientation = "down";
            this.y += size;
        }
    }
    this.moveLeft = function(){
        orientation = "left";
        this.x -= size;
    }
    this.moveRight = function(){
        orientation = "right";
        this.x += size;
    }
    this.dead = function(){
        this.life--;
    }
    
}

function Car(x,y,w,direction,speed){
    
    this.x = x;
    this.y = y;
    this.w = w;
    
    this.move = function(){
        if(direction == "left"){
            this.x -= speed;
            if(this.x < -this.w){
                this.x = WIDTH;
            }
        }else{
            this.x += speed;
            if(this.x > WIDTH){
                this.x = -this.w;
            }
        }
    }
    
    this.draw = function(context){
        if(direction == "left"){
            if(this.w == CAR_SIZE[1])
                context.drawImage(sprite, 107, 300, 45,23, this.x, this.y, this.w, CELL);
            else
                context.drawImage(sprite, 10, 265, 28,23, this.x, this.y, this.w, CELL);
        }
        else
            context.drawImage(sprite, 46, 265, 28,23, this.x, this.y, this.w, CELL);
    }
    
}

function Log(x,y,w,direction,speed){
    
    this.x = x;
    this.y = y;
    this.w = w;
    this.direction = direction;
    this.speed = speed;
    
    this.move = function(){
        if(this.direction == "left"){
            this.x -= this.speed;
            if(this.x < -this.w){
                this.x = WIDTH;
            }
        }else{
            this.x += this.speed;
            if(this.x > WIDTH){
                this.x = -this.w;
            }
        }
    }
    
    this.draw = function(context){
        switch(this.w){
            case LOG_SIZE[0]:
                context.drawImage(sprite, 8, 229, 86,23, this.x, this.y, this.w, CELL);
                break;
            case LOG_SIZE[1]:
                context.drawImage(sprite, 8, 197, 118,23, this.x, this.y, this.w, CELL);
                break;
            case LOG_SIZE[2]:
                context.drawImage(sprite, 8, 165, 178,23, this.x, this.y, this.w, CELL);
                break;
        }
    }
}

function Lily(x,y, w){
    
    this.x = x;
    this.y = y;
    this.w = w;
    this.froggerOn = false;
    
    this.draw = function(context){
        if(this.froggerOn){
            context.drawImage(sprite, 76, 367, 26,20, this.x+10, this.y, CELL, CELL);
        }
    }
    
}