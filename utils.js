/**
 * Performs linear interpolation between two points A and B.
 *
 * @param A - The starting point or value.
 * @param B - The ending point or value.
 * @param t - The interpolation parameter, ranging from 0 to 1.
 *
 * The function calculates the point that lies a fraction `t` along the line between A and B.
 * - When t = 0, the function returns A.
 * - When t = 1, the function returns B.
 * - When t is between 0 and 1, the function returns a point between A and B.
 *
 * The formula used for calculation is: A + (B - A) * t
 *
 * This function is commonly used in computer graphics, animations, and data approximations.
 *
 * @returns number The interpolated value between A and B based on parameter t.
 * Example: lerp(-4, 6, 0.5) = 2 (get the value that is at 50% (0.5) of a range between -4 and 6
 */
function lerp(A, B, t) {
    return A + (B - A) * t;
}

function getIntersection(A, B, C, D) {
    const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
    const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
    const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

    if (bottom !== 0) {
        const t = tTop / bottom;
        const u = uTop / bottom;
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return {
                x: lerp(A.x, B.x, t),
                y: lerp(A.y, B.y, t),
                offset: t
            };
        }
    }
    return null;
}

function polysIntersect(polygon1, polygon2) {
    for (let i = 0; i < polygon1.length; i++) {
        for(let j=0; j<polygon2.length; j++) {
            const touch = getIntersection(
                polygon1[i],
                polygon1[(i+1)%polygon1.length], // last point should connect to the first point
                polygon2[j],
                polygon2[(j+1)%polygon2.length]);
            if (touch) {
                return true;
            }
        }
    }
    return false;
}

function getRGBA(value) {
    // value is between -1 and 1, and we want values
    // close to zero to be almost transparent and values
    // closer to one strong
    const alpha = Math.abs(value);
    // we assign a different base color depending on negative or positive weights
    // yellow = positive, blue = negative
    // needlessly complicated for the base color, but I guess this will come in later
    const R = value < 0 ? 0 : 255;
    const G = R;
    const B = value > 0 ? 0 : 255;
    return `rgba(${R},${G},${B},${alpha})`;
}

function getRandomColor() {
    // all but blue
    const hue = 290+Math.random()*260;
    return `hsl(${hue}, 100%, 60%)`;
}