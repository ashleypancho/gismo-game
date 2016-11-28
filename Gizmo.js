// fc 2.20.2016
//  adds Squads : orders received from Squad  who ask tanks

// adds tank slow down when in forest or water


// todo: set up init file that loads different terrain and tank configs

var timerFunction = null;
var gCycleInterval = 200;   // 200 ms
var gGameWidth     = 750;
var gGameHeight    = 590;

var svgNS       = "http://www.w3.org/2000/svg";
var xlinkNS     = "http://www.w3.org/1999/xlink";
var gGameStateDict  = {};  // key=id value=TankState object
var gTerrainArr     = [];
var gCycleCount     = 0;
var gCollisionArr   = [];
var gNextId         = 0;  // used in SVG collision display, draw then erase
//tank dimensions
var gTankWidth      = 20;
var gTankHeight     = 30;
var gTurretRadius   = 6.5;
var gGunLength      = 25;

// terrain speed reduction
var gForestReduction = 0.4;  // travels slower and todo: made invisible
var gWaterReduction  = 0.6;

// key control
var gTankUnderKeyControl = "t1";  //todo: add way to change this dynamically

document.onkeydown = checkKey;
var gKeyCmdDir = 0;
var gKeyCmd = false;  // set to true when user presses arrow key

var gSquadList = [];  // holds SquadAlpha, SquadBravo and maybe more. use in Update


// constructor for tank object. added width & height for intersection calc
function TankState(id,x,y,dir,speed,team, health) {
  this.tankid     = id;
  this.x      = x;
  this.y      = y;
  this.dir    = dir;
  this.speed  = speed;
  this.isInReverse = false;  // if true then speed = -speed for new x,y toggle with R -key
  this.maxSpeed = 10;
  this.health = health;
  this.team   = team;
  this.width  = gTankWidth;
  this.height = gTankHeight;
  this.inTerrain = null;  // may be forest, water or hq

  this.prevx  = x;  // for CD reset
  this.prevy  = y;

  // need method: isOkDirectionChange(newdir)
  // 
  // data to send to AI with getMove   -- returns object
  this.getStateForAI = function () {
        return {id:this.tankid, x:this.x, y:this.y,
                dir:this.dir, speed:this.speed, health:this.health};
  };
   
}

// ****************   *********** **********************
// ****************   initTanks   **********************
// ****************   *********** **********************

function initTanks() {

  var defaultSpeed = 0;  // used for stationary init
  var defaultDir   = 0;

  // create list of tankids for Squad constructor
  var alphaTankList = [];
  var bravoTankList = [];
  var newTankInstance;

  var data = $.getJSON( "tanks.json", function( tankInitList ) {

    for (var i =0; i < tankInitList.length; i++) {
      var tank = tankInitList[i];
      // create instance of TankState object : this is the GAME data structure
      gGameStateDict[tank.id] = new TankState(tank.id, tank.x, tank.y, defaultDir, defaultSpeed, tank.team, tank.health);


      if (tank.team === "alpha") {
          newTankInstance =   new TankAIAlpha(tank.team, tank.id,tank.maxspeed);
          alphaTankList.push( newTankInstance );
          console.log(newTankInstance.sayHello() );
      }
      else {
          // set up Bravo Tanks - each start off with some x,y
          newTankInstance = new TankAIBravo(tank.team, tank.id,tank.maxspeed);
          bravoTankList.push(newTankInstance );
          //console.log(newTankInstance.sayHello() );
      }
    }

      // Setup Squads for two teams: able to expland this to multi teams with added Squad defs
      var myAlphaSquad = new SquadAlpha("alpha", alphaTankList, undefined, undefined);
      var myBravoSquad = new SquadBravo("bravo", bravoTankList, undefined, undefined);

      gSquadList.push(myBravoSquad);
      gSquadList.push(myAlphaSquad);

    drawTanksSVG();   // draw board based on positions
  });
}


// ****************   *********** **********************
// ****************   UPDATE GAME **********************
// ****************   *********** **********************

