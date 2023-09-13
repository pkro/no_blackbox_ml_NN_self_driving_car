const canvas = document.getElementById('myCanvas');
canvas.height = window.innerHeight;
canvas.width = 200;

const ctx = canvas.getContext("2d");
const road = new Road(
    canvas.width/2,
    canvas.width*0.9 // have the boundary lines a little inset
);
const car = new Car(
    road.getLaneCenter(1), // set car in the middle of the 2nd lane
    100, 30, 50);

animate();

function animate() {
    car.update(road.getBorders());

    // (re-)sizing the canvas also clears it, so we don't have to use clearRect
    canvas.height = window.innerHeight;

    ctx.save();
    // neat trick: move the canvas instead of the car
    // to keep the car in the same position on the screen while moving the road
    ctx.translate(0, -car.y+canvas.height*0.7);

    road.draw(ctx);
    car.draw(ctx);

    ctx.restore();
    requestAnimationFrame(animate)
}

