function Player() {
    this.makeMove = function () {
        return ['rock', 'paper', 'scissors', 'dynamite', 'waterballoon'][Math.floor(Math.random() * 5)];
    };
}