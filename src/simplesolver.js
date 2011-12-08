var SimpleSolver = function() {
    this._steps = null;
    this._stepNeighbours = null;
    this._startCell = null;
    this._endCell = null;
    this._maze = null;
};

SimpleSolver.prototype = new Solver();

SimpleSolver.prototype.initialize = function(maze, startCell, endCell) {
    this._maze = maze;
    this._startCell = startCell;
    this._endCell = endCell;
    this._steps = [startCell];
    this._stepNeighbours = [startCell.getReachableNeighbours()];
};

SimpleSolver.prototype.getSolution = function() {
    return this._steps;
};

SimpleSolver.prototype.step = function() {
    var stepMade = false;

    var idx = this._steps.length - 1;
    var cur = this._steps[idx];
    if (cur !== this._endCell) {
        //We have not yet reached the end
        if (this._stepNeighbours[idx].length === 0) {
            //No more possibilities through current cell. Step back.
            this._stepNeighbours.pop();
            this._steps.pop();
        } else {
            var next = this._stepNeighbours[idx].pop();
            var reachable = next.getReachableNeighbours();
            var filtered = reachable.filter(function(n) { return n !== cur; });

            this._steps.push(next);
            this._stepNeighbours.push(filtered);
        }
        stepMade = true;
    }

    return stepMade;
};
