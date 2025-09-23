let sets = {};
let currentSet = null;
let textHistory = [];
const MAX_HISTORY = 10; // Maximum number of undo steps

// Load sets from local storage when the page loads
window.onload = function() {
    console.log('Page loaded');
    const storedSets = localStorage.getItem('textReplacerSets');
    if (storedSets) {
        sets = JSON.parse(storedSets);
        console.log('Loaded sets from local storage:', sets);
        updateSetList();
    }
    
    // Add event listener for input changes
    document.getElementById('inputText').addEventListener('input', function() {
        console.log('Input text changed');
        saveTextState();
    });

    // Load dark mode preference
    const darkModeEnabled = localStorage.getItem('darkModeEnabled');
    if (darkModeEnabled === 'true') {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').checked = true;
    }

    // Add event listener for dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('change', function() {
        toggleDarkMode();
    });
};

function toggleDarkMode() {
    console.log('Dark mode toggled');
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkModeEnabled', isDarkMode);
}

function addTextPair() {
    console.log('Adding text pair');
    const text1 = document.getElementById('text1').value.trim();
    const text2 = document.getElementById('text2').value.trim();
    
    if (text1 && text2) {
        if (!currentSet) {
            currentSet = { name: document.getElementById('setName').value.trim() || 'Unnamed Set', pairs: [] };
        }
        currentSet.pairs.push([text1, text2]);
        console.log('Current set after adding pair:', currentSet);
        updateSetDisplay();
        document.getElementById('text1').value = '';
        document.getElementById('text2').value = '';
    } else {
        alert('Please enter both texts');
    }
}

function saveSet() {
    console.log('Saving set');
    if (currentSet && currentSet.pairs.length > 0) {
        sets[currentSet.name] = currentSet;
        localStorage.setItem('textReplacerSets', JSON.stringify(sets));
        console.log('Sets saved to local storage:', sets);
        currentSet = null;
        updateSetList();
        document.getElementById('setName').value = '';
        document.getElementById('text1').value = '';
        document.getElementById('text2').value = '';
        document.getElementById('currentSetPairs').innerHTML = '';
    } else {
        alert('Please add at least one text pair to the set');
    }
}

function updateSetDisplay() {
    console.log('Updating set display');
    const currentSetPairs = document.getElementById('currentSetPairs');
    const pairsHtml = currentSet.pairs.map((pair, index) => `
        <div class="textPair">
            <span>${pair[0]} ➞ ${pair[1]}</span>
            <div class="move-buttons">
                ${index > 0 ? `<button onclick="movePair(${index}, -1)">▲</button>` : ''}
                ${index < currentSet.pairs.length - 1 ? `<button onclick="movePair(${index}, 1)">▼</button>` : ''}
                <button onclick="removePair(${index})">Remove</button>
            </div>
        </div>
    `).join('');
    
    currentSetPairs.innerHTML = pairsHtml;
}

function removePair(index) {
    console.log(`Removing pair at index ${index}`);
    currentSet.pairs.splice(index, 1);
    updateSetDisplay();
}

function movePair(index, direction) {
    console.log(`Moving pair at index ${index} in direction ${direction}`);
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < currentSet.pairs.length) {
        const temp = currentSet.pairs[index];
        currentSet.pairs[index] = currentSet.pairs[newIndex];
        currentSet.pairs[newIndex] = temp;
        updateSetDisplay();
    }
}

function updateSetList() {
    console.log('Updating set list');
    const setList = document.getElementById('setList');
    setList.innerHTML = '<h2>Saved Sets</h2>';
    
    for (const setName in sets) {
        const set = sets[setName];
        const setHtml = `
            <div class="set">
                <h3>${set.name}</h3>
                ${set.pairs.slice(0, 3).map(pair => `
                    <div class="textPair">
                        <span>${pair[0]} ➞ ${pair[1]}</span>
                    </div>
                `).join('')}
                ${set.pairs.length > 3 ? `<div>... and ${set.pairs.length - 3} more</div>` : ''}
                <button onclick="selectSet('${set.name}')">Select</button>
                <button onclick="editSet('${set.name}')">Edit</button>
                <button onclick="if(confirm('Wirklich löschen?')) deleteSet('${set.name}')">Delete</button>
            </div>
        `;
        setList.innerHTML += setHtml;
    }
}

function selectSet(setName) {
    console.log(`Selecting set: ${setName}`);
    currentSet = sets[setName];
    document.getElementById('selectedSetName').textContent = setName;
}

function editSet(setName) {
    console.log(`Editing set: ${setName}`);
    currentSet = sets[setName];
    document.getElementById('setCreator').style.display = 'none';
    document.getElementById('setEditor').style.display = 'block';
    document.getElementById('editingSetName').textContent = setName;
    updateExistingPairs();
}

