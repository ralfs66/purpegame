import { graphics, maps } from './assetLoader.js';
import { TILE_SIZE, TILE_TYPES, MAX_SCREEN_WIDTH, MAX_SCREEN_HEIGHT } from './constants.js';

let currentMap;

// Add tile caching to improve rendering performance
const tileCache = new Map();

function cacheTile(tileType) {
    if (!tileCache.has(tileType)) {
        const canvas = document.createElement('canvas');
        canvas.width = TILE_SIZE;
        canvas.height = TILE_SIZE;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(graphics.tiles, tileType * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE, 0, 0, TILE_SIZE, TILE_SIZE);
        tileCache.set(tileType, canvas);
    }
    return tileCache.get(tileType);
}

export function initializeMap(mapName = 'map1') {
    if (!maps[mapName]) {
        throw new Error(`Map ${mapName} not found`);
    }
    currentMap = { ...maps[mapName], name: mapName };
}

export function getCurrentMap() {
    return currentMap;
}

export function changeMap(mapName) {
    if (!maps[mapName]) {
        throw new Error(`Map ${mapName} not found`);
    }
    currentMap = { ...maps[mapName], name: mapName };
}

export function drawMap(ctx, camera) {
    if (!currentMap || !graphics.tiles) {
        console.error('Map or tiles not loaded');
        return;
    }

    const startX = Math.max(0, Math.floor(camera.x / TILE_SIZE));
    const startY = Math.max(0, Math.floor(camera.y / TILE_SIZE));
    const endX = Math.min(currentMap.width, startX + Math.ceil(ctx.canvas.width / TILE_SIZE) + 1);
    const endY = Math.min(currentMap.height, startY + Math.ceil(ctx.canvas.height / TILE_SIZE) + 1);

    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            const tileX = x * TILE_SIZE - camera.x;
            const tileY = y * TILE_SIZE - camera.y;
            const tileType = currentMap.tiles[y][x];
            
            ctx.drawImage(
                graphics.tiles,
                tileType * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE,
                tileX, tileY, TILE_SIZE, TILE_SIZE
            );
        }
    }
}

export function isCollision(x, y) {
    if (!currentMap) return true;

    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    
    if (tileX < 0 || tileX >= currentMap.width || tileY < 0 || tileY >= currentMap.height) {
        return true;
    }
    
    const tileType = currentMap.tiles[tileY][tileX];
    return tileType === TILE_TYPES.BUILDING || tileType === TILE_TYPES.WATER || tileType === TILE_TYPES.TREE;
}

// Re-export TILE_SIZE from constants
export { TILE_SIZE };