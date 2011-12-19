var HexMaze = function(rows, cols, radius) {
    this.rows = rows;
    this.cols = cols;
    this.radius = radius;
    this.cells = [];
    for (var r = 0; r < rows; r++) {
        var row = [];
        this.cells.push(row);
        for (var c = 0; c < (r % 2 === 0 ? cols : cols - 1); c++) {
            row.push(new HexMaze.Cell(this, r, c));
        }
    }
};
HexMaze.prototype = new Maze();

HexMaze.PI2_6 = Math.PI * 2 / 6;
HexMaze.COS_TABLE = [
    Math.cos(HexMaze.PI2_6 * 0),
    Math.cos(HexMaze.PI2_6 * 1),
    Math.cos(HexMaze.PI2_6 * 2),
    Math.cos(HexMaze.PI2_6 * 3),
    Math.cos(HexMaze.PI2_6 * 4),
    Math.cos(HexMaze.PI2_6 * 5),
    Math.cos(HexMaze.PI2_6 * 6)
];
HexMaze.SIN_TABLE = [
    Math.sin(HexMaze.PI2_6 * 0),
    Math.sin(HexMaze.PI2_6 * 1),
    Math.sin(HexMaze.PI2_6 * 2),
    Math.sin(HexMaze.PI2_6 * 3),
    Math.sin(HexMaze.PI2_6 * 4),
    Math.sin(HexMaze.PI2_6 * 5),
    Math.sin(HexMaze.PI2_6 * 6)
];

HexMaze.prototype.getCellRadius = function() {
    return this.radius;
};

HexMaze.prototype.eachCell = function(callback, obj) {
    for (var r = 0; r < this.cells.length; r++) {
        for (var c = 0; c < this.cells[r].length; c++) {
            callback.call(obj || window, this.cells[r][c], r, c);
        }
    }
};

HexMaze.prototype.getCell = function(row, col) {
    if (row >= 0 && col >= 0 && row < this.cells.length && col < this.cells[row].length) {
        return this.cells[row][col];
    }
};

HexMaze.Cell = function(maze, row, col) {
    this.maze = maze;
    this.row = row;
    this.col = col;
    this.walls = [true, true, true];
};

HexMaze.Cell.prototype = new Maze.Cell();

HexMaze.Cell.ALL        = -1;
HexMaze.Cell.SOUTH_EAST = 0;
HexMaze.Cell.SOUTH      = 1;
HexMaze.Cell.SOUTH_WEST = 2;
HexMaze.Cell.NORTH_WEST = 3;
HexMaze.Cell.NORTH      = 4;
HexMaze.Cell.NORTH_EAST = 5;

HexMaze.Cell.prototype.getCenter = function() {
    var r = this.maze.getCellRadius();
    var halfHeight = HexMaze.SIN_TABLE[1] * r;

    var x = (this.row % 2 === 0) ? (3 * r) * this.col + r : 2 * r * (this.col + 1) + (r / 2) * (this.col * 2 + 1);
    var y = (this.row + 1) * halfHeight;

    return { 'y' : y, 'x' : x };
};

HexMaze.Cell.prototype.paint = function(context) {
    var r = this.maze.getCellRadius();

    var center = this.getCenter();

    context.save();
    for (var i = 0; i < 6; i++) {
        if (this.hasWall(i)) {
            context.beginPath();
            context.moveTo(center.x + HexMaze.COS_TABLE[i] * r, center.y + HexMaze.SIN_TABLE[i] * r);
            context.lineTo(center.x + HexMaze.COS_TABLE[i + 1] * r, center.y + HexMaze.SIN_TABLE[i + 1] * r);
            context.stroke();
        }
    }
    context.restore();
};

HexMaze.Cell.prototype.getId = function() {
    return this.row * this.maze.cells.length + this.col;
};

HexMaze.Cell.prototype.hasWall = function(idx) {
    switch (idx) {
        case HexMaze.Cell.SOUTH_EAST : return this.hasSouthEast();
        case HexMaze.Cell.SOUTH      : return this.hasSouth();
        case HexMaze.Cell.SOUTH_WEST : return this.hasSouthWest();
        case HexMaze.Cell.NORTH_WEST : return this.hasNorthWest();
        case HexMaze.Cell.NORTH      : return this.hasNorth();
        case HexMaze.Cell.NORTH_EAST : return this.hasNorthEast();
        case HexMaze.Cell.ALL        : return this.hasSouthEast() &&
                                              this.hasSouth()     &&
                                              this.hasSouthWest() &&
                                              this.hasNorthWest() &&
                                              this.hasNorth()     &&
                                              this.hasNorthEast();

    }
};

