// Path objects
function Path (route) {
    this.last = 0;
    this.route = route;   //array of coordinate objects

    //increment last checkpoint, return next destination
    this.nextPoint = function (){
      if( this.last + 2 > route.length) {
        return {x:undefined, y:undefined};
      } else {
        this.last++;
        return this.route[this.last];
      }
    }
}

/*
 * TankAI - replace this with YOUR code for your TankAIAlpha
 *  so that it can follow a path to a destination
 *
 */
function TankAIAlpha (team, tankid, maxspeed) {
    // each tank has unique identity
    this.tankid = tankid;
    this.teamName = team;
    this.maxspeed = maxspeed;

    // destination - may be: undefined
    this.destx = undefined;
    this.desty = undefined;

    // current position
    this.currentx = undefined;
    this.currenty = undefined;

    // speeds
    this.speed = 0;
    this.route = undefined;
    this.stopped;

    // left path
    this.lroute = [
        {x:400, y:430},
        {x:165, y:300},
        {x:165, y:165},
        {x:115, y:165},
        {x:115, y:60},
        {x:370, y:60},
        {x:370, y:15}
    ];

    this.rroute = [
        {x:400, y:430},
        {x:635, y:300},
        {x:635, y:165},
        {x:685, y:165},
        {x:685, y:60},
        {x:370, y:60},
        {x:370, y:15}
    ];

    this.croute = [
        {x:380, y:430},
        {x:380, y:300},
        {x:380, y:165},
        {x:435, y:165},
        {x:380, y:15}
    ];

    this.decode = function() {
        var encrypted_data = arguments[0];
        var match = "no match";

        //go cmd regex with coordiantes
        var gotoRegex = /(?:.*(t[0-9]+).*(go)[^0-9]*([0-9]+)[^0-9]*([0-9]+))/g;
        //go cmd regex resume
        var goRegex = /(?:.*(t[0-9]+).*(go))/g;
        //stop cmd regex
        var stopRegex = /(?:.*(t[0-9]+).*(stop))/g;
        //t1 left route cmd
        var leftRegex = /(?:.*(t[0-9]+).*(left))/g;
        //t1 center route cmd
        var centerRegex = /(?:.*(t[0-9]+).*(center))/g;
        //t1 rgiht route cmd
        var rightRegex = /(?:.*(t[0-9]+).*(right))/g;

        if(match = gotoRegex.exec(encrypted_data)){
            console.log("goto cmd: " + match[1] +  " " + match[2] + " " + match[3] + " " + match[4]);
            this.setDestination(match[3], match[4]);
        }
        else if(match = goRegex.exec(encrypted_data)){
           console.log("go cmd: " + match[1] +  " " + match[2]);
           this.stopped = false;
        }
        else if(match = stopRegex.exec(encrypted_data)){
           console.log("stop cmd: " + match[1] +  " " + match[2]);
           this.stopped = true;
        }
        else if(match = leftRegex.exec(encrypted_data)){
          this.setPathToDestination(this.lroute);
        }
        else if(match = centerRegex.exec(encrypted_data)){
          this.setPathToDestination(this.croute);
        }
        else if(match = rightRegex.exec(encrypted_data)){
          this.setPathToDestination(this.rroute);
        }
        else{
          console.log("error decoding message:" + encrypted_data);
        }
    }


    this.setDestination = function(x,y) {
       this.destx = x;
       this.desty = y;
    };


    this.sayHello = function() {
        return "TankAIAlpha:" + this.tankid + " sayHello(): dest=("+this.destx+
                ","+this.desty+")";
    };

    // assume incoming parm is in order of points to visit
    // store reversed list and pop.  use .length to determine if empty
    this.setPathToDestination = function (coors) {
        this.route = new Path(coors);
        this.updatePath();
    };

    this.updatePath = function() {
        var nextCheckpoint = this.route.nextPoint();
        this.setDestination(nextCheckpoint.x, nextCheckpoint.y);
        if(this.destx == undefined && this.desty == undefined) {
            this.route = undefined;
        }
    }

    this.checkCoors = function() {
        var offset = this.getOffset(this.currentx, this.currenty, this.destx, this.desty);
        if(offset > 20) {
            this.changeSpeed(1);
        }
        if(offset <= 20) {
            this.changeSpeed(.2);
        }
        if(offset < 7 && this.route != undefined) {
            this.updatePath()
        }
        if(offset < 7 && this.route == undefined) {
            this.setDestination(undefined, undefined);
        }
    }

    this.angle = function(x, y, destX, destY) {
        var diffX = destX - x;
        var diffY = destY - y;
        var angle = Math.atan2(diffY, diffX); // radians
        angle = (angle/6.2831) * 360; // degrees
        return angle;
    }

    this.getOffset = function(x, y, destX, destY) {
        var diffX = destX - x;
        var diffY = destY - y;
        var hypotenuse = Math.sqrt(Math.pow(diffX,2) + Math.pow(diffY,2));
        return hypotenuse;
    }

    this.changeSpeed = function(percentage) {
        if(percentage > 1) {
            percentage = 1;
            this.stopped = false;
        } else if(percentage < 0) {
            percentage = 0;
            this.stopped = true;
        }

        this.speed = maxspeed * percentage;
    }

    this.receiveMsg = function (msg) {
        // t1 dir 90  t1 go 30 50
       console.log("TankAIAlpha:"+this.tankid + " receiveMsg() :" + msg);
       this.decode(msg)
    };


    //method called by GISMO
    this.getMove = function(tankstate) {
        //direction and speed to request
         var newdir = 0;
         var newspeed = 0;

         //update position
         this.currentx = tankstate.x;
         this.currenty = tankstate.y;

         //no destination
         if (this.destx === undefined || this.desty === undefined) {
              // nowhere to go - just spin
              newdir = (tankstate.dir + 45) % 360;
              newspeed = 0;   // just move slowly
         }

         //destination
         else
         {

            //set new direction trajectory
            newdir = Math.round(angle360(tankstate.x, tankstate.y,this.destx, this.desty));

            if(!this.stopped){
              newspeed = this.speed;
              this.checkCoors();
            }

         }

          // setup your move for Gismo via JS object
          var moveRequest = {id:this.tankid, dir:newdir, speed:newspeed};

          // console display of your tank state and move request for debug
          //  deliver request to Gismo

          console.log("TankAIAlpha: "+this.tankid+
              "@("+Math.floor(tankstate.x)+","+Math.floor(tankstate.y)+')'+
              " dest=(" + this.destx + "," + this.desty + ")" +
              " getMove() =" + JSON.stringify(moveRequest));
          return  moveRequest;
    };






}
