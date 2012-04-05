var KrushkalMazeGenerator = function() {
    this.name = "Krushkal";
};
KrushkalMazeGenerator.prototype = new MazeGenerator();

KrushkalMazeGenerator.prototype.initialize = function(maze) {
    this._maze = maze;
    this._cells_to_tree = [];
    this._cells_to_consider = [];
    this._all_cells = [];

    this._Tree = function(id, cell) {
        this.id = id;
        this.cells = [cell];
    };
    this._moveToTree = function(sourceTree, destinationTree) {
        sourceTree.cells.forEach(function(cell) {
            var id = cell.getId();
            destinationTree.cells.push(cell);
            this._cells_to_tree[id] = destinationTree;
        }, this);
    };
    maze.eachCell(function(cell) {
        var id = cell.getId();
        this._cells_to_tree[id] = new this._Tree(id, cell);
        this._cells_to_consider.push(cell);
        this._all_cells.push(cell);
    }, this);
};

KrushkalMazeGenerator.prototype.step = function() {
    var result = false,
        idx, cell, id, tree, that = this, neighbours, neighbour,
        neighbourId, neighbourTree;
    if (this._cells_to_tree[0].cells.length < this._all_cells.length) {
        idx = Math.floor(Math.random() * this._cells_to_consider.length);
        cell = this._cells_to_consider[idx];
        id = cell.getId();
        tree = this._cells_to_tree[id];
        
        neighbours = cell.getAllNeighbours().filter(function(neighbour) {
            i = neighbour.getId();
            return tree !== that._cells_to_tree[i];
        });

        if (neighbours.length === 0) {
            /* All neighbours are in same tree so dont consider this cell again */
            this._cells_to_consider.splice(idx, 1);
        } else {
            neighbour = neighbours.random();
            cell.breakWallTo(neighbour);
            neighbourId = neighbour.getId();
            neighbourTree = this._cells_to_tree[neighbourId];
            if (neighbourTree.cells.length < tree.cells.length) {
                this._moveToTree(neighbourTree, tree);
            } else {
                this._moveToTree(tree, neighbourTree);
            }
        }
        result = true;
    }
    return result;
};