function updateGameState() {
  gCycleCount++;  // keep track of number of updates

  // Build List of Update (move) Requests
  var updateRequestList = [];

    // PART I. Get move requests from Squads
  for (var idx in gSquadList){
        updateRequestList = updateRequestList.concat( gSquadList[idx].getMoves() );
  }


    // PART II. Loop over each tank in gGameStateDict and apply update obtaind from Squads. If no update
    //   then create one based on current dir and speed. But this should not occur if Squads are
    //  implemented correctly. Some new position needed for CD

  for (var tid in gGameStateDict) {
        //check updateRequestList for a tank requests (see prior loop)
        var tankUpdate = getUpdateOrUndefinedForTank(tid, updateRequestList);

        // update SHOULD exist if Squad is doing its work
        if (tankUpdate !== undefined ) {
            updateGameStateForTank(tid, tankUpdate);
        }
        else  {
            // no request to change, so create request based on current dir&speed
            // so we can calculate new x,y position and test for CD
            var defaultUpdate = {"dir":   gGameStateDict[tid].dir,
                                 "speed": gGameStateDict[tid].speed};

            updateGameStateForTank(tid, defaultUpdate);
        }
  }

    // Part III. ALL tanks now have their new x,y ..but there may be collisions
    //  CD  : if tank hits mtn or other tank, reset x&y -> prevx&y
    //        if tank in water or forest, set gTankState.inTerrain
    //          then next cycle, limit speed
    //        if hits hq, declare game over and report time
    doCollisionDetection();


}

function updateGameStateForTank(tankid, tankUpdate) {

    // incoming request for possibly new dir and speed
    // .. todo: check if this dir change is possible.. as in turning into mtn
    // check if speed is possible, may be reduced in water or forest

    gGameStateDict[tankid].dir   = tankUpdate.dir;
    gGameStateDict[tankid].speed = tankUpdate.speed;


    //need to set speed back to max when tank comes out of forest or water
    // commented out: mar 11. for path to dest
    //if (gGameStateDict[tankid].inTerrain == null &&
    //         gGameStateDict[tankid].speed > 0) {
    //   gGameStateDict[tankid].speed = gGameStateDict[tankid].maxSpeed;
    //}

    // if tank is moving and is in forest or water, adjust
    if (gGameStateDict[tankid].inTerrain != null &&
             gGameStateDict[tankid].speed > 0) {
        if (gGameStateDict[tankid].inTerrain == "water") {
            gGameStateDict[tankid].speed =
               gGameStateDict[tankid].maxSpeed * gWaterReduction;
        }
        else if (gGameStateDict[tankid].inTerrain == "forest") {
                gGameStateDict[tankid].speed =
                  gGameStateDict[tankid].maxSpeed * gForestReduction;
        }
     }

    // modify display to show actual speed for tank under key control
    if (tankid == gTankUnderKeyControl) {
        updateSpeedDisplay(gGameStateDict[tankid].speed);
    }


    //use speed and dir to update x,y
    var newxy = computeNewXY(   gGameStateDict[tankid].x,
                                gGameStateDict[tankid].y,
                                gGameStateDict[tankid].dir,
                                gGameStateDict[tankid].speed,
                                gGameStateDict[tankid].isInReverse
    );

    // set new x,y but remember old x,y for CD
    gGameStateDict[tankid].prevx = gGameStateDict[tankid].x;
    gGameStateDict[tankid].prevy = gGameStateDict[tankid].y;

    // optimistic update of position
    gGameStateDict[tankid].x = newxy["newx"];
    gGameStateDict[tankid].y = newxy["newy"];
}

