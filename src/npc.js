import { graphics } from './assetLoader.js';
import { TILE_SIZE } from './constants.js';
import { getCurrentMap, changeMap } from './map.js';
import { addToInventory, removeFromInventory } from './player.js';

const NPC_SPRITE_SIZE = TILE_SIZE;  // Assuming NPC sprites are the same size as tiles

const NPCs = [
    { 
        id: 1, 
        x: 5, 
        y: 5, 
        name: "Village Elder", 
        map: "map1", 
        spriteIndex: 0,  // Index of the sprite in the NPC sprite sheet
        dialogue: [
            "Welcome, traveler! Our village needs your help.",
            "Monsters have been attacking our farms. Can you help us?",
            "Great! Defeat 5 monsters and return to me for a reward."
        ]
    },
    { 
        id: 2, 
        x: 15, 
        y: 15, 
        name: "Merchant", 
        map: "map1", 
        spriteIndex: 1,
        dialogue: [
            "Hello there! Would you like to see my wares?",
            "I have a Health Potion for sale. It costs 20 gold.",
            "Press 'A' to buy, or 'B' to decline."
        ], 
        sellItem: { name: "Health Potion", type: "healingPotion", healAmount: 20, price: 20 }
    },
    { 
        id: 3, 
        x: 10, 
        y: 10, 
        name: "Alchemist", 
        map: "map1", 
        spriteIndex: 2,
        dialogue: [
            "Greetings! I'm always in need of Health Potions.",
            "I'll buy them for 50 gold each.",
            "Press 'A' to sell, or 'B' to decline."
        ], 
        buyItem: { name: "Health Potion", type: "healingPotion", price: 50 }
    },
    { 
        id: 4, 
        x: 5, 
        y: 7, 
        name: "Guide", 
        map: "map1", 
        spriteIndex: 3,
        dialogue: [
            "I can take you to the next map.",
            "Press 'A' to travel, or 'B' to decline."
        ], 
        changeMap: {map: "map2", x: 0, y: 0}
    },
    { 
        id: 5, 
        x: 3, 
        y: 3, 
        name: "Guide", 
        map: "map2", 
        spriteIndex: 3,  // Using the same sprite as the other Guide
        dialogue: [
            "Travel to the Grove Town!",
            "Press 'A' to return to the Grove Town, or 'B' to stay here."
        ], 
        changeMap: {map: "map1", x: 5, y: 7}
    }
];

function drawNPCs(ctx, camera) {
    const currentMap = getCurrentMap();
    NPCs.filter(npc => npc.map === currentMap.name).forEach(npc => {
        const screenX = npc.x * TILE_SIZE - camera.x;
        const screenY = npc.y * TILE_SIZE - camera.y;
        
        ctx.drawImage(
            graphics.npcs,
            npc.spriteIndex * NPC_SPRITE_SIZE, 0, NPC_SPRITE_SIZE, NPC_SPRITE_SIZE,
            screenX, screenY, TILE_SIZE, TILE_SIZE
        );
        
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.fillText(npc.name, screenX, screenY - 5);
    });
}

function getNPCAtPosition(x, y, currentMapName) {
    return NPCs.find(npc => npc.x === x && npc.y === y && npc.map === currentMapName);
}

function interactWithNPC(npc, currentMapName) {
    if (!npc || !npc.dialogue || npc.map !== currentMapName) {
        console.error('Invalid NPC, NPC has no dialogue, or NPC is not on the current map');
        return null;
    }
    return npc.dialogue;
}

function handleNPCResponse(npc, player, response) {
    if (response === 'A') {
        if (npc.sellItem) {
            return buyFromMerchant(npc, player);
        } else if (npc.buyItem) {
            return sellToNPC(npc, player);
        } else if (npc.changeMap) {
            return changePlayerMap(player, npc.changeMap);
        }
    } else if (response === 'B') {
        npc.dialogue = ["Come back if you change your mind!"];
        return false;
    }
    return false;
}

function changePlayerMap(player, changeMapData) {
    changeMap(changeMapData.map);
    player.x = changeMapData.x * TILE_SIZE;
    player.y = changeMapData.y * TILE_SIZE;
    return true;
}

function buyFromMerchant(npc, player) {
    if (!npc || !npc.sellItem) {
        console.error('Invalid NPC or NPC has no item to sell');
        return false;
    }

    if (player.money >= npc.sellItem.price) {
        const success = addToInventory({...npc.sellItem});
        if (success) {
            player.money -= npc.sellItem.price;
            console.log(`Bought ${npc.sellItem.name} from ${npc.name} for ${npc.sellItem.price} gold`);
            npc.dialogue = [
                "Thank you for your purchase!",
                "Is there anything else I can help you with?",
                "Press 'A' to buy another, or 'B' to exit."
            ];
            return true;
        } else {
            npc.dialogue = ["Your inventory is full! Make some space and come back."];
            return false;
        }
    } else {
        npc.dialogue = ["You don't have enough gold! Come back when you can afford it."];
        return false;
    }
}

function sellToNPC(npc, player) {
    if (!npc || !npc.buyItem) {
        console.error('Invalid NPC or NPC does not buy items');
        return false;
    }

    const itemToSell = player.inventory.find(item => item.name === npc.buyItem.name);
    if (itemToSell) {
        removeFromInventory(itemToSell);
        player.money += npc.buyItem.price;
        console.log(`Sold ${npc.buyItem.name} to ${npc.name} for ${npc.buyItem.price} gold`);
        npc.dialogue = [
            `Thank you for the ${npc.buyItem.name}!`,
            `I've paid you ${npc.buyItem.price} gold for it.`,
            "Do you have any more to sell?",
            "Press 'A' to sell another, or 'B' to exit."
        ];
        return true;
    } else {
        npc.dialogue = [
            `It seems you don't have any ${npc.buyItem.name}s to sell.`,
            "Come back when you have some!"
        ];
        return false;
    }
}

export { NPCs, drawNPCs, getNPCAtPosition, interactWithNPC, handleNPCResponse, changePlayerMap };