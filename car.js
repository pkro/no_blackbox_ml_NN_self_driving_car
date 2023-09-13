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
        this.damaged = false;

        this.steeringAngleIncrease = 0.03;

        this.controls = new Controls();
        this.sensor = new Sensor(this);

    }

    update(roadBorders) {
        if (!this.damaged) {
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders);
        }
        this.sensor.update(roadBorders)
    }

    #assessDamage(roadBorders) {
        for (let i = 0; i < roadBorders.length; i++) {
            // roadborders are just lines, but that doesn't matter as a polygon can
            // just have two points (and thus 2 lines, A->B and B->A
            if(polysIntersect(this.polygon, roadBorders[i])) {
                return true;
            }
        }
        return false;
    }

    // figure out the points of the car
    #createPolygon(){
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
        const rad = Math.hypot(this.width, this.height)/2;
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
            x:this.x-Math.sin(this.angle-alpha)*rad,
            y:this.y-Math.cos(this.angle-alpha)*rad
        });
        // going counter-clockwise, next is upper left
        points.push({
            x:this.x-Math.sin(this.angle+alpha)*rad,
            y:this.y-Math.cos(this.angle+alpha)*rad
        });
        // lower left
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle-alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle-alpha)*rad
        });
        // lower right
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle+alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle+alpha)*rad
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

    draw(ctx){
        ctx.fillStyle="black";
        if (this.damaged) {
            ctx.fillStyle="red";
        }

        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x,this.polygon[0].y);
        for(let i=1;i<this.polygon.length;i++){
            ctx.lineTo(this.polygon[i].x,this.polygon[i].y);
        }
        ctx.fill();

        this.sensor.draw(ctx);
    }


}