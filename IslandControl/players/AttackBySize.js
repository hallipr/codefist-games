function Player(id) {
    this.makeMoves = function (board) {
        var islands = board.islands;

        var mine = islands.filter(function (island) { return island.units > 5 && island.playerId == id; })
          .sort(function (a, b) { return a.units - b.units; });

        var notMine = islands.filter(function (island) { return island.playerId != id; })
          .sort(function (a, b) { return a.units - b.units; });


        var moves = [];
        for (var i = 0; i < mine.length && i < notMine.length; i++) {
            moves.push({
                from: mine[i].position,
                to: notMine[i].position
            });
        }

        return moves;
    };
}