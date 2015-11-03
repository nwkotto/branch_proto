var Board = function(params) {
    var params = params || {};
    var priv = {
        wrapperClass: params.wrapperClass || "block-wrapper",
        grid: new Grid(),
        blocks: [],
        blockSpec: {
            col: parseInt(params.width, 10) || 325,
            row: parseInt(params.height, 10) || 200
        },
        styles: {},
        init: function() {
            // Pull values from local storage
            if (localStorage.branchly) {
                var blocks = JSON.parse(localStorage.branchly);
                blocks.map(function(block) {
                    pub.addBlock(block, {});
                });
            } else {
                pub.addBlock({}, {col: 0, row: 0});
            }
            priv.updateStyles();
        },
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
                if (!(block.title || block.url)) {
                    block.editing = true;
                }
                return block;
            });
            return blocks;
        },
        getBlockSpec: function() {
            return priv.blockSpec;
        },
        updateBlockSpec: function(coords) {
            var col = parseInt(coords.col, 10),
                row = parseInt(coords.row, 10);
            if (col && row) {
                priv.blockSpec = {
                    col: col,
                    row: row
                };
            }
        },
        getBlock: function(block) {
            var index = priv.grid.getBlockIndex(block.coords);
            var blockToUpdate = priv.blocks[index];
            return blockToUpdate;
        },
        addBlock: function(block, coords) {
            priv.blocks.push(block);
            var blockIndex = priv.blocks.length - 1;

            // Add block to grid; return absolute coords for persistent storage
            var position = block.position;
            position = priv.grid.setBlock(coords, blockIndex, position);
            priv.blocks[blockIndex].position = position;

            // Update container dimensions
            priv.updateStyles();

            // Update localStorage
            localStorage.branchly = JSON.stringify(priv.blocks);
        },
        openBlockCoords: function(pxCoords, target) {
            var coords = {
                col: -1,
                row: -1
            };
            var rowAndCol = priv.rowAndCol(pxCoords, target);
            if (priv.grid.getBlockIndex(rowAndCol) === -1 && priv.grid.adjacentBlockIsFilled(rowAndCol)) {
                coords = rowAndCol;
            }

            return coords;
        }
    }

    // Initialization
    priv.init();

    return pub;
}