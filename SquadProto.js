/**
 * Created by frank on 2/20/2016.
 */
/**
 * Created by frank on 2/13/2016.
 * basic squad: use as prototype for your own SquadAlpha or Bravo
 */

var SquadProto = function(squadName, tankList, homeHq, enemyHq) {

        this.squadName = squadName;
        this.tankList = tankList; // actual tank objects
        this.homeHq = homeHq;
        this.enemyHq = enemyHq;
        this.minDistToGoal = 10;


    // SQUAD is responsible for setting destinations and asks each tank for its move
    getMoves = function() {
            var tankRequestList = [];

            for (var idx in tankList) {
                var squadTank = tankList[idx];

                // ask tank for its move and add to request list
                var tankmove = squadTank.getMove( gGameStateDict[squadTank.tankid].getStateForAI() );
                tankRequestList.push(tankmove);

            }

            // returns a list of all squadron tank requests to be concat with game update list
            return tankRequestList;
    };

    receiveMsg = function (msg){
            console.log("Squad " + this.squadName + " msg received:" + msg);
            // todo distribute to tanks
    }


};
