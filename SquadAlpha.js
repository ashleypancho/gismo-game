/**
 * Replace this code with your code - that intercepts messages of the form
 *   t1 left, t1 right, t1 center
 *   and sends a path (list of destinations to your tank)
 */

var SquadAlpha = function(squadName, tankList, homeHq, enemyHq) {

    this.squadName = squadName;
    this.tankList  = tankList; // actual tank objects
    this.homeHq    = homeHq;
    this.enemyHq   = enemyHq;



    // METHOD: getMoves ---------------------------------------------------------------
    // SQUAD is responsible for setting destinations and obtaining move from each tank
    // RETURNs : A List of move objects, one per tank in squad
    this.getMoves = function() {
        var tankRequestList = [];

        for (var idx in tankList) {
            var squadTank = tankList[idx];  // one of the squads tank objects

            // ask the game for the current state of this tank
            var currentTankState = gGameStateDict[squadTank.tankid].getStateForAI();

           // ask tank for its move - passing in its current state (x,y,dir,speed, hea;th)
            var tankmove = squadTank.getMove( currentTankState );

            // add move to squad moveList
            tankRequestList.push(tankmove);
    }

    return tankRequestList; // return list to Gismo - all squadron tank requests
    };

    // END  getMoves ---------

    // METHOD: receiveMsg ----------------------------------------------------------------
    // content of command data entry delivered to all Squads
    this.receiveMsg = function(msg){
        console.log("Squad " + this.squadName + " msg received:" + msg);

        // If using an encoded msg, Squad and Tanks must be able to decode
        // Here the Squad finds t<n> and delivers msg
        var regex = /.*?(t\d+).*?/;
        var matchList = msg.match(regex);
        if (matchList != null && matchList.length == 2) {
            for (var idx in tankList) {
                if (tankList[idx].tankid === matchList[1]) {
                    tankList[idx].receiveMsg(msg);
                }
            }
        }


    };
    // END receiveMsg ------------



};
