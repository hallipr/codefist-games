function Player(id) {
    this.makeMoves = function (board) {
        // board
        // {
        //     islands: [
        //         { position: 0, playerId: 0, units: 12 },
        //         { position: 1, units: 0 },
        //         { position: 2, playerId: 1, units: 15 },
        //         ...
        //     ],
        //     movement: [
        //         { from: 2, to: 0, playerId: 1, units: 8, distance: 4, roundsRemaining: 1 },
        //         { from: 6, to: 1, playerId: 0, units: 5, distance: 10, roundsRemaining: 9 },
        //         ...
        //     ]
        // }

        return [                 // Array of moves
            { from: 0, to: 3 },  // from: island to move from
            { from: 2, to: 1 }   // to: island to move to
        ];
    };
}