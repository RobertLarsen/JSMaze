var CircMaze = function(x, y, diameter, rings, minCellCircumference) {
    this._x = x;
    this._y = y;
    this._diameter = diameter;
    this._minCellCircumference = minCellCircumference;
    this._rings = [];
    this._rings.push(new CircMaze.Ring(this, 0, diameter / 2 / rings, 1));
    this._rings.push(new CircMaze.Ring(this, 1, diameter / 2 / rings * 2, this._rings[0].calculateNumCells()));
    for (var i = 2; i < rings; i++) {
        this._rings.push(new CircMaze.Ring(this, i, diameter / 2 / rings * (i + 1)));
    }
    this.eachCell(function(c) {
        c.initializeWalls();
    });
};

CircMaze.prototype = new Maze();

CircMaze.prototype.eachCell = function(callback, obj) {
    this._rings.forEach(function(ring) {
        ring._cells.forEach(callback, obj);
    });
};

CircMaze.Cell = function(id, ring, idx, startAngle, endAngle) {
    this._id = id;
    this._ring = ring;
    this._idx = idx;
    this._startAngle = startAngle;
    this._endAngle = endAngle;
    this._neighbours = [];
    this._walls = {
        'length' : 0
    };
};

CircMaze.Cell.prototype.toString = function() {
    var toD = function(r) {
        return r / Math.PI * 180;
    }
    return "(" + this._id + "," + this._ring._nr + "," + toD(this._startAngle) + "-" + toD(this._endAngle) + ")";
};

CircMaze.Cell.prototype.getId = function() {
    return this._id;
};

CircMaze.Cell.prototype.getCenter = function() {
    var a = (this._startAngle + this._endAngle) / 2,
        rDiff = this._ring._radius / (this._ring._nr + 1),
        r = this._ring._radius - rDiff / 2;
    return { 'x' : this._ring._maze._x + Math.cos(a) * r, 'y' : this._ring._maze._y + Math.sin(a) * r };
};

CircMaze.Cell.prototype.paint = function(context) {
    this.getAllNeighbours().forEach(function(n) {
        if (this.wallIsMine(n) && this._walls["w" + n.getId()] === true) {
            this.paintWallTo(context, n);
        }
    }, this);

    if (this._ring === this._ring._maze._rings[this._ring._maze._rings.length - 1]) {
        context.save();
        context.beginPath();

        var x1 = this._ring._maze._x + Math.cos(this._startAngle) * this._ring._radius;
        var y1 = this._ring._maze._x + Math.sin(this._startAngle) * this._ring._radius;
        var x2 = this._ring._maze._x + Math.cos(this._endAngle) * this._ring._radius;
        var y2 = this._ring._maze._x + Math.sin(this._endAngle) * this._ring._radius;

        context.moveTo(x1, y1);
        context.lineTo(x2, y2);

        context.stroke();
        context.restore();
    }
};

CircMaze.Cell.prototype.paintWallTo = function(context, neighbour) {
    var randomColor = function() {
        var hex = "0123456789abcdef";
        return hex.charAt(Math.floor(Math.random() * 16)) + 
               hex.charAt(Math.floor(Math.random() * 16)) +
               hex.charAt(Math.floor(Math.random() * 16));
    };

    context.save();
    context.beginPath();

    var x1, y1, x2, y2;

    if (neighbour._ring === this._ring) {
        var innerRadius = (this._ring._nr === 0 ? 0 : this._ring._maze._rings[this._ring._nr - 1]._radius);
        var outerRadius = this._ring._radius;
        x1 = this._ring._maze._x + Math.cos(this._endAngle) * innerRadius;
        y1 = this._ring._maze._x + Math.sin(this._endAngle) * innerRadius;
        x2 = this._ring._maze._x + Math.cos(this._endAngle) * outerRadius;
        y2 = this._ring._maze._x + Math.sin(this._endAngle) * outerRadius;
    } else {
        var start = Math.max(this._startAngle, neighbour._startAngle);
        var end   = Math.min(this._endAngle, neighbour._endAngle);
        x1 = this._ring._maze._x + Math.cos(start) * this._ring._radius;
        y1 = this._ring._maze._x + Math.sin(start) * this._ring._radius;
        x2 = this._ring._maze._x + Math.cos(end) * this._ring._radius;
        y2 = this._ring._maze._x + Math.sin(end) * this._ring._radius;
    }

    context.moveTo(x1, y1);
    context.lineTo(x2, y2);

    context.stroke();
    context.restore();
};

