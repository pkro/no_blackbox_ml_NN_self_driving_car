const utils = {};
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
 * @returns The interpolated value between A and B based on parameter t.
 */
utils.lerp = (A, B, t) => {
    return A + (B - A) * t;
}