var DFSMazeGenerator = function() {
    this.name = "DFS";
};
DFSMazeGenerator.prototype = new MazeGenerator();

DFSMazeGenerator.prototype.initialize = function(maze) {
    this._allCells = [];
    maze.eachCell(function(c) {
        this._allCells.push(c);
    }, this);
    this._maze = maze;
    this._current = this._allCells.random();
    this._stack = [];
    this._visited = 1;
    this._unvisitedNeighbourFilter = function(cell) {
        return cell.hasAllWalls();
    };
};

DFSMazeGenerator.prototype.step = function() {
    var result = false;
    if (this._visited < this._allCells.length) {
        var neighbours = this._current.getAllNeighbours().filter(this._unvisitedNeighbourFilter);
        if (neighbours.length === 0) {
            /* No unvisited neighbours */
            this._current = this._stack.pop();
        } else {
            var next = neighbours.random();
            this._current.breakWallTo(next);
            this._stack.push(this._current);
            this._current = next;
            this._visited++;
        }
        result = true;
    }
    return result;
};