// if collision is found for tank, update tank state
// to indicate in water or forest or hq.
// if hit mtn or another tank, reset position to prevx&y
function doCollisionDetection() {
    // we may have drawn collision previous cycle, so erase and clear out array
    eraseCollisions();
    gCollisionArr = [];

    // check if out of health
    if (gGameStateDict[gTankUnderKeyControl].health <= 0) {
        showGameOver("SORRY - OUT of HEALTH");
    }

    for (var tankid in gGameStateDict) {
        // collisionObject will = mtn,forest,water,hq,t<int>,null
        var collisionObject = checkForCollisions(tankid);
        if (collisionObject == null) {
            gGameStateDict[tankid].inTerrain = null;  // no collisions

            // continue loop for next tank
        }
        else {  // we have collision
            // if we collide with tank, get its id for health reduction
            var collisionTankId;
            if (collisionObject.startsWith('t')) {
                collisionTankId = collisionObject;
                collisionObject = "tank";
            }
            switch(collisionObject) {
                case "tank":
                    var collideObj = new Object();
                    collideObj["id"] = "c" + gNextId++;
                    collideObj["x"] = gGameStateDict[tankid].x;
                    collideObj["y"] = gGameStateDict[tankid].y;

                    gGameStateDict[tankid].x = gGameStateDict[tankid].prevx;
                    gGameStateDict[tankid].y = gGameStateDict[tankid].prevy;
                    // health adjustment to both tanks?
                     // health adjust
                    gGameStateDict[tankid].health--;
                    if (tankid == gTankUnderKeyControl) {
                        updateHealthDisplay( gGameStateDict[tankid].health);
                    }
                    gCollisionArr.push( collideObj);
                    break;
                case "mtn":
                    var collideObj = new Object();
                    collideObj["id"] = "c" + gNextId++;
                    collideObj["x"] = gGameStateDict[tankid].x;
                    collideObj["y"] = gGameStateDict[tankid].y;

                    gGameStateDict[tankid].x = gGameStateDict[tankid].prevx;
                    gGameStateDict[tankid].y = gGameStateDict[tankid].prevy;
                    // health adjust
                    gGameStateDict[tankid].health--;
                    if (tankid == gTankUnderKeyControl) {
                        updateHealthDisplay( gGameStateDict[tankid].health);
                    }
                    gCollisionArr.push( collideObj);
                    break;


                case "forest":
                    // speed reduction
                    gGameStateDict[tankid].inTerrain = "forest";
                    break;
                case "water":
                    //speed reduction
                    gGameStateDict[tankid].inTerrain = "water";
                    break;
                case "hq1":
                    //game over: show SUCCESS and time to complete
                    if (gGameStateDict[tankid].team === "alpha") {
                           showGameOver("SUCCESS");
                    }
                    break;
                case "hq2":
                    //game over: show SUCCESS and time to complete
                    alert("Welcome home. Now get back to work!");
                    break;

            }



        }

        // tank may have gone outside game boundary - if so, move it back onto board
        if (gGameStateDict[tankid].x < 0) gGameStateDict[tankid].x = 0;
        else if (gGameStateDict[tankid].x > gGameWidth) gGameStateDict[tankid].x = gGameWidth;

        if (gGameStateDict[tankid].y < 0) gGameStateDict[tankid].y = 0;
        else if (gGameStateDict[tankid].y > gGameHeight ) gGameStateDict[tankid].y = gGameHeight;
    }
}

function handleCmdMsg(msg) {
    //pass msg to all Squads for distribution

    for (var idx in gSquadList) {
        gSquadList[idx].receiveMsg(msg);
    }
}


// 2.20.16: pass key commands to alpha squad
function checkKey(e) {

    var keydirMap = {38:0, 33:45, 39:90, 34:135, 40:180, 35:225, 37:270, 36:315};
    var newdir;

  // save key info for update to use ??
  e = e || window.event;
  var keyCode = e.keyCode;  // value may revert to undefined?

  // check direction change
  if (keydirMap[keyCode] !== undefined) {
      newdir = keydirMap[keyCode] ;

      if (isOkTankStateUpdate(gTankUnderKeyControl, newdir)) {
          redrawTank(gTankUnderKeyControl);
          updateDirDisplay( gGameStateDict[gTankUnderKeyControl].dir);
          var msg = gTankUnderKeyControl + " dir " + newdir;
          //todo check that we send to correct squad  - assume here [1] = alpha
          gSquadList[1].receiveMsg(msg);
      }
  }
  else if (keyCode == 12 || keyCode == 32) {  // 5 or space (but space forces terrain read??)

      if (gGameStateDict[gTankUnderKeyControl].speed === 0) {
          gGameStateDict[gTankUnderKeyControl].speed = gGameStateDict[gTankUnderKeyControl].maxSpeed;
      }
      else  gGameStateDict[gTankUnderKeyControl].speed = 0;

      // update UI
      updateSpeedDisplay(gGameStateDict[gTankUnderKeyControl].speed);
  }
      /** key code 'r' appears in command with di'r'
  else if (keyCode == 82 )   {  // R for reverse

      if (gGameStateDict[gTankUnderKeyControl].isInReverse) {
         gGameStateDict[gTankUnderKeyControl].isInReverse = false;
      }
      else gGameStateDict[gTankUnderKeyControl].isInReverse = true;

      // update UI
      updateReverseDisplay(gGameStateDict[gTankUnderKeyControl].isInReverse);
  }
       */

 }

