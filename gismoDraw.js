/**
 * Created by frank on 1/29/2016.
 */


    function updateReverseDisplay(isInReverse) {
       var canvas = document.getElementById("reverseShow");
       var ctx = canvas.getContext("2d");
        ctx.beginPath();
        //ctx.rect(0,0,100,120);
        if (isInReverse) {
            ctx.fillStyle = "red";
            ctx.fillRect(0,0,100,120);

            ctx.font = "9px Arial";
            ctx.fillStyle = "black";
            ctx.fillText("REVERSE",5,15);
        }
        else {
           ctx.fillStyle = "chartreuse";
            ctx.fillRect(0,0,100,120);

          ctx.font = "10px Arial";
          ctx.fillStyle = "black";

          ctx.fillText("DRIVE",5,15);
        }

        ctx.fill();

    }

    function updateSpeedDisplay(speed) {
        var canvas = document.getElementById("speedShow");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        if (speed == 0) {
          ctx.fillStyle = "yellow";
          ctx.fillRect(0,0,100,120);
          ctx.font = "14px Arial";
            ctx.fillStyle = "black";
            ctx.fillText(speed,5,15);
        }
        else {
            ctx.fillStyle = "palegreen";
          ctx.fillRect(0,0,100,120);
          ctx.font = "14px Arial";
            ctx.fillStyle = "black";
            ctx.fillText(speed,5,15);
        }
        ctx.fill();
    }

function showGameOver(msgStr) {
    var gameTime = (gCycleCount * gCycleInterval) / 1000;
    alert(msgStr + "! Time=" + gameTime +  " secs");
    stopAnimation();
}

function updateDirDisplay(dir) {
    var canvas = document.getElementById("dirShow");
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,100,120);
    ctx.font = "16px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(dir,5,15);
    ctx.fill();
}

function updateHealthDisplay(health) {
    var canvas = document.getElementById("healthShow");
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,100,120);
    ctx.font = "16px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(health,5,15);
    ctx.fill();
}

function drawTankSVG(id,x,y,dir,team) {
    //var tank = document.createElementNS(svgNS, "svg");
    //tank.setAttributeNS(svgNS,"id", id);
    var gameBoard = document.getElementById("gameboard");


    var tankrect = document.createElementNS(svgNS, "rect");
    tankrect.setAttribute("id", id);
    tankrect.setAttribute("x", x);
    tankrect.setAttribute("y", y);
    tankrect.setAttribute("width", 20);
    tankrect.setAttribute("height", 30);
    tankrect.setAttribute("rx", 10);
    tankrect.setAttribute("ry", 10);
    tankrect.setAttribute("style", "stroke:#006600; fill: #00cc00");
    // color for defending tanks
    if (team ==="bravo") tankrect.setAttribute("style", "stroke:#006600; fill: #333333");

    // rotate around presumed center
    tankrect.setAttribute("transform","rotate(" + dir + " " + (x+10) + " " +
    (y+15) + ")" );


    var tankcircle = document.createElementNS(svgNS, "circle");
    tankcircle.setAttribute("id", id+"c");
    tankcircle.setAttribute("cx", x+gTankWidth/2);
    tankcircle.setAttribute("cy", y+gTankHeight/2);
    tankcircle.setAttribute("r", gTurretRadius);
    tankcircle.setAttribute("style", "stroke: none; fill: #ff0000;");

    var tankgun = document.createElementNS(svgNS, "line");
    tankgun.setAttribute("id", id+"g");
    tankgun.setAttribute("x1", x+gTankWidth/2);
    tankgun.setAttribute("y1", y+gTankHeight/2);
    tankgun.setAttribute("x2", x+gTankWidth/2);
    tankgun.setAttribute("y2", y+gTankHeight/2 - gGunLength);
    tankgun.setAttribute("style", "stroke:#006600;");
    tankgun.setAttribute("transform","rotate(" + dir + " " + (x+gTankWidth/2) + " " +
    (y+gTankHeight/2) + ")" );



    gameBoard.appendChild(tankrect);
    gameBoard.appendChild(tankcircle);
    gameBoard.appendChild(tankgun);
  }

