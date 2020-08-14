function Game() {
    var moves = {
        rock: "rock",
        paper: "paper",
        scissors: "scissors",
        dynamite: "dynamite",
        waterballoon: "waterballoon",
        trash: "trash"
    };

    // Play the game
    var betterMoves = {
        rock: [moves.paper, moves.dynamite],
        paper: [moves.scissors, moves.dynamite],
        scissors: [moves.rock, moves.dynamite],
        dynamite: [moves.waterballoon],
        waterballoon: [moves.rock, moves.paper, moves.scissors],
        trash: [moves.rock, moves.paper, moves.scissors, moves.waterballoon, moves.dynamite]
    };

    var getWinningIndex = function (moves) {
        var move0 = moves[0].value;
        var move1 = moves[1].value;

        if (move0 === move1)
            return -1;

        return betterMoves[move0].indexOf(move1) == -1 ? 0 : 1;
    }

    var getPlayerMove = function (player) {
        var move = player.instance.makeMove();

        var value = move.toLowerCase();

        if (!moves.hasOwnProperty(move))
            value = moves.trash;

        if (value === moves.dynamite) {
            if (player.dynamiteRemaining === 0) {
                value = moves.trash;
            } else {
                player.dynamiteRemaining--;
            }
        }

        return { move: move, value: value };
    };

    this.play = function (players, done) {
        players.forEach(function (player) {
            player.instance = new player.constructor();
            player.dynamiteRemaining = 100;
            player.score = 0;
        });

        var history = [];

        var roundPoints = 1;
        for (var round = 0; round < 1000; round++) {
            var playerMoves = players.map(getPlayerMove);

            var winningIndex = getWinningIndex(playerMoves);

            if (winningIndex === -1) {
                roundPoints++;
            } else {
                players[winningIndex].score += roundPoints;
                roundPoints = 1;
            }

            history.push({ moves: [playerMoves[0].move, playerMoves[1].move], winner: winningIndex });
        }

        var score0 = players[0].score;
        var score1 = players[1].score;

        done({
            players: players,
            winner: score0 === score1 ? null : score0 > score1 ? 0 : 1,
            history: history
        });
    };
}