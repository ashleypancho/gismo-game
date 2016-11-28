
/* 
 * TankAI Bravo - stop the alpha
 */
function TankAIBravo (team, tankid, maxspeed) {
    // each tank has unique identity 

    this.tankid = tankid;
    
    // properties
    this.teamName = team;
    this.maxspeed = maxspeed;

    // destination - may be: undefined
    this.destx = undefined;
    this.desty = undefined;

    // for intercept
    this.interceptDestx = undefined;
    this.interceptDesty = undefined;

    // special properties for squad leader to track tank state
    this.holdAtDestination = false;
    
    this.setDestination = function(x,y) {
       this.destx = x;
       this.desty = y;
    };

    this.setIntercept = function (x,y) {
        this.interceptDestx = x;
        this.interceptDesty = y;
    };
    
    this.sayHello = function() {
        return "TankAI:" + this.tankid + " sayHello(): dest=("+this.destx+
                ","+this.desty+")";
    };
    
    this.receiveMsg = function (msg) {
       //console.log("TankAI:"+this.tankid + " receiveMsg() :" + msg); 
    };

    this.hasDestination = function () {
        return !(this.destx === undefined);
    };
    
        
    //method called by Squad
    this.getMove = function(tankstate) {
       this.x           = tankstate.x;
       this.y           = tankstate.y;
       this.dir         = tankstate.dir;
       this.speed       = tankstate.speed; 
       this.health      = tankstate.health;
       this.minDistToGoal = 10;  // to account for overshooting destination
       
       var newdir;
       var newspeed;

       // do our intercept thing
       if (this.interceptDestx !== undefined) {
            //distance for each  tank
            var distBravo = distance(this.x, this.y, this.interceptDestx, this.interceptDesty);
            var distAlpha = distance(gGameStateDict['t1'].x, gGameStateDict['t1'].y,
                                        this.interceptDestx, this.interceptDesty);
            // go when alpha is close
            if (distAlpha <= distBravo) {
              this.setDestination(this.interceptDestx, this.interceptDesty);
              //console.log("Squad bravo tank heading for collision");
            }
       }

       
       if (this.hasDestination() === false ) {  // nowhere to go
            var myrand = Math.floor((Math.random() * 60 ));
            newdir = (this.dir + myrand) % 360;
            newspeed = Math.floor((Math.random() * 5 ));   // hold or roam
       }
       else {  // we have a destination

           // check if we have arrived at destination
           var distToGoal = distance(this.x, this.y, this.destx, this.desty);

           if (distToGoal < this.minDistToGoal) { // we have arrived
               newdir = this.dir;
               newspeed = 0;
               this.destx = undefined;
               this.desty = undefined;
           }
           else { // keep going toward dest
             newdir = Math.round(angle360(this.x, this.y, this.destx, this.desty));
             newspeed = this.maxspeed;
           }
       }
           
        var moveRequest = {id:this.tankid, dir:newdir, speed:newspeed};
        // console display for debug
        /**
        console.log("TankAIBravo: "+this.tankid+ "@("+Math.floor(this.x)+","+Math.floor(this.y)+')'+
                   " dest=("+this.destx+","+this.desty+")" +
                   " getMove() =" + JSON.stringify(moveRequest));
         */
        //

        return  moveRequest; 
 
    };
    

}

