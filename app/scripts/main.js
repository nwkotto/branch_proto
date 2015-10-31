
// ***** MODELS ***** //
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
        getBlock: function(coords) {
            if (coords.row && coords.row >= 0 && coords.row < priv.grid.length
                && coords.col && coords.col >= 0 && coords.col < priv.grid[0].length) {
                return priv.grid[coords.row][coords.col];
            }
            return -1;
        },
        setBlock: function(coords, index) {
            priv.addRows((coords.row + 1) - priv.grid.length).addCols((coords.col + 1) - priv.grid[0].length);

            // Add coords index to grid
            priv.grid[coords.row][coords.col] = index;
            var position = this.blockPosition(coords);

            priv.padBoard();

            return position;
        },
        blockPosition: function(coords) {
            return {
                col: coords.col - priv.centroid.col,
                row: coords.row - priv.centroid.row
            }
        },
        blockCoords: function(position) {
            return {
                col: position.col + priv.centroid.col,
                row: position.row + priv.centroid.row
            }
        },
        adjacentBlockIsFilled: function(coords) {
            var blocks = {
                up: false,
                right: false,
                down: false,
                left: false
            }

            blocks.up = this.getBlock({row: coords.row - 1, col: coords.col}) > -1;
            blocks.right = this.getBlock({row: coords.row, col: coords.col + 1}) > -1;
            blocks.down = this.getBlock({row: coords.row + 1, col: coords.col}) > -1;
            blocks.left = this.getBlock({row: coords.row, col: coords.col - 1}) > -1;

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

var Board = function(params) {
    var params = params || {};
    var priv = {
        wrapperClass: params.wrapperClass || "block-wrapper",
        grid: new Grid(),
        blocks: [],
        blockSpec: {
            col: parseInt(params.width, 10) || 300,
            row: parseInt(params.height, 10) || 185
        },
        styles: {},
        updateStyles: function() {
            // Specify board params based on grid size
            var width = this.blockSpec.col * this.grid.numCols(),
                height = this.blockSpec.row * this.grid.numRows();

            // Resize board; re-specify bounds
            this.styles = {
                "width": width,
                "height": height
            }
            return this;
        },
        rowAndCol: function(pxCoords, target) {
            var indexes = {
                "row": -1,
                "col": -1
            };

            var pxTop = pxCoords.row - (window.pageYOffset + target.top),
                pxLeft = pxCoords.col - (window.pageXOffset + target.left);

            indexes.row = Math.floor(pxTop / priv.blockSpec.row);
            indexes.col = Math.floor(pxLeft / priv.blockSpec.col);

            return indexes;
        }
    };

    var pub = {
        getClassName: function() {
            return priv.wrapperClass;
        },
        getStyles: function() {
            return priv.styles;
        },
        getFormattedBlocks: function() {
            var blocks = priv.blocks.map(function(block) {
                block.coords = priv.grid.blockCoords(block.position);
                block.key = block.coords.row.toString() + block.coords.col.toString();
                return block;
            });
            return blocks;
        },
        getBlockSpec: function() {
            return priv.blockSpec;
        },
        addBlock: function(block, coords) {
            priv.blocks.push(block);
            var blockIndex = priv.blocks.length - 1;

            // Add block to grid; return absolute coords for persistent storage
            var position = priv.grid.setBlock(coords, blockIndex);
            priv.blocks[blockIndex].position = position;

            // Update container dimensions
            priv.updateStyles();
        },
        openBlockCoords: function(pxCoords, target) {
            var coords = {
                col: -1,
                row: -1
            };
            var rowAndCol = priv.rowAndCol(pxCoords, target);
            if (priv.grid.getBlock(rowAndCol) === -1 && priv.grid.adjacentBlockIsFilled(rowAndCol)) {
                coords = rowAndCol;
            }

            return coords;
        }
    }

    // Initialization
    priv.updateStyles();

    return pub;
}

// ***** VIEWS ***** //
var BlockView = React.createClass({
    getBlockPosition: function() {
        var position = {
            left: 0,
            top: 0
        };
        var spec = this.props.spec,
            block = this.props.block;
        if (spec.col && spec.row) {
            position.left = spec.col * block.coords.col;
            position.top = spec.row * block.coords.row;
        } else {
            position.display = "none";
        }
        return position;
    },
    render: function() {
        return (
            <div className="block content" style={this.getBlockPosition()}>
                <h2>{this.props.block.title}</h2>
                <h3>{this.props.block.subtitle}</h3>
            </div>
        )
    }
});

var BoardView = React.createClass({
    getInitialState: function() {
        var state = {
            styles: this.windowBounds(),
            board: new Board()
        }
        state.board.addBlock({"title": "No", "subtitle": "Diggity"}, {"row": 0, "col": 0});
        state.board.addBlock({"title": "No", "subtitle": "Doubt"}, {"row": 0, "col": 0});
        return state;
    },
    windowBounds: function() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        }
    },
    updateWindowBounds: function() {
        this.setState({styles: this.windowBounds()})
    },
    componentDidMount: function() {
        window.addEventListener("resize", this.updateWindowBounds);
        this.state.board.setTarget;
    },
    componentWillUnmount: function() {
        window.removeEventListener("resize", this.updateWindowBounds);
    },
    blockWrapperMouseMove: function(e) {
        var pxCoords = {
            row: e.pageY,
            col: e.pageX
        };
        var coords = this.state.board.openBlockCoords(pxCoords, this.refs.blockWrapper.getBoundingClientRect());
        console.log(coords);
    },
    blockWrapperClick: function(e) {
        // console.log("Click", e.clientX, e.clientY);
    },
    render: function() {
        var blockSpec = this.state.board.getBlockSpec();

        var that = this;
        var blocks = this.state.board.getFormattedBlocks().map(function(block) {
            return (
                <BlockView key={block.key} block={block} spec={blockSpec} />
            )
        });
        return (
            <div style={this.state.styles}>
                <div className={this.state.board.getClassName()}
                    style={this.state.board.getStyles()}
                    onMouseMove={this.blockWrapperMouseMove}
                    onClick={this.blockWrapperClick}
                    ref="blockWrapper">
                    {blocks}
                </div>
                <div className="vertical-center"></div>
            </div>
        )
    }
})
ReactDOM.render(<BoardView />, document.getElementById("pane"))

// var board = new Board();
// board.addBlock(0, 0);
// board.addBlock(0, 1);
// board.addBlock(0, 2);
// board.addBlock(1, 0);