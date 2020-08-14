function Player(id) {
    this.makeMoves = function (board) {
        var islands = board.islands;

        return islands.map(function (island) {
            return {
                from: island.position,
                to: (island.position - 1 + islands.length) % islands.length
            };
        });
    };
}