"use strict";

class Car {
    constructor(x, y, width, height, controlType, maxSpeed = 3, color = "blue") {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;

        this.angle = 0;
        this.damaged = false;

        this.polygon = [];

        this.steeringAngleIncrease = 0.03;

        this.useBrain = controlType === 'AI';

        if (controlType !== "DUMMY") {
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork([
                this.sensor.rayCount, // input layer
                6, // 1 hidden layer
                4 // output layer (the directions, e.g. forward,  left, right, reverse)
            ]);
        }
        this.controls = new Controls(controlType);

        this.img = new Image();
        this.img.src = "car.png";

        this.mask = document.createElement('canvas');
        this.mask.width = width;
        this.mask.height = height;

        const maskCtx = this.mask.getContext("2d");
        this.img.onload = () => {
            maskCtx.fillStyle = color;
            maskCtx.rect(0, 0, this.width, this.height);
            maskCtx.fill();

            maskCtx.globalCompositeOperation = "destination-atop";
            maskCtx.drawImage(this.img, 0, 0, this.width, this.height);
        };
    }

    update(roadBorders, traffic) {
        if (!this.damaged) {
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);
        }
        // no sensor for dummy cars
        if (this.sensor) {
            this.sensor.update(roadBorders, traffic);
            const offsets = this.sensor.readings.map(
                s => s == null
                    ? 0
                    : 1 - s.offset // we want the reading to be lower the farther away the obstacle is, like real sensors do
            );

            const outputs = NeuralNetwork.feedForward(offsets, this.brain);


            if (this.useBrain) {
                // which output neuron is mapped to forward, left, etc. is completely arbitrary
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];

            }
        }
    }

    #assessDamage(roadBorders, traffic) {
        for (let i = 0; i < roadBorders.length; i++) {
            // roadborders are just lines, but that doesn't matter as a polygon can
            // just have two points (and thus 2 lines, A->B and B->A
            if (polysIntersect(this.polygon, roadBorders[i])) {
                return true;
            }
        }

        for (let i = 0; i < traffic.length; i++) {
            // roadborders are just lines, but that doesn't matter as a polygon can
            // just have two points (and thus 2 lines, A->B and B->A
            if (polysIntersect(this.polygon, traffic[i].getPolygon())) {
                return true;
            }
        }
        return false;
    }

    // figure out the points of the car
    #createPolygon() {
        // we can create any polygon we like, for now we just use a simple rectangle for the car
        // we calculate it from the position data we have from the car:
        // center of car (calculated from width/height) and angle
        const points = [];
        /*
        This is the car
        ------------------
        |        |     / |
        |        |    /  |
        |        |𝛼 /rad |
        |        |/      |
        |                |
        |                |
        |                |
        ------------------
         */
        // hypothenuse: the longes side of a right triangle (rechtwinkliges Dreieck)
        const rad = Math.hypot(this.width, this.height) / 2;
        /*
        ------------
        |         /|
        |        / |
        |       /  |
        |      /   |
        |     /    |
        |   /      |
        |𝛼/        |
        ------------
         */
        const alpha = Math.atan2(this.width, this.height);

        // top right point of the car
        points.push({
            x: this.x - Math.sin(this.angle - alpha) * rad,
            y: this.y - Math.cos(this.angle - alpha) * rad
        });
        // going counter-clockwise, next is upper left
        points.push({
            x: this.x - Math.sin(this.angle + alpha) * rad,
            y: this.y - Math.cos(this.angle + alpha) * rad
        });
        // lower left
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
        });
        // lower right
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
        });

        return points;
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

    draw(ctx, drawSensor = false) {
        if (this.sensor && drawSensor) {
            this.sensor.draw(ctx);
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.angle);
        if (!this.damaged) {

            ctx.drawImage(
                this.mask,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
        }

        ctx.globalCompositeOperation = "multiply";
        ctx.drawImage(
            this.img,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );
        ctx.restore();


    }

    getPolygon() {
        return this.polygon;
    }


}