function updateExistingPairs() {
    console.log('Updating existing pairs for editing');
    const existingPairs = document.getElementById('existingPairs');
    existingPairs.innerHTML = '';
    
    // Create a container for the pairs that will handle the dragover event
    const pairsContainer = document.createElement('div');
    pairsContainer.addEventListener('dragover', handleDragOver);
    existingPairs.appendChild(pairsContainer);

    currentSet.pairs.forEach((pair, index) => {
        const pairElement = document.createElement('div');
        pairElement.className = 'textPair';
        pairElement.draggable = true;
        pairElement.dataset.index = index; // Add index as data attribute
        pairElement.innerHTML = `
            <span>${pair[0]} ➞ ${pair[1]}</span>
            <div class="move-buttons">
                <button onclick="removeExistingPair(${index})">Remove</button>
            </div>
        `;

        // Add drag event listeners
        pairElement.addEventListener('dragstart', handleDragStart);
        pairElement.addEventListener('dragend', handleDragEnd);
        pairElement.addEventListener('dragenter', handleDragEnter);
        pairElement.addEventListener('dragleave', handleDragLeave);
        pairElement.addEventListener('drop', handleDrop);

        pairsContainer.appendChild(pairElement);
    });
}

function addTextPairToExisting() {
    console.log('Adding text pair to existing set');
    const text1 = document.getElementById('editText1').value.trim();
    const text2 = document.getElementById('editText2').value.trim();
    
    if (text1 && text2) {
        currentSet.pairs.push([text1, text2]);
        console.log('Current set after adding pair:', currentSet);
        updateExistingPairs();
        document.getElementById('editText1').value = '';
        document.getElementById('editText2').value = '';
    } else {
        alert('Please enter both texts');
    }
}

function removeExistingPair(index) {
    console.log(`Removing existing pair at index ${index}`);
    currentSet.pairs.splice(index, 1);
    updateExistingPairs();
}

function moveExistingPair(index, direction) {
    console.log(`Moving existing pair at index ${index} in direction ${direction}`);
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < currentSet.pairs.length) {
        const temp = currentSet.pairs[index];
        currentSet.pairs[index] = currentSet.pairs[newIndex];
        currentSet.pairs[newIndex] = temp;
        updateExistingPairs();
    }
}

function saveEditedSet() {
    console.log('Saving edited set');
    sets[currentSet.name] = currentSet;
    localStorage.setItem('textReplacerSets', JSON.stringify(sets));
    console.log('Sets saved to local storage:', sets);
    document.getElementById('setCreator').style.display = 'block';
    document.getElementById('setEditor').style.display = 'none';
    updateSetList();
    document.getElementById('selectedSetName').textContent = currentSet.name;
}

function deleteSet(setName) {
    console.log(`Deleting set: ${setName}`);
    delete sets[setName];
    localStorage.setItem('textReplacerSets', JSON.stringify(sets));
    updateSetList();
    if (currentSet && currentSet.name === setName) {
        currentSet = null;
        document.getElementById('selectedSetName').textContent = 'None';
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Function to protect text within double square brackets during replacement
function protectBracketedText(text) {
    // Store protected text with unique placeholders
    const protectedTexts = [];
    let placeholderCounter = 0;
    
    // Replace all text within [[...]] with unique placeholders
    const protectedText = text.replace(/\[\[([^\]]+)\]\]/g, (match, content) => {
        const placeholder = `__PROTECTED_${placeholderCounter}__`;
        protectedTexts.push({ placeholder, content });
        placeholderCounter++;
        return placeholder;
    });
    
    return { protectedText, protectedTexts };
}

// Function to restore protected text after replacement
function restoreProtectedText(text, protectedTexts) {
    let restoredText = text;
    
    // Restore all protected text from placeholders
    protectedTexts.forEach(({ placeholder, content }) => {
        restoredText = restoredText.replace(placeholder, `[[${content}]]`);
    });
    
    return restoredText;
}

function saveTextState() {
    console.log('Saving text state');
    const currentText = document.getElementById('inputText').value;
    if (textHistory.length === 0 || currentText !== textHistory[textHistory.length - 1]) {
        textHistory.push(currentText);
        console.log('Text history:', textHistory);
        if (textHistory.length > MAX_HISTORY) {
            textHistory.shift();
        }
        updateUndoButton();
    }
}

function updateUndoButton() {
    console.log('Updating undo button state');
    const undoButton = document.getElementById('undoButton');
    undoButton.disabled = textHistory.length <= 1;
}

function undoLastAction() {
    console.log('Undoing last action');
    if (textHistory.length > 1) {
        textHistory.pop(); // Remove the current state
        const previousText = textHistory[textHistory.length - 1];
        document.getElementById('inputText').value = previousText;
        updateUndoButton();
    }
}

function replaceText() {
    console.log('Replacing text using current set');
    if (!currentSet) {
        alert('Please select a set first');
        return;
    }

    saveTextState(); // Save the current state before replacing

    let inputText = document.getElementById('inputText').value;
    
    // Protect text within double square brackets
    const { protectedText, protectedTexts } = protectBracketedText(inputText);
    
    // Perform replacements on the protected text
    let workingText = protectedText;
    currentSet.pairs.forEach(pair => {
        const [from, to] = pair;
        console.log(`Replacing "${from}" with "${to}"`);
        const regex = new RegExp(escapeRegExp(from), 'gi');
        workingText = workingText.replace(regex, to);
    });
    
    // Restore protected text
    inputText = restoreProtectedText(workingText, protectedTexts);

    document.getElementById('inputText').value = inputText;
    saveTextState(); // Save the state after replacing
}

function copyToClipboard() {
    console.log('Copying text to clipboard');
    const textArea = document.getElementById('inputText');
    textArea.select();
    document.execCommand('copy');
    
    const copyButton = document.getElementById('copyButton');
    const originalText = copyButton.textContent;
    copyButton.textContent = 'Copied!';
    setTimeout(() => {
        copyButton.textContent = originalText;
    }, 2000);
}

function exportData() {
    console.log('Exporting data');
    const data = JSON.stringify(sets);
    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text_replacer_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData() {
    console.log('Importing data');
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                console.log('Imported data:', importedData);
                sets = importedData;
                localStorage.setItem('textReplacerSets', JSON.stringify(sets));
                updateSetList();
                alert('Data imported successfully!');
            } catch (error) {
                console.error('Error importing data:', error);
                alert('Error importing data. Please make sure the file is valid.');
            }
        };
        reader.readAsText(file);
    }
}

