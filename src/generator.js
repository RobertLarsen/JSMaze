var MazeGenerator = function() {
};

MazeGenerator.prototype.initialize = function(maze) {
};

MazeGenerator.prototype.step = function() {
    return false;
}

MazeGenerator.prototype.generate = function(maze) {
    this.initialize(maze);
    while (this.step()) { }
    return maze;
};
