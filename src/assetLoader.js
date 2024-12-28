const graphicsPath = '../assets/graphics/';
const mapsPath = '../assets/maps/';

export const graphics = {};
export const maps = {};

async function loadImage(name) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${name}`));
        img.src = graphicsPath + name;
    });
}

async function loadJSON(name) {
    const response = await fetch(mapsPath + name);
    if (!response.ok) {
        throw new Error(`Failed to load JSON: ${name}`);
    }
    return response.json();
}

async function loadAssetWithRetry(loadFn, name, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await loadFn(name);
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

export async function loadAssets() {
    try {
        graphics.player = await loadImage('player.png');
        graphics.npcs = await loadImage('npcs.png');  // New single NPC sprite sheet
        graphics.tiles = await loadImage('tiles.png');
        maps.map1 = await loadJSON('map1.json');
        maps.map2 = await loadJSON('map2.json');
        console.log('All assets loaded successfully');
    } catch (error) {
        console.error('Error loading assets:', error);
        throw error;
    }
}