"use strict";
window.onload = function(){
    var context = document.getElementById("frogger").getContext("2d");
    var board = new Board(context);
    board.start();
}