"use strict";

class Sensor {
    constructor(car) {
        this.car = car;
        this.rayCount = 5;
        this.rayLength = 150; // range of the rays
        this.raySpread = Math.PI / 2; // 45° ray spread angle

        this.rays = [];
        this.readings = [];
    }

    update(roadBorders, traffic) {
        this.#castRays();
        this.readings = [];

        for (const ray of this.rays) {
            // check if ray intersects with any of the road borders
            this.readings.push(
                this.#getReading(ray, roadBorders, traffic)
            );
        }
    }

    // returns the point with offset of the intersection point with the closest distance to the ray origin
    // return type: {x, y, offset}
    #getReading(ray, roadBorders, traffic) {
        let touches = [];
        for (let i = 0; i < roadBorders.length; i++) {
            const touch = getIntersection(
                ray[0],
                ray[1],
                roadBorders[i][0],
                roadBorders[i][1]);

            if (touch) {
                touches.push(touch);
            }
        }

        for (let i = 0; i < traffic.length; i++) {
            const poly = traffic[i].getPolygon();
            for (let j = 0; j < poly.length; j++) {
                const touch = getIntersection(
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j + 1) % poly.length]);
                if (touch) {
                    touches.push(touch);
                }
            }
        }

        if (touches.length === 0) {
            return null;
        } else {
            // offset = distance of ray origin to touch point
            const offsets = touches.map(e => e.offset);
            const minOffset = Math.min(...offsets);

            return touches.find(e => e.offset === minOffset);
        }
    }

    #castRays() {
        this.rays = [];
        for (let i = 0; i < this.rayCount; i++) {

            // sin / cos refresher:
            // ---------------------
            // In a unit circle (a circle with radius 1), the sine (sin) of an angle is the y-coordinate
            // of the point where the angle intersects the circle. The cosine (cos) is the x-coordinate.
            //
            // ASCII Diagram of a unit circle with an angle θ:
            //
            //          y
            //          ^
            //          |
            //          |    /)
            //          |   /  )
            //          |  /    )
            //          | /θ    )
            //          |/_ _ _ _ _ > x
            //
            // sin(θ) = Opposite / Hypotenuse = y / 1 = y
            // cos(θ) = Adjacent / Hypotenuse = x / 1 = x
            //
            // In this code, we use sin and cos to calculate the x and y offsets from the car's
            // current position to find the end points of the rays. We multiply sin(θ) and cos(θ)
            // by the ray's length to extend the point to the end of the ray.
            //
            // End point calculations:
            // x = car.x - rayLength * sin(θ)
            // y = car.y - rayLength * cos(θ)
            // ---------------------

            const rayAngle = lerp(
                this.raySpread / 2,
                -this.raySpread / 2,
                this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1)
            ) + this.car.angle;

            const start = {x: this.car.x, y: this.car.y};
            const end = {
                x: this.car.x - Math.sin(rayAngle) * this.rayLength,
                y: this.car.y - Math.cos(rayAngle) * this.rayLength
            };

            this.rays.push([start, end]);
        }
    }

    draw(ctx) {
        for (let i = 0; i < this.rayCount; i++) {
            let end = this.rays[i][1];
            // if we intersect the borders at some point, that point
            // will be the end (so the ray stops at the intersection point)
            if (this.readings[i]) {
                end = this.readings[i];
            }
            const {x: rayOriginX, y: rayOriginY} = this.rays[i][0];

            // draw line from ray origin to ray end OR intersection path
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            ctx.moveTo(rayOriginX, rayOriginY);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();

            // draw line FROM end of ray to intersection
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";

            ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();


        }
    }


}