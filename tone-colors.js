const Note = Tonal.Note

const resultsDiv = document.getElementById('results-div')
const playToneButton = document.getElementById('play-button')
const toneColorInput = document.getElementById('tone-color')
const submitButton = document.getElementById('form-button')
const seeResultsButton = document.getElementById('see-results-button')
const nextButton = document.getElementById('next-button')


const notes = (()=>{
    let names = []
    const white = Note.names()
    for (let i=0; i<white.length; i++) {
        names.push(white[i])
        names.push(`${white[i]}#`)
        names.push(`${white[i]}b`)
    }
    return names
})()

var toneColors = initToneColors()
var currentNote
var currentOctave

function initToneColors() {
    let colors = {}
    for (let i=0; i<notes.length; i++) {
        colors[notes[i]] = []
    }
    return colors;
}

function playFreq (frequency, duration = 1e3){
    const context = new AudioContext();
    const gainNode = context.createGain();
    const oscillator = context.createOscillator();
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start(0);
    setTimeout(() => oscillator.stop(), duration);
};

// blend two hex colors together by an amount
function blendColors(colorA, colorB, amount) {
    const [rA, gA, bA] = colorA.match(/\w\w/g).map((c) => parseInt(c, 16));
    const [rB, gB, bB] = colorB.match(/\w\w/g).map((c) => parseInt(c, 16));
    const r = Math.round(rA + (rB - rA) * amount).toString(16).padStart(2, '0');
    const g = Math.round(gA + (gB - gA) * amount).toString(16).padStart(2, '0');
    const b = Math.round(bA + (bB - bA) * amount).toString(16).padStart(2, '0');
    return '#' + r + g + b;
  }

function renderResults() {
    for (let i=0; i<notes.length; i++) {
        function renderLabelColor(label, color) {
            const div = document.createElement('div')
            div.classList.add('label-color-div')
            const labelEl = document.createElement('p')
            labelEl.appendChild(document.createTextNode(label))
            labelEl.classList.add('label')

            const colorEl = document.createElement('p')
            colorEl.appendChild(document.createTextNode(color))
            colorEl.classList.add('color')
            colorEl.style.backgroundColor = color;

            div.appendChild(labelEl)
            div.appendChild(colorEl)
            resultsDiv.appendChild(div)
        }
        
        // render avg color
        function calcAvgColor(colors) {
            if (colors.length < 2) {
               return undefined
            }
           

            function blendManyColors(colors) {
                let l = shuffle(colors)
               
                // make even
                if (l.length % 2 > 0) {
                    console.log(colors, l)
                    l.pop()
                }
                while (l.length != 1) {
                    let blended = []
                    for (let i=0; i<l.length/2; i++) {
                        blended.push(blendColors(l[i], l[i+1], 0.5))
                    }
                    l = blended
    
                }
                return l[0]
            }

            let possAvgs = []
            for (let i=0; i<100; i++) {
                possAvgs.push(blendManyColors(colors))
            }
            return blendManyColors(possAvgs)
        }
        
        renderLabelColor(notes[i], calcAvgColor(toneColors[notes[i]]))

    }
}

function getRandomItem(items) {
    return items[Math.floor(Math.random()*items.length)];
}

function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

function saveToneColor() {
    const note = currentNote
    const color = toneColorInput.value

    toneColors[note].push(color)
}

function nextTone() {
    currentNote = getRandomItem(notes)
    currentOctave = getRandomInteger(2, 5)
}

nextButton.onclick = function() {
    nextTone()
    toneColorInput.value = "#000000"
}

submitButton.onclick = function() {
    saveToneColor();
}

playToneButton.onclick = function() {
    const freq = Note.get(`${currentNote}${currentOctave}`).freq
    const dur = getRandomInteger(500, 1000)
    playFreq(freq, dur)
}

seeResultsButton.onclick = function() {
    // clear
    resultsDiv.innerHTML = '';
    renderResults();
    console.log(toneColors)
    for (note in toneColors) {
        console.log(`${note} ${toneColors[note]}`)
    }
}