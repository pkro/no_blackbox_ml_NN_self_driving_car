class Visualizer {
    static drawNetwork(ctx, network) {
        const margin = 50;
        const left = margin;
        const top = margin;
        const width = ctx.canvas.width - margin * 2;
        const height = ctx.canvas.height - margin * 2;

        const levelHeight = height / network.levels.length;

        // we draw backwards because otherwise, when drawing the middle layers twice,
        // we lose the bias circles in the middle layers (?)
        for (let i =  network.levels.length-1; i >=0; i--) {
            const levelTop = top + lerp(
                height - levelHeight,
                0,
                network.levels.length === 1
                    ? 0.5
                    : i / (network.levels.length - 1)
            );


            ctx.setLineDash([7, 4]);

            Visualizer.drawLevel(
                ctx,
                network.levels[i],
                left,
                levelTop,
                width,
                levelHeight,
                i === network.levels.length-1
                    ? ['⇧', '⇦', '⇨', '⇩']
                    : []);
        }
    }

    static drawLevel(ctx, level, left, top, width, height, outputLabels=[]) {
        const right = left + width;
        const bottom = top + height;

        const nodeRadius = 18;
        const {inputs, outputs, weights, biases} = level;

        // draw connections
        for (let i = 0; i < inputs.length; i++) {
            for (let j = 0; j < outputs.length; j++) {
                ctx.beginPath();
                ctx.moveTo(
                    Visualizer.#getNodeX(inputs, i, left, right),
                    bottom);
                ctx.lineTo(
                    Visualizer.#getNodeX(outputs, j, left, right),
                    top);
                ctx.lineWidth = 2;

                const value = weights[i][j];

                // yellow = positive, blue = negative
                // transparency: lighter closer to 0, stronger closer to -1 / 1
                ctx.strokeStyle = getRGBA(value);
                ctx.stroke();
            }
        }

        // draw input layer nodes
        for (let i = 0; i < inputs.length; i++) {
            const x = Visualizer.#getNodeX(inputs, i, left, right);

            // draw node in black first with full radius so the connecting lines don't go
            // through the outer "bias circle"
            ctx.beginPath();
            ctx.arc(x, bottom, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = "black";
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, bottom, nodeRadius * 0.6, 0, Math.PI * 2);
            // inputs are between 0 and 1, so they are shades of yellow to black
            ctx.fillStyle = getRGBA(inputs[i]);
            ctx.fill();
        }

        // draw output layer nodes with biases
        for (let i = 0; i < outputs.length; i++) {
            const x = Visualizer.#getNodeX(outputs, i, left, right);

            ctx.beginPath();
            ctx.arc(x, top, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = "black";
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, top, nodeRadius * 0.6, 0, Math.PI * 2);

            // outputs are (at this point) just either 0 or 1, so they are either fully yellow or fully black
            // see Level.feedForward
            ctx.fillStyle = getRGBA(outputs[i]);
            ctx.fill();

            if (outputLabels[i]) {
                ctx.beginPath();
                ctx.font = nodeRadius * 1.1 + "px Arial";
                ctx.fillStyle = "black";
                ctx.strokeStyle = "white";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fontWeight = "bold";
                ctx.fillText(outputLabels[i], x, top+nodeRadius*0.1);
                ctx.lineWidth = 0.5;
                ctx.strokeText(outputLabels[i], x, top+nodeRadius*0.1);

            }

            // draw bias circles around nodes
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.arc(x, top, nodeRadius * 0.8, 0, Math.PI * 2);
            ctx.strokeStyle = getRGBA(biases[i]);
            ctx.setLineDash([3, 3]);
            ctx.stroke();
            ctx.setLineDash([]);

        }


    }

    static #getNodeX(nodes, index, left, right) {
        return lerp(
            left,
            right,
            nodes.length === 1
                ? 0.5 // center
                : index / (nodes.length - 1));
    }
}