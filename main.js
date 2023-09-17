const carCanvas = document.getElementById('carCanvas');
carCanvas.height = window.innerHeight;
carCanvas.width = 200;
const carCtx = carCanvas.getContext("2d");

const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.height = window.innerHeight;
networkCanvas.width = 300;
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(
    carCanvas.width/2,
    carCanvas.width*0.9 // have the boundary lines a little inset
);
const car = new Car(
    road.getLaneCenter(1), // set car in the middle of the 2nd lane
    100,
    30,
    50,
    "AI"
);

const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2)
]

animate();

// time parameter is sent automatically to the callback (animate) by requestAnimationFrame
function animate(time) {

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.getBorders(), []);
    }

    car.update(road.getBorders(), traffic);

    // (re-)sizing the canvas also clears it, so we don't have to use clearRect
    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    // neat trick: move the canvas instead of the car
    // to keep the car in the same position on the screen while moving the road
    carCtx.translate(0, -car.y+carCanvas.height*0.7);

    road.draw(carCtx);

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx, "red");
    }

    car.draw(carCtx, "blue");

    carCtx.restore();

    // animate the lines in the direction from bottom nodes to output nodes
    networkCtx.lineDashOffset = -time/50;

    Visualizer.drawNetwork(networkCtx, car.brain);
    requestAnimationFrame(animate)
}

