
/**
 * Created by frank on 1/29/2016.
 *  Holds geometric calculation routines
 */


function rotate_point(pointX, pointY, originX, originY, angle) {
    angle = angle * Math.PI / 180.0;
    return {
        x: Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointY-originY) + originX,
        y: Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointY-originY) + originY
    };
}

function distance(cx,cy,tx,ty) {
    return Math.sqrt(Math.pow((cx-tx),2) + Math.pow((cy-ty),2));
  }

function angle(cx, cy, ex, ey) {
    var dy = ey - cy;
    var dx = ex - cx;
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
        //if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta;
}

function angle360(cx, cy, ex, ey) {
    
    var theta = angle(cx, cy, ex, ey); // range (-180, 180]
    if (theta < 0) theta = 360 + theta; // range [0, 360)

    return (theta+90) % 360;
}

function intersect(r, t) {
  //This is how the .NET Framework implements Rectangle.Intersect
  // works for any obj with x,y,width, height properties
  if (r.x < t.x + t.width &&
    t.x < r.x +r.width &&
    r.y < t.y + t.height )
        return t.y < r.y + r.height;
    else
        return false;
}

function computeNewXY(cx, cy, heading, speed) {
  var radians = heading * (Math.PI / 180);
  var newx = cx + Math.sin(radians) * speed;
  var newy = cy + -1 * Math.cos(radians) * speed;
  return {"newx": newx, "newy": newy}
}

/**
 * Having said that what I'd do if I needed my own algorithm is something like this:

    Find the equation of the line containing the line-segment as a x + b y - 1 = 0;
    evaluate f(x) = a x + b y - 1 for each vertex of the rectangle
    If all corners are > 0 or all are < 0 you have no possible intersection.
    Intersections can only occur on edges with one vertex having f(x)>0 and the other having f(x)< 0. So perform a line-segment to line-segment intersection with all such edges and the original line-segment.

This should work for arbitrary polygons. And so rotated rectangles wont be a problem.
 */

function slope(x1,y1,x2,y2) {
    return (y2-y1) / (x2-x1);
}

function yintercept(m,x,y) {
    return y - m*x;
}

function evalLineFnForPoint(m,b,x,y) {
    return m*x -b -y;
}

function evalLineAgainstPolypoints(m,b,x1,y1,x2,y2,x3,y3,x4,y4) {
    var posCount = 0;
    var negCount = 0;
    if (evalLineFnForPoint(m, b, x1, y1) > 0) posCount++;
    else negCount++;
    if (evalLineFnForPoint(m, b, x2, y2) > 0) posCount++;
    else negCount++;
    if (evalLineFnForPoint(m, b, x3, y3) > 0) posCount++;
    else negCount++;
    if (evalLineFnForPoint(m, b, x4, y4) > 0) posCount++;
    else negCount++;

    console.log("pos count = ", posCount);
    console.log("neg count = ", negCount);

    // if we get ONLY 1 pos or ONLY 1 neg we have intersect . ? test

    // waht about when parallel edge crosses rect edge then 2 on each side ! ?

    return  (posCount == 1  || negCount == 1);
}




