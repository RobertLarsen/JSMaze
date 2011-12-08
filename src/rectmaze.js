var RectMaze = function(rows, cols, cellWidth, cellHeight) {
    this._rows = rows;
    this._cols = cols;
    this._cellWidth = cellWidth;
    this._cellHeight= cellHeight;
    this._cells = [];
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
            this._cells.push(new RectMaze.Cell(this, r, c));
        }
    }
};
RectMaze.prototype = new Maze();

RectMaze.prototype.eachCell = function(callback, obj) {
    this._cells.forEach(callback, obj);
};

RectMaze.prototype.getCell = function(row, col) {
    if (row >= 0 && row < this._rows && col >= 0 && col < this._cols) {
        return this._cells[row * this._cols + col];
    }
};
 
RectMaze.Cell = function(maze, row, col) {
    this._maze = maze;
    this._row = row;
    this._col = col;
    this._walls = [true, true];
};
RectMaze.Cell.prototype = new Maze.Cell();

RectMaze.Cell.ALL   = -1;
RectMaze.Cell.EAST  =  0;
RectMaze.Cell.SOUTH =  1;
RectMaze.Cell.WEST  =  2;
RectMaze.Cell.NORTH =  3;

RectMaze.Cell.prototype.getId = function() {
    return this._row * this._maze._cols + this._col;
};

RectMaze.Cell.prototype.hasWall = function(direction) {
    switch (direction) {
        case RectMaze.Cell.NORTH : return this.hasNorthWall();
        case RectMaze.Cell.SOUTH : return this.hasSouthWall();
        case RectMaze.Cell.EAST  : return this.hasEastWall();
        case RectMaze.Cell.WEST  : return this.hasWestWall();
        case RectMaze.Cell.ALL   : return this.hasNorthWall() &&
                                          this.hasSouthWall() &&
                                          this.hasEastWall() &&
                                          this.hasWestWall();
    }
};

RectMaze.Cell.prototype.hasEastWall = function() {
    return this._walls[RectMaze.Cell.EAST];
};

RectMaze.Cell.prototype.hasSouthWall = function() {
    return this._walls[RectMaze.Cell.SOUTH];
};

RectMaze.Cell.prototype.hasWestWall = function() {
    var n = this.getNeighbour(RectMaze.Cell.WEST);
    return n ? n.hasEastWall() : true;
};

RectMaze.Cell.prototype.hasNorthWall = function() {
    var n = this.getNeighbour(RectMaze.Cell.NORTH);
    return n ? n.hasSouthWall() : true;
};

RectMaze.Cell.prototype.getNeighbour = function(direction) {
    switch (direction) {
        case RectMaze.Cell.NORTH : return this._maze.getCell(this._row - 1, this._col);
        case RectMaze.Cell.SOUTH : return this._maze.getCell(this._row + 1, this._col);
        case RectMaze.Cell.EAST  : return this._maze.getCell(this._row, this._col + 1);
        case RectMaze.Cell.WEST  : return this._maze.getCell(this._row, this._col - 1);
        case RectMaze.Cell.ALL   :
            var neighbours = [];
            for (var i = 0; i < 4; i++) {
                var n = this.getNeighbour(i);
                if (n) {
                    neighbours.push(n);
                }
            }
            return neighbours;
    }
};

RectMaze.Cell.prototype.getNeighbourDirection = function(neighbour) {
    for (var i = 0; i < 4; i++) {
        if (this.getNeighbour(i) === neighbour) {
            return i;
        }
    }
};

RectMaze.Cell.prototype.canEnter = function(neighbour) {
    var direction = this.getNeighbourDirection(neighbour);
    return this.hasWall(direction);
};

RectMaze.Cell.prototype.getAllNeighbours = function() {
    return this.getNeighbour(RectMaze.Cell.ALL);
};

RectMaze.Cell.prototype.hasAllWalls = function() {
    return this.hasWall(RectMaze.Cell.ALL);
};

RectMaze.Cell.prototype.breakWall = function(idx) {
    switch (idx) {
        case RectMaze.Cell.EAST  : return this.breakEastWall();
        case RectMaze.Cell.SOUTH : return this.breakSouthWall();
        case RectMaze.Cell.WEST  : return this.breakWestWall();
        case RectMaze.Cell.NORTH : return this.breakNorthWall();
    }
};

RectMaze.Cell.prototype.breakEastWall  = function() {
    this._walls[RectMaze.Cell.EAST] = false;
};

RectMaze.Cell.prototype.breakSouthWall = function() {
    this._walls[RectMaze.Cell.SOUTH] = false;
};

RectMaze.Cell.prototype.breakWestWall  = function() {
    var n = this.getNeighbour(RectMaze.Cell.WEST);
    n && n.breakEastWall()
};

RectMaze.Cell.prototype.breakNorthWall = function() {
    var n = this.getNeighbour(RectMaze.Cell.NORTH);
    n && n.breakSouthWall()
};

RectMaze.Cell.prototype.breakWallTo = function(neighbour) {
    var direction = this.getNeighbourDirection(neighbour);
    this.breakWall(direction);
};

RectMaze.Cell.prototype.getCenter = function() {
    var w = this._maze._cellWidth,
        h = this._maze._cellHeight,
        x = this._col * w,
        y = this._row * h;
    return { 'x' : x + w / 2, 'y' : y + h / 2 };
};

RectMaze.Cell.prototype.paint = function(context) {
    var w = this._maze._cellWidth;
    var h = this._maze._cellHeight;
    var x = this._col * w;
    var y = this._row * h;

    if (this.hasNorthWall()) {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + w, y);
        context.stroke();
    }
    if (this.hasEastWall()) {
        context.beginPath();
        context.moveTo(x + w, y);
        context.lineTo(x + w, y + h);
        context.stroke();
    }
    if (this.hasSouthWall()) {
        context.beginPath();
        context.moveTo(x, y + h);
        context.lineTo(x + w, y + h);
        context.stroke();
    }
    if (this.hasWestWall()) {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x, y + h);
        context.stroke();
    }
};
