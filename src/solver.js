var Solver = function() { };
Solver.prototype.initialize = function(maze, start, end) { };
Solver.prototype.step = function() { return false; };
Solver.prototype.getSolution = function() { return null; };

Solver.prototype.generate = function(maze, start, end) {
    this.initialize(maze, start, end);
    while (this.step()) {
    }
    return this.getSolution();
};

Solver.prototype.paint = function(context) {
    var previous = null;
    var current = null;
    this.getSolution().forEach(function(next) {
        if (current !== null) {
            current.paintPathThrough(context, previous, next);
        }
        previous = current;
        current = next;
    });
};