function quickReplace() {
    console.log('Quick replace triggered');
    const text1 = document.getElementById('quickText1').value;
    const text2 = document.getElementById('quickText2').value;
    
    if (text1 && text2) {
        saveTextState(); // Save the current state before replacing

        let inputText = document.getElementById('inputText').value;
        console.log(`Replacing "${text1}" with "${text2}" using quick replace`);
        
        // Simple text replacement without bracket protection for quick replace
        const regex = new RegExp(escapeRegExp(text1), 'g');
        inputText = inputText.replace(regex, text2);
        
        document.getElementById('inputText').value = inputText;
        saveTextState(); // Save the state after replacing
    } else {
        alert('Please enter both texts for quick replace');
    }
}

function openHelpModal() {
    console.log('Opening help modal');
    document.getElementById('helpModal').style.display = 'block';
}

function closeHelpModal() {
    console.log('Closing help modal');
    document.getElementById('helpModal').style.display = 'none';
}

// Close the modal when clicking outside of it
window.onclick = function(event) {
    if (event.target == document.getElementById('helpModal')) {
        closeHelpModal();
    }
}

let draggedItem = null;
let draggedIndex = null;

function handleDragStart(e) {
    draggedItem = this;
    draggedIndex = parseInt(this.dataset.index);
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedItem = null;
    draggedIndex = null;
    
    // Remove any remaining drag-related classes
    document.querySelectorAll('.textPair').forEach(pair => {
        pair.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    if (this !== draggedItem) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    if (draggedItem === this) return;
    
    const droppedIndex = parseInt(this.dataset.index);
    
    // Reorder the pairs in the currentSet
    const [movedPair] = currentSet.pairs.splice(draggedIndex, 1);
    currentSet.pairs.splice(droppedIndex, 0, movedPair);
    
    // Update the display
    updateExistingPairs();
}

function transcriptMatch() {
    console.log('Transcript matching triggered');
    saveTextState(); // Aktuellen Zustand speichern

    let inputText = document.getElementById('inputText').value;
    
    // Verbesserter Regex der nur exakt das Format "Text, Text (Text)" matched
    // ^ - Beginn des Matches
    // [^,\n]+ - Beliebiger Text außer Komma und Zeilenumbruch (Nachname)
    // ,\s+ - Komma gefolgt von Leerzeichen
    // [^(\n]+ - Beliebiger Text außer öffnende Klammer und Zeilenumbruch (Vorname)
    // \s*\([^)]*\) - Klammern mit beliebigem Inhalt
    // $ - Ende des Matches
    const regex = /(^|[^[])([^,\n]+),\s+([^(\n]+)\s*\([^)]*\)/g;
    
    // Text ersetzen
    inputText = inputText.replace(regex, (match, prefix, nachname, vorname) => {
        // Wenn der Match am Anfang steht, ist prefix leer, sonst enthält es das Zeichen vor dem Match
        nachname = nachname.trim();
        vorname = vorname.trim();
        return `${prefix}[[${vorname} ${nachname}]]`;
    });
    
    document.getElementById('inputText').value = inputText;
    saveTextState(); // Neuen Zustand speichern
} 