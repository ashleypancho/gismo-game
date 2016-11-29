# Gismo

Gismo is a Tank AI game that was created by Dr. Frank Coyle at SMU. In this game, players enter a command for their tank with a goal of reaching the yellow square on the enemy base.

For this, I extended an interface provided by Dr. Coyle to add functionality for the main player's tank movement, which was intended to introduce us to the use of regular expressions in programming. With regular expressions, the player is able to "encode" tank commands so that enemy tanks would not be able to tell where the player was going, as enemy tanks read in whatever the player types into the command field. The player tank was able to decode any text and search for commands embedded in the string.

My contributions to Dr. Coyle's code for the assignment included the SquadAlpha.js and TankAIAlpha.js pages.

## How to Play
This game is currently playable at the following website: http://lyle.smu.edu/~apancho/cse3342/A9/

1. Press the INIT positions button. This will initialize the positions of all enemy tanks, obstacles, your player tank, and the start and end locations.
2. Click on START Animation to begin the animations. Your tank should spin in a circle until it receives a command.
3. Your tank, t1, can receive commands in the form of the following:
    * t1 left/center/right, which will have the tank follow the path from the left, center, or right.
    * t1 go x y, which will have the tank go from its current position to the x and y that you specify, with the origin (0, 0) in the bottom left corner and each small box being 100 units.
    * t1 stop, which will stop the tank in its tracks and spin it in a circle.


Your mission, should you choose to accept it, is to get the tank to the top most yellow square. This is the end location. The one closest to you when you initialize is you home base. However, the enemy tanks are able to read plaintext commands. You may choose to disguise the commands with other letters and numbers, such as abcdt1jkgjlcenterjkfwle to get to the center path. Regular expressions are used by your player tank in order to decode any commands you send through. Also note that hitting the red walls in the course will drain your health, and the blue and green squares (water and grass, respectively) will slow you down. Good luck! 
