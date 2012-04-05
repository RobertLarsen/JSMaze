var PrimMazeGenerator = function() {
    this.name = "Prim";
};
PrimMazeGenerator.prototype = new MazeGenerator();

PrimMazeGenerator.prototype.initialize = function(maze) {
    this._allCells = [];
    maze.eachCell(function(c) {
        this._allCells.push(c);
    }, this);

    this._maze = maze;
    this._unvisitedNeighbourFilter = function(cell) {
        return cell.hasAllWalls();
    };
    this._cloud = [this._allCells.random()];
    this._visited = 1;
};

PrimMazeGenerator.prototype.step = function() {
    var result = false,
        idx, cell, neighbours, next;
    if (this._visited < this._allCells.length) {
        idx = Math.floor(Math.random() * this._cloud.length);
        cell = this._cloud[idx];
        neighbours = cell.getAllNeighbours().filter(this._unvisitedNeighbourFilter);
        if (neighbours.length === 0) {
            /* This cell has no unvisited neighbours */
            this._cloud.splice(idx, 1);
        } else {
            next = neighbours.random();
            cell.breakWallTo(next);
            this._cloud.push(next);
            this._visited++;
        }
        result = true;
    }
    return result;
};
