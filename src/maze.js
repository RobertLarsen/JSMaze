/**
 * Copyright (c) Mozilla Foundation http://www.mozilla.org/
 * This code is available under the terms of the MIT License
 */
if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun /*, thisp*/) {
        var len = this.length >>> 0,
            res, thisp, i, val;
        if (typeof fun != "function") {
            throw new TypeError();
        }

        res = [];
        thisp = arguments[1];
        for (i = 0; i < len; i++) {
            if (i in this) {
                val = this[i]; // in case fun mutates this
                if (fun.call(thisp, val, i, this)) {
                    res.push(val);
                }
            }
        }

        return res;
    };
}

if (!Array.prototype.random) {
    Array.prototype.random = function() {
        return this.length ? this[Math.floor(Math.random() * this.length)] : undefined;
    };
}

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback, obj) {
        for (var i = 0; i < this.length; i++) {
            callback.call(obj || window, this[i], i, this);
        }
    };
}

var Maze = function() { };

Maze.prototype.eachCell = function(callback, obj) { };
Maze.prototype.getDimension = function() { }
Maze.prototype.paint = function(context) {
    this.eachCell(function(cell) {
        cell.paint(context);
    });
};

Maze.Cell = function() { };
Maze.Cell.prototype.setPath = function(context) { };
Maze.Cell.prototype.getId = function() { };
Maze.Cell.prototype.getCenter = function() { };
Maze.Cell.prototype.paint = function(context) { };
Maze.Cell.prototype.paintPathThrough = function(context, fromCell, toCell) {
    var c = this.getCenter(),
        f;
    if (fromCell !== null) {
        f = fromCell.getCenter();
        context.beginPath();
        context.moveTo(f.x, f.y);
        context.lineTo(c.x, c.y);
        context.stroke();
    }
    if (toCell !== null) {
        f = toCell.getCenter();
        context.beginPath();
        context.moveTo(f.x, f.y);
        context.lineTo(c.x, c.y);
        context.stroke();
    }
};
Maze.Cell.prototype.hasAllWalls = function() { };
Maze.Cell.prototype.breakWallTo = function(neighbour) { };
Maze.Cell.prototype.getAllNeighbours = function() { };
Maze.Cell.prototype.canEnter = function(neighbour) { };
Maze.Cell.prototype.getReachableNeighbours = function() {
    return this.getAllNeighbours().filter(function(n) {
        return this.canEnter(n);
    }, this);
};
