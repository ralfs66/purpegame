import { player, interactWithNearbyNPC, buyFromCurrentMerchant, sellToCurrentNPC, useItem, handleNPCInteraction } from './player.js';
import { showDialogue, nextDialogue, getCurrentDialogue } from './dialogue.js';
import { TILE_SIZE, PLAYER_SPEED, PLAYER_INITIAL_HP, PLAYER_INITIAL_MANA, PLAYER_INITIAL_MONEY, PLAYER_INITIAL_LEVEL, PLAYER_MAX_INVENTORY_SIZE, DIRECTIONS } from './constants.js';

let currentDialogue = null;
let currentDialogueIndex = 0;

const movement = {
    up: false,
    down: false,
    left: false,
    right: false
};

let lastActionTime = 0;
const ACTION_COOLDOWN = 200; // milliseconds

// Add multi-touch support and gesture recognition
let touchStartX = 0;
let touchStartY = 0;

function initializeUI() {
    const dPad = document.getElementById('d-pad');
    const actionButtons = document.getElementById('action-buttons');

    dPad.addEventListener('touchstart', handleDPadTouch);
    dPad.addEventListener('touchend', handleDPadRelease);
    dPad.addEventListener('touchcancel', handleDPadRelease);

    actionButtons.addEventListener('touchstart', handleActionTouch);

    // Add click events for testing on desktop
    dPad.addEventListener('mousedown', handleDPadTouch);
    dPad.addEventListener('mouseup', handleDPadRelease);
    actionButtons.addEventListener('mousedown', handleActionTouch);

    document.body.addEventListener('touchstart', function(e) {
        e.preventDefault();
    }, { passive: false });

    updateStatusBars();
    createInventoryUI();
}

function handleDPadTouch(e) {
    const target = e.target;
    if (target.id === 'up') movement.up = true;
    if (target.id === 'down') movement.down = true;
    if (target.id === 'left') movement.left = true;
    if (target.id === 'right') movement.right = true;
}

function handleDPadRelease() {
    movement.up = false;
    movement.down = false;
    movement.left = false;
    movement.right = false;
}

let isInDialogue = false;
let nearbyNPCDialogue = null;

function handleActionTouch(e) {
    const now = Date.now();
    if (now - lastActionTime < ACTION_COOLDOWN) {
        return; // Ignore rapid repeated presses
    }
    lastActionTime = now;

    const target = e.target;
    if (target.id === 'action-a') {
        if (isInDialogue) {
            const result = handleNPCInteraction('A');
            if (result) {
                updateStatusBars();
                updateInventoryUI();
                closeDialogue();
            } else {
                nextDialogue();
            }
        } else if (nearbyNPCDialogue) {
            showDialogue(nearbyNPCDialogue);
            isInDialogue = true;
        }
    }
    if (target.id === 'action-b') {
        if (isInDialogue) {
            handleNPCInteraction('B');
            closeDialogue();
        }
    }
}

function closeDialogue() {
    isInDialogue = false;
    showDialogue(null);
}

function checkNearbyNPC() {
    nearbyNPCDialogue = interactWithNearbyNPC();
    // You might want to show some visual indicator that an NPC is nearby
}

function getMovement() {
    let moveX = 0;
    let moveY = 0;
    if (movement.up) moveY -= 1;
    if (movement.down) moveY += 1;
    if (movement.left) moveX -= 1;
    if (movement.right) moveX += 1;
    
    if ((moveX !== 0 || moveY !== 0) && isInDialogue) {
        closeDialogue();
    }
    
    return { moveX, moveY };
}

function updateStatusBars() {
    if (!player) return;

    const hpBar = document.querySelector('#hp-bar .bar-fill');
    const manaBar = document.querySelector('#mana-bar .bar-fill');
    const hpText = document.querySelector('#hp-bar .bar-text');
    const manaText = document.querySelector('#mana-bar .bar-text');
    const moneyBar = document.getElementById('money-bar');

    if (hpBar && manaBar && hpText && manaText && moneyBar) {
        hpBar.style.width = `${(player.hp / player.maxHp) * 100}%`;
        manaBar.style.width = `${(player.mana / player.maxMana) * 100}%`;
        hpText.textContent = `HP: ${player.hp}/${player.maxHp}`;
        manaText.textContent = `Mana: ${player.mana}/${player.maxMana}`;
        moneyBar.textContent = `$${player.money}`;
    }
}

function createInventoryUI() {
    const uiOverlay = document.getElementById('ui-overlay');
    
    const inventoryButton = document.createElement('button');
    inventoryButton.id = 'toggle-inventory';
    inventoryButton.textContent = 'Inventory';
    inventoryButton.addEventListener('click', toggleInventory);
    inventoryButton.addEventListener('touchstart', handleInventoryTouch);
    
    uiOverlay.insertBefore(inventoryButton, uiOverlay.firstChild);

    const inventoryDiv = document.createElement('div');
    inventoryDiv.id = 'inventory';
    inventoryDiv.style.display = 'none';
    uiOverlay.appendChild(inventoryDiv);
}

function handleInventoryTouch(e) {
    e.preventDefault(); // Prevent default touch behavior
    toggleInventory();
}

function toggleInventory() {
    const inventoryDiv = document.getElementById('inventory');
    if (inventoryDiv.style.display === 'none') {
        updateInventoryUI();
        inventoryDiv.style.display = 'block';
    } else {
        inventoryDiv.style.display = 'none';
    }
}

function updateInventoryUI() {
    const inventoryDiv = document.getElementById('inventory');
    inventoryDiv.innerHTML = '<h3>Inventory</h3>';
    player.inventory.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.textContent = `${item.name} (${item.type})`;
        itemElement.onclick = () => useItem(index);
        inventoryDiv.appendChild(itemElement);
    });
}

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchX - touchStartX;
    const deltaY = touchY - touchStartY;
    
    // Add swipe detection
    if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
        // Handle swipe
    }
}

// Single export statement at the end of the file
export { 
    initializeUI, 
    updateStatusBars, 
    getMovement, 
    updateInventoryUI,
    createInventoryUI,
    toggleInventory,
    checkNearbyNPC,
    isInDialogue,
    handleActionTouch
};