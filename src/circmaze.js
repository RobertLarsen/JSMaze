var CircMaze = function(x, y, diameter, rings, minCellCircumference) {
    this._x = x;
    this._y = y;
    this._diameter = diameter;
    this._minCellCircumference = minCellCircumference;
    this._rings = [];
    for (var i = 0; i < rings; i++) {
        this._rings.push(new CircMaze.Ring(this, i, diameter / 2 / rings * (i + 1)));
    }
};

CircMaze.prototype = new Maze();

CircMaze.prototype.eachCell = function(callback, obj) {
    this._rings.forEach(function(ring) {
        ring._cells.forEach(callback, obj);
    });
};

CircMaze.Cell = function(id, ring, startAngle, endAngle) {
    this._id = id;
    this._ring = ring;
    this._startAngle = startAngle;
    this._endAngle = endAngle;
};

CircMaze.Cell.prototype.getId = function() {
    return this._id;
};

CircMaze.Cell.prototype.paint = function(context) {
    context.save();
    context.moveTo(this._ring._maze._x + this._ring._radius * Math.cos(this._startAngle), this._ring._maze._y + this._ring._radius * Math.sin(this._startAngle));
    context.lineTo(this._ring._maze._x + this._ring._radius * Math.cos(this._endAngle), this._ring._maze._y + this._ring._radius * Math.sin(this._endAngle));
    context.stroke();
    context.restore();
};

CircMaze.Cell.prototype.hasAllWalls = function() { };
CircMaze.Cell.prototype.breakWallTo = function(neighbour) { };
CircMaze.Cell.prototype.getAllNeighbours = function() { };

CircMaze.Ring = function(maze, nr, radius) {
    this._maze = maze;
    this._nr = nr;
    this._radius = radius;

    var num = this.calculateNumCells(),
        arc = 2 * Math.PI / num,
        neighbourRing = (nr === 0 ? null : maze._rings[nr - 1]),
        lastId = (neighbourRing === null ? 0 : neighbourRing._cells[neighbourRing._cells.length - 1].getId() + 1);

    this._cells = new Array(num);

    for (var i = 0; i < num; i++) {
        this._cells[i] = new CircMaze.Cell(lastId + i, this, i * arc, (i + 1) * arc);
    }
};

CircMaze.Ring.prototype.paint = function(context) {
    context.beginPath();
    context.arc(this._maze._x, this._maze._y, this._radius, 0, Math.PI * 2);
    context.stroke();
};

CircMaze.Ring.prototype.getCircumference = function() {
    return 2 * this._radius * Math.PI;
};

CircMaze.Ring.prototype.calculateNumCells = function() {
    var num = Math.floor(this.getCircumference() / this._maze._minCellCircumference);
    if (this._nr > 0) {
        var neighbourCircle = this._maze._rings[this._nr - 1],
            doubleCells = neighbourCircle._cells.length * 2;

        num = (doubleCells <= num ? doubleCells : neighbourCircle._cells.length);
    }
    return num;
};
