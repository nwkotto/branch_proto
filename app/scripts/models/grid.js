var Grid = function() {
    // Indexing in - data[row][column]
    var priv = {
        grid: [],
        centroid: {
            col: null,
            row: null
        },

        // Expand the grid
        updateCentroid: function(dimension, op) {

            var position = this.centroid[dimension],
                diff = op === "push" ? 0 : 1;
            if (position !== null) {
                this.centroid[dimension] += diff;
            } else {
                this.centroid[dimension] = 0;
            }
        },
        addRow: function(op) {
            op = op || "push";

            var freshRow = [];
            if (this.grid.length > 0) {
                freshRow = this.grid[0].map(function(item) {
                    return -1;
                });
            }
            this.grid[op](freshRow);
            this.updateCentroid("row", op);

            return this;
        },
        addRows: function(number) {
            return this._repeat("addRow", number);
        },
        addCol: function(op) {
            op = op || "push";

            this.grid = this.grid.map(function(item) {
                item[op](-1);
                return item;
            });

            this.updateCentroid("col", op);
            return this;
        },
        addCols: function(number) {
            return this._repeat("addCol", number);
        },
        padBoard: function() {
            // Check outer row items
            function updateActions(actions, block, method, param) {
                var action = {
                    method: method,
                    param: param
                };
                if (block > -1 && actions.indexOf(action) === -1) {
                    actions.push(action);
                }
            }

            try {
                var padActions = [];
                // Columns
                for (var i = 0; i < this.grid.length; ++i) {
                    updateActions(padActions, this.grid[i][0], this.addCol, "unshift");
                    updateActions(padActions, this.grid[i][this.grid[0].length - 1], this.addCol, "push");
                }

                // Rows
                for (var i = 0; i < this.grid[0].length; ++i) {
                    updateActions(padActions, this.grid[0][i], this.addRow, "unshift");
                    updateActions(padActions, this.grid[this.grid.length - 1][i], this.addRow, "push");
                }

                // Initialize pad actions
                padActions.map(function(action) {
                    action["method"].apply(priv, [action["param"]]);
                });
            } catch (e) {
                console.log(e);
            }
        },

        // Internal methods
        _repeat: function(method, number) {
            for (var i = 0; i < number; ++i) {
                this[method]();
            }
            return this;
        }
    }

    var pub = {
        // Getters and setters
        getBlockIndex: function(coords) {
            if (coords.row && coords.row >= 0 && coords.row < priv.grid.length
                && coords.col && coords.col >= 0 && coords.col < priv.grid[0].length) {
                return priv.grid[coords.row][coords.col];
            }
            return -1;
        },
        setBlock: function(coords, index, position) {
            if (position) {
                // Loading from storage
                coords = this.blockCoords(position);
            }
            priv.addRows((coords.row + 1) - priv.grid.length).addCols((coords.col + 1) - priv.grid[0].length);

            // Add coords index to grid
            priv.grid[coords.row][coords.col] = index;
            position = this.blockPosition(coords);

            priv.padBoard();

            return position;
        },
        blockPosition: function(coords) {
            return {
                col: coords.col - (priv.centroid.col || 0),
                row: coords.row - (priv.centroid.row || 0)
            }
        },
        blockCoords: function(position) {
            return {
                col: position.col + (priv.centroid.col || 0),
                row: position.row + (priv.centroid.row || 0)
            }
        },
        adjacentBlockIsFilled: function(coords) {
            var blocks = {
                up: false,
                right: false,
                down: false,
                left: false
            }

            blocks.up = this.getBlockIndex({row: coords.row - 1, col: coords.col}) > -1;
            blocks.right = this.getBlockIndex({row: coords.row, col: coords.col + 1}) > -1;
            blocks.down = this.getBlockIndex({row: coords.row + 1, col: coords.col}) > -1;
            blocks.left = this.getBlockIndex({row: coords.row, col: coords.col - 1}) > -1;

            for (var pos in blocks) {
                if (blocks[pos]) {
                    return true;
                }
            }
            return false;
        },

        // Metadata methods
        numRows: function() {
            return priv.grid.length;
        },
        numCols: function() {
            return priv.grid.length > 0 ? priv.grid[0].length : 0;
        }
    }

    return pub;
}