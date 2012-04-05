var CircMaze = function(x, y, diameter, rings, minCellCircumference) {
    var i;
    this._x = x;
    this._y = y;
    this._diameter = diameter;
    this._minCellCircumference = minCellCircumference;
    this._rings = [];
    this._rings.push(new CircMaze.Ring(this, 0, diameter / 2 / rings, 1));
    this._rings.push(new CircMaze.Ring(this, 1, diameter / 2 / rings * 2, this._rings[0].calculateNumCells()));
    for (i = 2; i < rings; i++) {
        this._rings.push(new CircMaze.Ring(this, i, diameter / 2 / rings * (i + 1)));
    }
    this.eachCell(function(c) {
        c.initializeWalls();
    });
};

CircMaze.prototype = new Maze();

CircMaze.prototype.getDimension = function() {
    return {'width': this._diameter + 2, 'height': this._diameter + 2};
};

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
CircMaze.Cell.prototype = new Maze.Cell();

CircMaze.Cell.prototype.setPath = function(context) {
    var r = this._ring._radius,
        x = this._ring._maze._x,
        y = this._ring._maze._y;
    context.beginPath();
    context.moveTo(x + Math.cos(this._startAngle) * r, y + Math.sin(this._startAngle) * r);
    
    //All outer neighbours
    if (this._ring !== this._ring._maze._rings[this._ring._maze._rings.length - 1]) {
        //There are outer neighbours
        this._ring._maze._rings[this._ring._nr + 1].getCellsInArc(this._startAngle, this._endAngle).forEach(function(n) {
            if (n._startAngle > this._startAngle && n._startAngle < this._endAngle) {
                context.lineTo(x + Math.cos(n._startAngle) * r, y + Math.sin(n._startAngle) * r);
            }
        }, this);
    }

    context.lineTo(x + Math.cos(this._endAngle) * r, y + Math.sin(this._endAngle) * r);

    if (this._ring._nr > 0) {
        r = this._ring._maze._rings[this._ring._nr - 1]._radius;
        context.lineTo(x + Math.cos(this._endAngle) * r, y + Math.sin(this._endAngle) * r);
        context.lineTo(x + Math.cos(this._startAngle) * r, y + Math.sin(this._startAngle) * r);
    }

    context.closePath();
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
    var center = null,
        a, rDiff, r;
    if (this._ring._nr === 0) {
        center = {
            'x' : this._ring._maze._x,
            'y' : this._ring._maze._y
        };
    } else {
        a = (this._startAngle + this._endAngle) / 2;
        rDiff = this._ring._radius / (this._ring._nr + 1);
        r = this._ring._radius - rDiff / 2;
        center = { 'x' : this._ring._maze._x + Math.cos(a) * r, 'y' : this._ring._maze._y + Math.sin(a) * r };
    }
    return center;
};

CircMaze.Cell.prototype.paint = function(context) {
    var x1, y1, x2, y2;
    this.getAllNeighbours().forEach(function(n) {
        if (this.wallIsMine(n) && this._walls["w" + n.getId()] === true) {
            this.paintWallTo(context, n);
        }
    }, this);

    if (this._ring === this._ring._maze._rings[this._ring._maze._rings.length - 1]) {
        context.save();
        context.beginPath();

        x1 = this._ring._maze._x + Math.cos(this._startAngle) * this._ring._radius;
        y1 = this._ring._maze._x + Math.sin(this._startAngle) * this._ring._radius;
        x2 = this._ring._maze._x + Math.cos(this._endAngle) * this._ring._radius;
        y2 = this._ring._maze._x + Math.sin(this._endAngle) * this._ring._radius;

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
        },
        x1, y1, x2, y2,
        innerRadius, outerRadius,
        start, end;

    context.save();
    context.beginPath();

    if (neighbour._ring === this._ring) {
        innerRadius = (this._ring._nr === 0 ? 0 : this._ring._maze._rings[this._ring._nr - 1]._radius);
        outerRadius = this._ring._radius;
        x1 = this._ring._maze._x + Math.cos(this._endAngle) * innerRadius;
        y1 = this._ring._maze._x + Math.sin(this._endAngle) * innerRadius;
        x2 = this._ring._maze._x + Math.cos(this._endAngle) * outerRadius;
        y2 = this._ring._maze._x + Math.sin(this._endAngle) * outerRadius;
    } else {
        start = Math.max(this._startAngle, neighbour._startAngle);
        end   = Math.min(this._endAngle, neighbour._endAngle);
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
        },
        result = this._ring._nr === (neighbour._ring._nr - 1) ||
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

CircMaze.Cell.prototype.canEnter = function(neighbour) {
    return !this.hasWallTo(neighbour);
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
    var n;
    if (this._neighbours.length === 0) {
        if (this._ring._nr > 0) {
            n = this._ring._cells.length;
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
    var num, arc, neighbourRing, lastId, i;
    this._maze = maze;
    this._nr = nr;
    this._radius = radius;

    num = numCells || this.calculateNumCells();
    arc = 2 * Math.PI / num;
    neighbourRing = (nr === 0 ? null : maze._rings[nr - 1]);
    lastId = (neighbourRing === null ? 0 : neighbourRing._cells[neighbourRing._cells.length - 1].getId() + 1);

    this._cells = new Array(num);

    for (i = 0; i < num; i++) {
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
    var num = Math.floor(this.getCircumference() / this._maze._minCellCircumference),
        neighbourCircle,
        doubleCells;
    if (this._nr > 0) {
        neighbourCircle = this._maze._rings[this._nr - 1];
        doubleCells = neighbourCircle._cells.length * 2;

        num = (doubleCells <= num ? doubleCells : neighbourCircle._cells.length);
    }
    return num;
};

CircMaze.Ring.prototype.getCellsInArc = function(startAngle, endAngle) {
    var c = [],
        sa, ea;
    if (startAngle > endAngle) {
        endAngle += Math.PI * 2;
    }

    this._cells.forEach(function(cell) {
        sa = cell._startAngle;
        ea = cell._endAngle;
        if (sa > ea) {
            ea += Math.PI * 2;
        }

        if (ea > startAngle && sa < endAngle) {
            c.push(cell);
        }
    });
    return c;
};
