import { isCollision, getCurrentMap } from './map.js';
import { getNPCAtPosition, interactWithNPC, handleNPCResponse } from './npc.js';
import { graphics } from './assetLoader.js';
import { 
    TILE_SIZE, 
    PLAYER_SPEED, 
    PLAYER_INITIAL_HP, 
    PLAYER_INITIAL_MANA, 
    PLAYER_INITIAL_MONEY, 
    PLAYER_INITIAL_LEVEL, 
    PLAYER_MAX_INVENTORY_SIZE,
    DIRECTIONS
} from './constants.js';
import { changeMap } from './map.js';

const player = {
    x: TILE_SIZE * 2,
    y: TILE_SIZE * 2,
    size: TILE_SIZE, // Assuming 32x32 sprite size
    speed: PLAYER_SPEED,
    direction: DIRECTIONS.DOWN,
    hp: PLAYER_INITIAL_HP,
    maxHp: PLAYER_INITIAL_HP,
    mana: PLAYER_INITIAL_MANA,
    maxMana: PLAYER_INITIAL_MANA,
    money: PLAYER_INITIAL_MONEY,
    inventory: [],
    maxInventorySize: PLAYER_MAX_INVENTORY_SIZE
};

let currentNPC = null;

function updatePlayer(moveX, moveY) {
    const newX = player.x + moveX * player.speed;
    const newY = player.y + moveY * player.speed;

    if (!isCollision(newX, newY)) {
        player.x = newX;
        player.y = newY;
    }
    
    if (Math.abs(moveX) > Math.abs(moveY)) {
        player.direction = moveX < 0 ? DIRECTIONS.LEFT : DIRECTIONS.RIGHT;
    } else if (moveY !== 0) {
        player.direction = moveY < 0 ? DIRECTIONS.UP : DIRECTIONS.DOWN;
    }
}

function drawPlayer(ctx, camera) {
    const playerX = Math.round(player.x - camera.x);
    const playerY = Math.round(player.y - camera.y);
    
    const spriteX = 0;
    const spriteY = player.direction * 64; // Assuming each row in player.png is 64px high
    
    ctx.drawImage(
        graphics.player,
        spriteX, spriteY, 64, 64, // Source rectangle
        playerX - player.size / 2, playerY - player.size / 2, player.size, player.size // Destination rectangle
    );
}

function interactWithNearbyNPC() {
    const currentMap = getCurrentMap();
    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;
    const playerTileX = Math.floor(playerCenterX / TILE_SIZE);
    const playerTileY = Math.floor(playerCenterY / TILE_SIZE);
    
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const npc = getNPCAtPosition(playerTileX + dx, playerTileY + dy, currentMap.name);
            if (npc) {
                currentNPC = npc;
                return interactWithNPC(npc, currentMap.name);
            }
        }
    }
    currentNPC = null;
    return null;
}

function buyFromCurrentMerchant() {
    if (currentNPC && currentNPC.sellItem) {
        if (player.money >= currentNPC.sellItem.price) {
            const success = addToInventory({...currentNPC.sellItem});
            if (success) {
                player.money -= currentNPC.sellItem.price;
                console.log(`Bought ${currentNPC.sellItem.name} for ${currentNPC.sellItem.price} gold`);
                return true;
            } else {
                console.log("Inventory is full!");
            }
        } else {
            console.log("Not enough gold!");
        }
    }
    return false;
}

function sellToCurrentNPC() {
    if (currentNPC && currentNPC.buyItem) {
        const itemToSell = player.inventory.find(item => item.name === currentNPC.buyItem.name);
        if (itemToSell) {
            removeFromInventory(itemToSell);
            player.money += currentNPC.buyItem.price;
            console.log(`Sold ${itemToSell.name} to ${currentNPC.name} for ${currentNPC.buyItem.price} gold`);
            return true;
        }
    }
    return false;
}

export function addToInventory(item) {
    if (player.inventory.length < player.maxInventorySize) {
        player.inventory.push(item);
        return true;
    }
    return false;
}

export function removeFromInventory(item) {
    const index = player.inventory.findIndex(i => i.name === item.name);
    if (index > -1) {
        player.inventory.splice(index, 1);
        return true;
    }
    return false;
}

function useItem(itemIndex) {
    const item = player.inventory[itemIndex];
    if (item) {
        // Implement item usage logic here
        console.log(`Using item: ${item.name}`);
        // For example, if it's a healing potion:
        if (item.type === 'healingPotion') {
            player.hp = Math.min(player.hp + item.healAmount, player.maxHp);
            removeFromInventory(itemIndex);
        }
    }
}

function handleNPCInteraction(response) {
    const currentMap = getCurrentMap();
    if (currentNPC && currentNPC.map === currentMap.name) {
        const result = handleNPCResponse(currentNPC, player, response);
        if (currentNPC.changeMap && result) {
            changePlayerMap(currentNPC.changeMap);
        }
        return result;
    }
    return false;
}

function changePlayerMap(changeMapData) {
    changeMap(changeMapData.map);
    player.x = changeMapData.x * TILE_SIZE;
    player.y = changeMapData.y * TILE_SIZE;
    return true;
}

export { player, updatePlayer, drawPlayer, interactWithNearbyNPC, buyFromCurrentMerchant, sellToCurrentNPC, useItem, handleNPCInteraction, changePlayerMap };