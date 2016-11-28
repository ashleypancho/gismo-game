/**
 * Created by frank on 2/13/2016.
 */

var SquadBravo = function(squadName, tankList, homeHq, enemyHq) {

    this.squadName = squadName;
    this.tankList  = tankList; // actual tank objects
    this.homeHq    = homeHq;
    this.enemyHq   = enemyHq;
    this.minDistToGoal = 10;


this.patrolList = [ [300,10, 380,50],
        [50,10, 90,40],
                        [50,10,90,20]

                         ] ;

    this.tankPatrolAssignment = {};

    for (var idx in tankList) {
        var tid = tankList[idx].tankid;
        var searchArea = this.patrolList.pop();
        this.tankPatrolAssignment[tid] = searchArea;
    }

    // SQUAD is responsible for setting destinations and asks each tank for its move

    this.getMoves = function() {
        var tankRequestList = [];

        for (var idx in tankList) {
            var squadTank = tankList[idx];

        /**  let tanks sit and wait
        if (!squadTank.hasDestination() && !squadTank.holdAtDestination){
            var searchArea = this.tankPatrolAssignment[squadTank.tankid];
            squadTank.destx = randomIntFromInterval(searchArea[0], searchArea[2]);
            squadTank.desty = randomIntFromInterval(searchArea[1], searchArea[3]);
        }
         */

        // ask tank for its move and add to request list
        var tankmove = squadTank.getMove( gGameStateDict[squadTank.tankid].getStateForAI() );
        tankRequestList.push(tankmove);

    }

    // returns a list of all squadron tank requests to be concat with game update list
    return tankRequestList;
    };

    this.receiveMsg = function(msg) {
        // check for msgs to tank t1 : plan intercept

        var regexGoXY = /.*?(t\d+).*?go.*?(\d+).*?(\d+)/;
        var matchList = msg.match(regexGoXY);
        // intercept tank t1
        if (matchList != null) {
            var x = parseInt(matchList[2], 10);
            var y = parseInt(matchList[3], 10);
            // set up for intercept
            // get indx of tank closest to intercept position
            var chosenIdx = this.getClosestTankIdxTo(x,y);

            tankList[chosenIdx].setIntercept(x,y);

        }

        // deliver commands to squad tanks..
        if (matchList != null && matchList.length == 2) {
            for (var idx in tankList) {
                if (tankList[idx].tankid === matchList[1]) {
                    tankList[idx].receiveMsg(msg);
                }
            }
        }

    };

    this.getClosestTankIdxTo = function (x,y) {
        var minDistance = 10000;
        var minIdx = undefined;

        // find closest tank to send to intercept
        for (var idx in tankList) {
            var squadTank = tankList[idx];
            var distTo = distance(x,y,squadTank.x, squadTank.y);
            if (distTo < minDistance) {
                minDistance = distTo;
                minIdx = idx;
            }
        }
        return minIdx;
    };
    
    // aux functions
    function randomIntFromInterval(min,max){
       return Math.floor(Math.random()*(max-min+1)+min);
    }

};
