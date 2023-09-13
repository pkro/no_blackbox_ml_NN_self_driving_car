class Road {
    constructor(x, width, laneCount = 3) {
        this.x = x; // the x middle point of the lane
        this.width = width;
        this.laneCount = laneCount;

        this.left = x - width / 2; // leftmost / rightmost points of the lane
        this.right = x + width / 2;

        // we define our own infinity as the js Infinity leads to weirdness when drawing things
        const infinity = 10000000;
        this.top = -infinity;
        this.bottom = infinity;

        const topLeft = {x: this.left, y: this.top};
        const topRight = {x: this.right, y: this.top};
        const bottomLeft = {x: this.left, y: this.bottom};
        const bottomRight = {x: this.right, y: this.bottom};

        // we use an array because later, we might want to have borders in the middle or sth
        this.borders = [
            // we use arrays for the lines (instead of an object with start/end points)
            // because we might want to add more lines for curves etc. later
            [topLeft, bottomLeft],
            [topRight, bottomRight]
        ];
    }

    getBorders() {
        return this.borders;
    }

    // laneIndex is 0-based, meaning 0 is the leftmost lane
    getLaneCenter(laneIndex) {
        if (laneIndex > this.laneCount - 1) {
            laneIndex = this.laneCount - 1;
        }
        if (laneIndex < 0) {
            laneIndex = 0;
        }
        const laneWidth = this.width / this.laneCount;
        return this.left + laneWidth / 2 + laneIndex * laneWidth;
    }

    draw(ctx) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = "white";

        // draw the middle lane lines
        for (let i = 1; i <= this.laneCount - 1; i++) {
            const x = lerp(
                this.left,
                this.right,
                i / this.laneCount // between 0-1
            );
            ctx.beginPath();
            // the middle lanes are dashed
            if (i > 0 && i < this.laneCount) {
                ctx.setLineDash([20, 4]);
            }
            ctx.moveTo(x, this.top);
            ctx.lineTo(x, this.bottom);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // draw road borders
        this.borders.forEach(border => {
            ctx.beginPath();
            border.forEach((point, idx) => {
                if (idx === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            });
            ctx.stroke();
        });

    }
}


