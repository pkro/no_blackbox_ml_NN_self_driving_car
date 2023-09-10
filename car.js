"use strict"

class Car {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = 3;
        this.friction = 0.05;

        this.angle = 0;
        this.steeringAngleIncrease = 0.03;

        this.controls = new Controls();
    }

    update() {
        this.#move();

    }

    #move() {
        if (this.controls.forward) {
            this.speed += this.acceleration;
        }
        if (this.controls.reverse) {
            this.speed -= this.acceleration;
        }

        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }

        // car shouldn't go as fast in reverse as in forward
        if (this.speed < -this.maxSpeed / 2) {
            this.speed = -this.maxSpeed / 2;
        }

        if (this.speed > 0) {
            this.speed -= this.friction;
        }
        if (this.speed < 0) {
            this.speed += this.friction;
        }
        if (Math.abs(this.speed) < this.friction) {
            this.speed = 0;
        }

        // only turn car if it's moving like a real goddamn car
        if (this.speed !== 0) {
            // flip steering direction depending on the car going forward or backward
            // so it steers like a real car
            const flip = this.speed > 0 ? 1 : -1;
            // in a unit circle, the rightmost point is usually 0 and degrees increase (0-PI) counter-clockwise
            // and decrease clockwise (0 to -PI)
            // we use a unit circle where 0 is at the top
            // so steering left increases degrees and right decreases them.
            if (this.controls.left) {
                this.angle += this.steeringAngleIncrease * flip;
            }
            if (this.controls.right) {
                this.angle -= this.steeringAngleIncrease * flip;
            }
        }

        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }

    draw(ctx) {
        ctx.save();

        // move upper left corner of context to be at x/y pos of car
        ctx.translate(this.x, this.y);
        // apply rotation for steering; this way we don't have to do
        // complicated calculations and draw diagonal lines
        ctx.rotate(-this.angle);
        ctx.beginPath();

        ctx.rect(
            // we have already translated the ctx to the x/y coordinates x/y is at coords 0 / 0,
            // so we just use width/height here for the x/y parameters
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height);
        ctx.strokeStyle = 'green';
        ctx.fillStyle = 'blue';
        ctx.fill();

        // restore ctx so the car is at the right position at the right angle
        ctx.restore();
    }
}