HexMaze.Cell.prototype.hasAllWalls = function() {
    return this.hasWall(HexMaze.Cell.ALL);
};

HexMaze.Cell.prototype.breakWall = function(idx) {
    switch (idx) {
        case HexMaze.Cell.SOUTH_EAST : return this.breakSouthEast();
        case HexMaze.Cell.SOUTH      : return this.breakSouth();
        case HexMaze.Cell.SOUTH_WEST : return this.breakSouthWest();
        case HexMaze.Cell.NORTH_WEST : return this.breakNorthWest();
        case HexMaze.Cell.NORTH      : return this.breakNorth();
        case HexMaze.Cell.NORTH_EAST : return this.breakNorthEast();
    }
};

HexMaze.Cell.prototype.breakWallTo = function(neighbour) {
    var direction = this.getNeighbourDirection(neighbour);
    this.breakWall(direction);
};

HexMaze.Cell.prototype.getNeighbour = function(direction) {
    switch (direction) {
        case HexMaze.Cell.SOUTH_EAST : return this.maze.getCell(this.row + 1, (this.row % 2 === 0) ? this.col : this.col + 1);
        case HexMaze.Cell.SOUTH      : return this.maze.getCell(this.row + 2, this.col);
        case HexMaze.Cell.SOUTH_WEST : return this.maze.getCell(this.row + 1, (this.row % 2 === 0) ? this.col - 1 : this.col);
        case HexMaze.Cell.NORTH_WEST : return this.maze.getCell(this.row - 1, (this.row % 2 === 0) ? this.col - 1 : this.col);
        case HexMaze.Cell.NORTH      : return this.maze.getCell(this.row - 2, this.col);
        case HexMaze.Cell.NORTH_EAST : return this.maze.getCell(this.row - 1, (this.row % 2 === 0) ? this.col : this.col + 1);
        case HexMaze.Cell.ALL        :
            var neighbours = [];
            for (var i = 0; i < 6; i++) {
                var n = this.getNeighbour(i);
                if (n) {
                    neighbours.push(n);
                }
            }
            return neighbours;
    }
};

Maze.Cell.prototype.getAllNeighbours = function() {
    return this.getNeighbour(HexMaze.Cell.ALL);
};

HexMaze.Cell.prototype.getNeighbourDirection = function(neighbour) {
    for (var i = 0; i < 6; i++) {
        if (this.getNeighbour(i) === neighbour) {
            return i;
        }
    }
};

HexMaze.Cell.prototype.canEnter = function(neighbour) {
    var direction = this.getNeighbourDirection(neighbour);
    return !this.hasWall(direction);
};

HexMaze.Cell.prototype.hasNorth = function() {
    var north = this.getNeighbour(HexMaze.Cell.NORTH);
    return north ? north.hasSouth() : true;
};

HexMaze.Cell.prototype.hasNorthWest = function() {
    var northWest = this.getNeighbour(HexMaze.Cell.NORTH_WEST);
    return northWest ? northWest.hasSouthEast() : true;
};

HexMaze.Cell.prototype.hasNorthEast = function() {
    var northEast = this.getNeighbour(HexMaze.Cell.NORTH_EAST);
    return northEast ? northEast.hasSouthWest() : true;
};

HexMaze.Cell.prototype.hasSouthEast = function() {
    return this.walls[HexMaze.Cell.SOUTH_EAST];
};

HexMaze.Cell.prototype.hasSouth = function() {
    return this.walls[HexMaze.Cell.SOUTH];
};

HexMaze.Cell.prototype.hasSouthWest = function() {
    return this.walls[HexMaze.Cell.SOUTH_WEST];
};

HexMaze.Cell.prototype.breakNorth = function() {
    var north = this.getNeighbour(HexMaze.Cell.NORTH);
    north && north.breakSouth();
};

HexMaze.Cell.prototype.breakNorthWest = function() {
    var northWest = this.getNeighbour(HexMaze.Cell.NORTH_WEST);
    northWest && northWest.breakSouthEast();
};

HexMaze.Cell.prototype.breakNorthEast = function() {
    var northEast = this.getNeighbour(HexMaze.Cell.NORTH_EAST);
    northEast && northEast.breakSouthWest();
};

HexMaze.Cell.prototype.breakSouthEast = function() {
    this.walls[HexMaze.Cell.SOUTH_EAST] = false;
};

HexMaze.Cell.prototype.breakSouth = function() {
    this.walls[HexMaze.Cell.SOUTH] = false;
};

HexMaze.Cell.prototype.breakSouthWest = function() {
    this.walls[HexMaze.Cell.SOUTH_WEST] = false;
};
