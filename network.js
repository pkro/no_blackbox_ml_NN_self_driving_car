class NeuralNetwork {
    constructor(neuronCounts) {
        // neuronCounts is an array of numbers,starting with an input count,
        // an arbitrary number of hidden / middle layers and the output count
        // e.g. [6, 5, 5, 4]
        this.levels = [];

        for (let i = 0; i < neuronCounts.length-1; i++) {
            this.levels.push(new Level(neuronCounts[i], neuronCounts[i+1]))
        }
    }

    static feedForward(givenInputs, network) {
        let outputs = Level.feedForward(givenInputs, network.levels[0]);


        for (let i = 1; i < network.levels.length; i++) {
            outputs = Level.feedForward(outputs, network.levels[i]);
        }

        return outputs
    }

    static mutate(network, amount = 1) {
        // amount = 0 -> weights / biases stay the same
        // amount = 1 -> weights / biases are assigned a random value
        // amount between 0 and 1: weights / biases are assigned a value between the current and a random value
        network.levels.forEach(level=>{
            for (let i = 0; i < level.biases.length; i++) {
                level.biases[i] = lerp(
                    level.biases[i],
                    Math.random()*2-1,
                    amount
                )
            }
            for (let i = 0; i < level.weights.length; i++) {
                for (let j = 0; j < level.weights[i].length; j++) {
                    level.weights[i][j] = lerp(
                        level.weights[i][j],
                        Math.random() * 2 - 1,
                        amount
                    )
                }
            }
        });
    }
}

class Level {
    constructor(inputCount, outputCount) {
        // Initialize arrays for inputs, outputs, and biases.
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);
        this.biases = new Array(outputCount);

        this.weights = [];

        // Create a 2D array for weights between input and output neurons.
        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array(outputCount);
        }

        // Randomize initial weights and biases.
        Level.#randomize(this);
    }

    // Randomizes the weights and biases of the given level so we have a starting point for learning
    // this also means that upon refresh the outputs (forward, left, right, reverse) are random
    static #randomize(level) {
        for (let i = 0; i < level.inputs.length; i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                // Initialize weights with random values between -1 and 1.
                // Negative weights can discourage certain behaviors, e.g., "don't turn in my direction."
                level.weights[i][j] = Math.random() * 2 - 1;
            }
        }

        for (let i = 0; i < level.biases.length; i++) {
            // Initialize biases with random values between -1 and 1.
            level.biases[i] = Math.random() * 2 - 1;
        }
    }

    // Perform the feed-forward computation for a given level.
    // computes the output of each neuron in the output layer.
    // It does this by first performing a weighted sum of the inputs
    // and then applying a step function based on the bias.
    // Note that the step function used here is very basic (it's just a binary step based on the bias);
    // more complex neural networks usually use activation functions like Sigmoid, ReLU, etc.
    static feedForward(givenInputs, level) {
        // Copy the given inputs into the level's inputs.
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = givenInputs[i];
        }

        // Calculate the output for each neuron in the output layer.
        for (let i = 0; i < level.outputs.length; i++) {
            let sum = 0;
            // Perform the weighted sum of inputs for each output neuron.
            for (let j = 0; j < level.inputs.length; j++) {
                sum += level.inputs[j] * level.weights[j][i];
            }

            // Apply the bias and a step function to get the output.
            // If the sum is greater than the bias, output 1; otherwise, output 0.
            // we later use the 1/0 for the controls states (forward, left, right, reverse)
            // like "up key pressed" = 1, "up key NOT pressed" = 0
            if (sum > level.biases[i]) {
                level.outputs[i] = 1;
            } else {
                level.outputs[i] = 0;
            }
        }

        // Return the calculated outputs.
        return level.outputs;
    }
}
