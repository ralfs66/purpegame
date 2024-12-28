let currentDialogue = null;
let currentDialogueIndex = 0;

export function showDialogue(dialogue) {
    currentDialogue = dialogue;
    currentDialogueIndex = 0;
    updateDialogueBox();
}

export function nextDialogue() {
    if (currentDialogue && currentDialogueIndex < currentDialogue.length - 1) {
        currentDialogueIndex++;
        updateDialogueBox();
    } else {
        currentDialogue = null;
        updateDialogueBox();
    }
}

export function getCurrentDialogue() {
    return currentDialogue;
}

function updateDialogueBox() {
    const dialogueBox = document.getElementById('dialogue-box');
    if (currentDialogue) {
        dialogueBox.textContent = currentDialogue[currentDialogueIndex];
        dialogueBox.style.display = 'block';
    } else {
        dialogueBox.style.display = 'none';
    }
}