function drawCollisions() {

    for (var i in gCollisionArr) {
        drawCollisionSVG( gCollisionArr[i]);
    }
}

function eraseCollisions() {

    for (var i in gCollisionArr) {
        eraseCollisionSVG( gCollisionArr[i]);
    }
}

function drawCollisionSVG( collisionObj) {
    // collisionObj properties: id, x, y
    var gameBoard = document.getElementById("gameboard");

    var collision = document.createElementNS(svgNS, "circle");
    collision.setAttribute("id", collisionObj.id);
    collision.setAttribute("cx", collisionObj.x + 10);
    collision.setAttribute("cy", collisionObj.y +20);
    collision.setAttribute("r", 15);
    collision.setAttribute("style", "stroke: #ff00ff; stroke-width: 4; fill: none;");

    gameBoard.appendChild(collision);

}

function eraseCollisionSVG( collisionObj ) {
    var gameBoard = document.getElementById("gameboard");
    var collideCircle     = document.getElementById( collisionObj.id );
    gameBoard.removeChild(collideCircle);

}


 function drawTerrain() {
    for(var i in gTerrainArr) {
      drawTerrainObj(gTerrainArr[i]);
    }
  }

  function drawTerrainObj(terrObj) {
    //console.log("Undefined??" + terrObj.x);
    var gameBoard = document.getElementById("gameboard");
    var terrainRect = document.createElementNS(svgNS, "rect");
    terrainRect.setAttribute("x", terrObj["x"]);
    terrainRect.setAttribute("y", terrObj["y"]);
    terrainRect.setAttribute("width", terrObj["width"]);
    terrainRect.setAttribute("height", terrObj["height"]);

    if(terrObj.terrain == "water") {
      terrainRect.setAttribute("style", "stroke:#666600; fill: #0066FF");
    } else if(terrObj.terrain == "mtn") {
      terrainRect.setAttribute("style", "stroke:#666600; fill: #993333");
    } else if(terrObj.terrain == "forest") {
        terrainRect.setAttribute("style", "stroke:#666600; fill: #33FF00");
    } else if ( (terrObj.terrain).startsWith("hq") ) {
       terrainRect.setAttribute("style", "stroke:#666600; fill: #FFFF00");
    } else {
      terrainRect.setAttribute("style", "stroke:#666600; fill: #cccccc");
    }

    gameBoard.appendChild(terrainRect);
  }

  function drawTanksSVG() {
    // for all tank objects in gGameStateDict - add as SVG
    // draw new positions (after call clearTanks) from gGameStateDict
    for(var idkey in gGameStateDict ) {
      var tankid = idkey;

      var xpos = gGameStateDict[tankid].x;
      var ypos = gGameStateDict[tankid].y;
      var dir  = gGameStateDict[tankid].dir;
      var team = gGameStateDict[tankid].team;
      drawTankSVG(tankid, xpos, ypos, dir, team);

    }
  }

function redrawTank(tankid) {
    eraseTank(tankid);
    drawTank(tankid);
}

 function drawTank(tankid) {
      var xpos = gGameStateDict[tankid].x;
      var ypos = gGameStateDict[tankid].y;
      var dir  = gGameStateDict[tankid].dir;
      var team = gGameStateDict[tankid].team;
      drawTankSVG(tankid, xpos, ypos, dir, team);
 }

function eraseTank(tankid) {
      var gameBoard = document.getElementById("gameboard");

      var tank      = document.getElementById( tankid );
      var circle    = document.getElementById( tankid +"c" );
      var gun       = document.getElementById( tankid +"g" );
      gameboard.removeChild(tank);
      gameboard.removeChild(circle);
      gameboard.removeChild(gun);
}


