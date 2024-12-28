import { loadAssets } from './assetLoader.js';
import { 
    initializeUI, 
    updateStatusBars, 
    getMovement, 
    updateInventoryUI,
    createInventoryUI,
    toggleInventory,
    checkNearbyNPC,
    isInDialogue,
    handleActionTouch
} from './ui.js';
import { showDialogue, nextDialogue, getCurrentDialogue } from './dialogue.js';
import { TILE_SIZE, MAX_SCREEN_WIDTH, MAX_SCREEN_HEIGHT } from './constants.js';
import { initializeMap, drawMap, getCurrentMap, changeMap } from './map.js';
import { player, updatePlayer, drawPlayer, interactWithNearbyNPC, buyFromCurrentMerchant, sellToCurrentNPC, handleNPCInteraction } from './player.js';
import { drawNPCs } from './npc.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const camera = {
    x: 0,
    y: 0
};

// Add a game state system
const GameState = {
    LOADING: 'loading',
    PLAYING: 'playing',
    PAUSED: 'paused',
    DIALOGUE: 'dialogue',
    INVENTORY: 'inventory'
};

let currentGameState = GameState.LOADING;

function updateCamera() {
    const currentMap = getCurrentMap();
    camera.x = Math.max(0, Math.min(player.x - canvas.width / 2, currentMap.width * TILE_SIZE - canvas.width));
    camera.y = Math.max(0, Math.min(player.y - canvas.height / 2, currentMap.height * TILE_SIZE - canvas.height));
}

function resizeCanvas() {
    const aspectRatio = window.innerWidth / window.innerHeight;
    let newWidth, newHeight;

    if (aspectRatio > 1) {
        newHeight = Math.min(window.innerHeight, MAX_SCREEN_HEIGHT);
        newWidth = Math.min(newHeight, MAX_SCREEN_WIDTH);
    } else {
        newWidth = Math.min(window.innerWidth, MAX_SCREEN_WIDTH);
        newHeight = Math.min(newWidth, MAX_SCREEN_HEIGHT);
    }

    canvas.width = newWidth;
    canvas.height = newHeight;
    canvas.style.width = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const { moveX, moveY } = getMovement();
    
    updatePlayer(moveX, moveY);
    if (!isInDialogue) {
        checkNearbyNPC(); // Check for nearby NPCs without opening dialogue
    }
    
    updateCamera();
    drawMap(ctx, camera);
    drawNPCs(ctx, camera);
    drawPlayer(ctx, camera);
    updateStatusBars();
    updateInventoryUI();
    
    requestAnimationFrame(gameLoop);
}

function handleButtonPress(e) {
    e.preventDefault(); // Prevent default behavior
    handleActionTouch({ target: { id: e.target.id } });
}

async function init() {
    try {
        await loadAssets();
        resizeCanvas();
        initializeMap('map1');  // Specify the map name if needed
        initializeUI(player);
        window.addEventListener('resize', resizeCanvas);

        // Add event listeners for A and B buttons
        const actionA = document.getElementById('action-a');
        const actionB = document.getElementById('action-b');

        // For touch devices
        actionA.addEventListener('touchstart', handleButtonPress);
        actionB.addEventListener('touchstart', handleButtonPress);

        // For desktop (using mousedown instead of click)
        actionA.addEventListener('mousedown', handleButtonPress);
        actionB.addEventListener('mousedown', handleButtonPress);

        // Prevent context menu on right-click
        actionA.addEventListener('contextmenu', (e) => e.preventDefault());
        actionB.addEventListener('contextmenu', (e) => e.preventDefault());

        // Add this new event listener for NPC interactions
        document.addEventListener('npcInteraction', (e) => handleNPCInteraction(e.detail.response));

        gameLoop();
    } catch (error) {
        console.error('Failed to initialize game:', error);
        document.body.innerHTML = '<h1>Failed to load game assets. Please try again later.</h1>';
    }
}

function updateGame() {
    switch(currentGameState) {
        case GameState.PLAYING:
            updateGameplay();
            break;
        case GameState.DIALOGUE:
            updateDialogue();
            break;
        // ... other states
    }
}

init();