CircMaze.Cell.prototype.wallIsMine = function(neighbour) {
    var anglesEqual = function(a1, a2) {
        var diff = Math.abs(a1 - a2);
        return diff < 0.00001 || Math.abs(diff - Math.PI * 2) < 0.00001;
    };
    var result = this._ring._nr === (neighbour._ring._nr - 1) ||
           (this._ring === neighbour._ring &&
            anglesEqual(this._endAngle, neighbour._startAngle));

    return result;
};

CircMaze.Cell.prototype.initializeWalls = function() {
    if (this._walls.length === 0) {
        this.getAllNeighbours().forEach(function(n) {
            if (this.wallIsMine(n)) {
                this._walls['w' + n.getId()] = true;
                this._walls['length']++;
            }
        }, this);
    }
}

CircMaze.Cell.prototype.hasWallTo = function(neighbour) {
    if (this.wallIsMine(neighbour)) {
        return this._walls['w' + neighbour.getId()];
    } else {
        return neighbour.hasWallTo(this);
    }
};

CircMaze.Cell.prototype.hasAllWalls = function() {
    var hasAll = true;
    this.getAllNeighbours().forEach(function(n) {
        if (this.hasWallTo(n) === false) {
            hasAll = false;
        }
    }, this);
    return hasAll;
};

CircMaze.Cell.prototype.breakWallTo = function(neighbour) {
    if (this.wallIsMine(neighbour)) {
        this._walls['w' + neighbour.getId()] = false;
    } else {
        neighbour.breakWallTo(this);
    }
};

CircMaze.Cell.prototype.getAllNeighbours = function() {
    if (this._neighbours.length === 0) {
        if (this._ring._nr > 0) {
            var n = this._ring._cells.length;
            this._neighbours.push(this._ring._cells[(this._idx + 1) % n]);
            this._neighbours.push(this._ring._cells[(this._idx + n - 1) % n]);
        }
        if (this._ring._nr > 0) {
            this._neighbours = this._neighbours.concat(this._ring._maze._rings[this._ring._nr - 1].getCellsInArc(this._startAngle, this._endAngle));
        }
        if (this._ring._nr < this._ring._maze._rings.length - 1) {
            this._neighbours = this._neighbours.concat(this._ring._maze._rings[this._ring._nr + 1].getCellsInArc(this._startAngle, this._endAngle));
        }
    }

    return this._neighbours;
};

CircMaze.Ring = function(maze, nr, radius, numCells) {
    this._maze = maze;
    this._nr = nr;
    this._radius = radius;

    var num = numCells || this.calculateNumCells(),
        arc = 2 * Math.PI / num,
        neighbourRing = (nr === 0 ? null : maze._rings[nr - 1]),
        lastId = (neighbourRing === null ? 0 : neighbourRing._cells[neighbourRing._cells.length - 1].getId() + 1);

    this._cells = new Array(num);

    for (var i = 0; i < num; i++) {
        this._cells[i] = new CircMaze.Cell(lastId + i, this, i, i * arc, (i + 1) * arc);
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

CircMaze.Ring.prototype.getCellsInArc = function(startAngle, endAngle) {
    if (startAngle > endAngle) {
        endAngle += Math.PI * 2;
    }

    var c = [];
    this._cells.forEach(function(cell) {
        var sa = cell._startAngle;
        var ea = cell._endAngle;
        if (sa > ea) {
            ea += Math.PI * 2;
        }

        if (ea > startAngle && sa < endAngle) {
            c.push(cell);
        }
    });
    return c;
};
