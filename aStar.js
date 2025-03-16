class Block {
    constructor(id, emoji, properties) {
        this.id = id;
        this.properties = properties;
        this.emoji = emoji;
    }
}

const BLOCKS = {
    air: new Block(0, "⬜", { collidable: false }),
    wall: new Block(1, "🟥", { collidable: true }),
    pathway: new Block(2, "🟢", { collidable: false })
}

class Grid {
    constructor(sizeX, sizeY) {
        this.sizeX = sizeX
        this.sizeY = sizeY
        this.grid = Array.from({length: sizeX}, () =>  Array.from({length: sizeY}, () => BLOCKS.air) )
    }

    getCell(x, y) {
        return this.grid[y][x]
    }

    setCell(x, y, block) {
        this.grid[y][x] = block
    }

    showGrid() {
        return this.grid.map(row => row.map(cell => cell.emoji).join(" ")).join("\n");
    }
}

function manhattanDistance(x1,y1,x2,y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2)
}

// Using A*
function pathfind(grid, start, goal) {
    const openNodes = [start];
    const closedNodes = [];
    
    start.g = 0; // Distance between current node and start node
    start.h = manhattanDistance(start.x, start.y, goal.x, goal.y) // Distance between current node and goal node
    start.f = start.g + start.h; // Cost score of node;
    start.parent = null

    while (openNodes.length !== 0) {
        let lowestFIndex = 0;

        // Get lowest F index
        for (let i = 0; i < openNodes.length; i++) {
            if (openNodes[i].f < openNodes[lowestFIndex].f) {
                lowestFIndex = i
            }
        }

        const currentNode = openNodes.splice(lowestFIndex,1)[0];

        // If we got to the goal, end :)
        if (currentNode.x == goal.x && currentNode.y == goal.y) {
            return reconstructPath(currentNode)
        }

        closedNodes.push(currentNode)

        let neighbors = [
            { // North
                x: currentNode.x,
                y: currentNode.y - 1,
            },
            { // East
                x: currentNode.x - 1,
                y: currentNode.y,
            },
            { // West
                x: currentNode.x + 1,
                y: currentNode.y,
            },
            { // South
                x: currentNode.x,
                y: currentNode.y + 1,
            },
        ]

        // Get rid of neighbors that are out of bounds and is hitting a wall
        neighbors = neighbors.filter(node => {
            return node.x >= 0 && node.x < grid.sizeX &&
            node.y >= 0 && node.y < grid.sizeY &&
            !grid.getCell(node.x, node.y).properties.collidable
        })

        for (const neighbor of neighbors) {
            if (closedNodes.find((value) => value.x == neighbor.x && value.y == neighbor.y)) continue // Already explored

            const tentativeG = currentNode.g + 1

            if (!openNodes.find((value) => value.x == neighbor.x && value.y == neighbor.y)) {
                openNodes.push(neighbor)
            } else if (tentativeG >= neighbor.g) continue

            neighbor.parent = currentNode;
            neighbor.g = tentativeG
            neighbor.h = manhattanDistance(neighbor.x, neighbor.y, goal.x, goal.y)
            neighbor.f = neighbor.g + neighbor.h
        }
    }
    return reconstructPath(start)
}

function reconstructPath(node) {
    const path = [];
    while (node !== null) {
        path.push(node);
        node = node.parent
    }
    return path.map(node => [node.x, node.y])
}

const map = new Grid(5,5)

for (let i = 0; i < map.sizeX; i++) {
    for (let j = 0; j < map.sizeY; j++) {
        if (Math.random() < 0.2) {
            map.setCell(j, i, BLOCKS.wall)
        }
    }
}

map.setCell(0, 0, BLOCKS.air)
map.setCell(map.sizeX - 1, map.sizeY - 1, BLOCKS.air)

const path = pathfind(map, {x: 0, y: 0}, {x: map.sizeX - 1, y: map.sizeY - 1})

for (const coordinate of path) {
    map.setCell(coordinate[0], coordinate[1], BLOCKS.pathway)
}

console.log(map.showGrid())