function Game() {
    function findFirst(array, condition) {
        for (var i = 0; i < array.length; i++) {
            if (i in array) {
                var item = array[i];
                if (condition(item)) {
                    return item;
                }
            }
        }

        return undefined;
    }

    function concat(arrays) {
        return Array.prototype.concat.apply([], arrays);
    }

    function ensure(object, property, factory) {
        return object[property] || (object[property] = factory());
    }

    function group(array, keySelector) {
        var keyBuckets = {};

        array.forEach(function (item) {
            var key = keySelector(item);
            var keyBucket = ensure(keyBuckets, key, Array);
            var bucket = findFirst(keyBucket, function (b) { return b.key === key; });
            if (!bucket) {
                bucket = [];
                bucket.key = key;
                keyBucket.push(bucket);
            }
            bucket.push(item);
        });

        var buckets = Object.keys(keyBuckets).map(function (key) { return keyBuckets[key]; });

        return concat(buckets);
    }

    function processBattle(battle, board) {
        var island = board.islands[battle.key];

        if (island.playerId != null)
            battle.push(island);

        battle = group(battle, function (b) { return b.playerId; })
            .map(function (g) {
                return {
                    playerId: g.key,
                    units: g.reduce(function (sum, move) { return sum + move.units; }, 0)
                };
            })
            .sort(function (a, b) { return b.units - a.units; });

        var winner = battle[0];
        if (battle.length > 1)
            winner.units -= battle[1].units;

        island.units = winner.units;
        island.playerId = winner.units === 0 ? null : winner.playerId;
    }

    function shortestDistance(a, b, length) {
        return Math.min((a - b + length) % length, (b - a + length) % length);
    }

    function processBoard(board, newMoves) {
        var errors = [];
        var actions = [];

        board.movement.forEach(function (m) { m.roundsRemaining -= 1; });

        newMoves.forEach(function (move) {
            var island = board.islands[move.from];
            move.units = Math.floor(island.units / 2);
            island.units -= move.units;
            board.movement.push(move);
        });

        board.islands.forEach(function (island) { if (island.playerId != null) island.units += 1; });

        var endingMoves = [],
            continuingMoves = [];

        board.movement.forEach(function (m) {
            (m.roundsRemaining === 0 ? endingMoves : continuingMoves).push(m);
        });

        var battleGroups = group(endingMoves, function (m) { return m.to; });

        battleGroups.forEach(function (b) {
            processBattle(b, board);
        });

        board.movement = continuingMoves;

        return {
            actions: actions,
            errors: errors
        };
    }

    function createBoard(players) {
        var islandSets = players.map(function (p) {
            return [
                { playerId: p.id, units: 10 },
                { playerId: null, units: 0 },
                { playerId: null, units: 0 },
                { playerId: null, units: 0 },
                { playerId: null, units: 0 }
            ];
        });

        var islands = concat(islandSets);
        islands.forEach(function (island, index) { island.position = index; });

        return {
            islands: islands,
            movement: []
        };
    }

    function pushHistory(history, board) {
        history.push({
            islands: board.islands
              .map(function (i) {
                  return {
                      playerId: i.playerId,
                      units: i.units
                  };
              }),
            movement: board.movement
              .map(function (m) {
                  return {
                      playerId: m.playerId,
                      units: m.units,
                      from: m.from,
                      to: m.to,
                      roundsRemaining: m.roundsRemaining,
                      distance: m.distance
                  };
              })
        });
    };

    function getActivePlayers(board) {
        return board.islands.concat(board.movement).reduce(function (ids, thing) {
            if (thing.playerId != null && ids.indexOf(thing.playerId) === -1)
                ids.push(thing.playerId);

            return ids;
        }, []);
    }

    function getMovesFunction(board, players) {
        return function (playerId) {
            var boardClone = JSON.parse(JSON.stringify(board));
            var player = players[playerId];
            var moves = player.instance.makeMoves(boardClone);

            var validMoves = moves.filter(function (move) {
                var fromIsland = board.islands[move.from];
                var toIsland = board.islands[move.to];
                return fromIsland && toIsland && fromIsland.playerId == playerId && fromIsland.units > 1;
            });

            return validMoves.map(function (move) {
                var distance = shortestDistance(move.from, move.to, board.islands.length) * 2;
                return {
                    from: move.from,
                    to: move.to,
                    distance: distance,
                    roundsRemaining: distance,
                    playerId: playerId
                };
            });
        };
    }

    this.play = function (players, done) {
        players.forEach(function (player, index) {
            player.realId = player.id;
            player.id = index;
            player.instance = new player.constructor(player.id);
        });

        var board = createBoard(players),
            history = [],
            activePlayerIds = players.map(function (p) { return p.id; });

        pushHistory(history, board);

        var getMoves = getMovesFunction(board, players);

        var round;
        for (round = 0; round < 1000 && activePlayerIds.length > 1; round++) {
            var newMoves = concat(activePlayerIds.map(getMoves));

            processBoard(board, newMoves);

            pushHistory(history, board);

            activePlayerIds = getActivePlayers(board);
        }

        done({
            board: board,
            history: history,
            rounds: round
        });
    };
}