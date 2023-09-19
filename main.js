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

const cars = generateCars(1000);
let bestCar = cars[0];

// if we already saved a best car, set car[0]'s brain to the saved one
if(localStorage.getItem("bestBrain")){
    for(let i=0; i<cars.length; i++) {

        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
        // keep the last saved best brain for first car
        // and mutate all other cars based on the weights and biases of the first car
        // with a step of 0.1
        if(i>0) {
            NeuralNetwork.mutate(cars[i].brain, 0.1);
        }
    }
    bestCar.brain = JSON.parse(
        localStorage.getItem('bestBrain')
    );
}

const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY",2, getRandomColor()),
    new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(2), -700, 30, 50, "DUMMY",2,getRandomColor()),
]

animate();

function save() {
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain))
}

function discard() {
    localStorage.removeItem("bestBrain")
}

function generateCars(N) {
    const cars = [];
    for (let i = 1; i <= N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
    }
    return cars;
}

// time parameter is sent automatically to the callback (animate) by requestAnimationFrame
function animate(time) {

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.getBorders(), []);
    }

    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.getBorders(), traffic);
    }

    // "fitness function"
    // find the car with the lowest y value (meaning it's the furthest car,
    // given that the canvas is 0 at the top)
    // the car can change with each iteration
    // if the road had turns, we would have to think of a different one
    // that takes other things into account as y-position wouldn't be
    // a good measure anymore
    bestCar = cars.find(c=>c.y===Math.min(...cars.map(c=>c.y)));

    // (re-)sizing the canvas also clears it, so we don't have to use clearRect
    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    // neat trick: move the canvas instead of the car
    // to keep the car in the same position on the screen while moving the road
    carCtx.translate(0, -bestCar.y+carCanvas.height*0.7);

    road.draw(carCtx);

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx, "red");
    }

    // draw the cars transparent
    carCtx.globalAlpha = 0.2;
    for (let i = 0; i <cars.length; i++) {
       cars[i].draw(carCtx, "blue");
    }
    carCtx.globalAlpha = 1;

    // draw the first car (that the screen is centerd on) without transparency
    bestCar.draw(carCtx, "blue", true);

    carCtx.restore();

    // animate the lines in the direction from bottom nodes to output nodes
    networkCtx.lineDashOffset = -time/50;

    Visualizer.drawNetwork(networkCtx, bestCar.brain);
    requestAnimationFrame(animate)
}

