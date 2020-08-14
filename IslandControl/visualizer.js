function Visualizer(log, container, settings) {
    var interval,
        frame = 0,
        rounds = log.history,
        lastFrameTime,
        context,
        canvas,
        islandRadius = 30,
        boardPadding = 10,
        islandCircleRadius,
        islandPositions,
        fillStyles = ['lightgreen', 'lightblue', 'lightpink', 'lightgoldenrodyellow'];

    this.play = function () {
        if (interval)
            clearInterval(interval);

        canvas = container.getElementsByTagName('canvas')[0];
        if (!canvas) {
            container.innerHTML = '<canvas style="height:100%;width:100%;"></canvas>';
            canvas = container.getElementsByTagName('canvas')[0];
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }

        context = canvas.getContext('2d');

        islandCircleRadius = Math.min(canvas.width, canvas.height) / 2 - islandRadius - boardPadding,
            centerX = canvas.width / 2,
            centerY = canvas.height / 2;

        islandPositions = rounds[0].islands.map(function (island, i) {
            var radAngle = 2 * Math.PI / log.board.islands.length * i;
            return {
                x: centerX + islandCircleRadius * Math.cos(radAngle),
                y: centerY + islandCircleRadius * Math.sin(radAngle)
            };
        });

        drawFrame(0);
        lastFrameTime = Date.now();

        interval = setInterval(refresh, settings.refreshRate);
    };

    this.stop = function () {
        clearInterval(interval);
    };

    function drawFrame() {
        var round = rounds[Math.floor(frame)];

        context.clearRect(0, 0, canvas.width, canvas.height);
        drawIslands(round.islands || []);
        drawMovement(round.movement || []);
    }

    function drawIslands(islands) {
        islands.forEach(function (island, i) {
            var position = islandPositions[i];
            context.beginPath();
            context.arc(position.x, position.y, islandRadius, 0, 2 * Math.PI, false);
            context.fillStyle = island.playerId == null ? 'gray' : fillStyles[island.playerId];
            context.fill();
            context.lineWidth = 2;
            context.strokeStyle = 'black';
            context.stroke();
            context.font = 'bold 20pt Calibri';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillStyle = 'black';
            context.fillText(island.units, position.x, position.y);
        });
    }

    function drawMovement(movement) {
        movement.forEach(function (movement) {
            var fromPosition = islandPositions[movement.from];
            var toPosition = islandPositions[movement.to];
            var percentComplete = 1 - (movement.roundsRemaining - frame % 1) / movement.distance;
            var position = {
                x: fromPosition.x + (toPosition.x - fromPosition.x) * percentComplete,
                y: fromPosition.y + (toPosition.y - fromPosition.y) * percentComplete
            };
            context.beginPath();
            context.arc(position.x, position.y, 15, 0, 2 * Math.PI, false);
            context.fillStyle = fillStyles[movement.playerId];
            context.fill();
            context.lineWidth = 1;
            context.strokeStyle = 'black';
            context.stroke();
            context.font = 'bold 15pt Calibri';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillStyle = 'black';
            context.fillText(movement.units, position.x, position.y);
        });
    }

    function refresh() {
        var now = Date.now();
        var frameDelta = lastFrameTime ? (now - lastFrameTime) * settings.speed * Math.abs(settings.speed) / 1000 : 0;
        lastFrameTime = now;
        var newFrame = Math.max(0, Math.min(frame + frameDelta, rounds.length - 1));
        if (newFrame === frame)
            return;

        frame = newFrame;
        drawFrame();
    }
}