function isOkTankStateUpdate(tankid, newdir) {
    // used in key nav control - any turn is accepted
    // todo: check collisions - requires more sophisticated CD for angled tanks
    gGameStateDict[tankid].dir = newdir;
    return true;
}



// return update rec  for a tankid OR undefined for UI controlled tanks
// AI will have an update also any AIs developed with UI
function getUpdateOrUndefinedForTank(tankid, updateList) {
    for (var idx in updateList) {
        if (updateList[idx].id == tankid) return updateList[idx];
    }
    return undefined;
}


function initTerrain() {
  $.getJSON("terrain.json", function(terraindata) {
    gTerrainArr = terraindata['terrainList'];
    drawTerrain();
  });
}



function computeNewXY(cx, cy, heading, speed, inReverse) {
  if (inReverse !== undefined)   {
      if (inReverse) speed = speed * -1;
  }
  var radians = heading * (Math.PI / 180);
  var newx = cx + Math.sin(radians) * speed;
  var newy = cy + -1 * Math.cos(radians) * speed;
  return {"newx": newx, "newy": newy}
}

function initGameBoard() { // todo read int file for terrain and tank config
  // from stack overflow to avoid jsonGET parse error when reading JSON from file
  // 2.18.2016  solves problem.
   $.ajaxSetup({beforeSend: function(xhr){
  if (xhr.overrideMimeType)
  {
    xhr.overrideMimeType("application/json");
  }
}
}); 
    
  // set up terrain
  initTerrain();

  // set up tanks
  initTanks();  // sets up gGameStateDict

  // show UI related
    updateSpeedDisplay(0);
    updateReverseDisplay(false);
    updateDirDisplay(0);
    updateHealthDisplay(10);


}

function updateGameBoard() {
  // does one cycle - call from animate
  // updates state (model) then call VIEW
  updateGameState();
  clearTanks();
  drawTanksSVG();  //VIEW

  // display collisions
  if (gCollisionArr.length > 0) {
      drawCollisions();
  }


}

function checkForCollisions(tankid) {
  // uses bounding box which will be inaccurate when tank is @90 or 270
  // since rotated tank keeps original width and height.
  // test tanks before terrain since tank may be in water or forest
  for(var idkey in gGameStateDict ) {
    if (idkey !== tankid) {
      if (intersect(gGameStateDict[idkey],gGameStateDict[tankid] )) {;
        return tankid;
      }
    }
  }

  for (var i in gTerrainArr) {
    if (intersect(gGameStateDict[tankid], gTerrainArr[i])) {
      // get terrain type and return that
      return gTerrainArr[i].terrain;
    }
  }



  return null; // no collisions; in JS equivalent to false
}




  function clearTanks() {
    // every tank has 3 SVG elements with unique ids
    // remove them all so we can redraw current gGameStateDict
    var gameBoard = document.getElementById("gameboard");

    for(var tankid in gGameStateDict ) {
      var tank      = document.getElementById( tankid );
      var circle    = document.getElementById( tankid +"c" );
      var gun       = document.getElementById( tankid +"g" );
      gameboard.removeChild(tank);
      gameboard.removeChild(circle);
      gameboard.removeChild(gun);
    }
  }





  function init(evt) {
    if ( window.svgDocument == null ) {
      svgDocument = evt.target.ownerDocument;
    }
    addRotateTransform('g1', 4, 1);
    console.log("are we in init??");
  }


  // frank
  function startAnimation() {
    if(timerFunction == null) {
      timerFunction = setInterval(updateGameBoard, gCycleInterval);
    }
  }

  function stopAnimation() {
    if(timerFunction != null){
      clearInterval(timerFunction);
      timerFunction = null;
    }
  }

/**
 * Created by frank on 1/27/2016.
 */
