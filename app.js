const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');
// app.use(express.static('public'));
app.use(express.static(__dirname + 'public'))


app.get('/', (req, res) => res.render('index', { data: '', renderToTable: [], code: '', totalBits: '', averageBits: '' }))

app.post('/uploaded', (req, res) => {
    // console.log("file location ", req.body.fileLocation);
    let fileLocation = req.body.fileLocation;
    let textAreaContent = req.body.textarea;
    if (fileLocation)
        fs.readFile(fileLocation, (err, data) => {
            if (err)
                console.log(err);
            let freq_table = buildFrequencyTable(data.toString());
            let root = buildHuffmanTree(freq_table);

            let objectForNode = new huffmanNode;
            let resArray = [];
            objectForNode.traverseTheTree(root, "", resArray);
            // console.log(resArray);
            let resStr = compressedCode(resArray, data.toString());

            res.render('index', { data: data, renderToTable: resArray, code: resStr, totalBits: countBits(resArray), averageBits: averageBits(resArray) });
        })
    else if (textAreaContent) {
        let freq_table = buildFrequencyTable(textAreaContent.toString());
        let root = buildHuffmanTree(freq_table);

        let objectForNode = new huffmanNode;
        let resArray = [];
        objectForNode.traverseTheTree(root, "", resArray);
        // console.log(resArray);
        let resStr = compressedCode(resArray, textAreaContent.toString());

        res.render('index', { data: textAreaContent.toString(), renderToTable: resArray, code: resStr, totalBits: countBits(resArray), averageBits: averageBits(resArray) });
    }
})

class huffmanNode {
    constructor(character, frequency, left, right) {
        this.character = character;
        this.frequency = frequency;
        this.left = left;
        this.right = right;
    }
    traverseTheTree(root, str, obj) {
        if (root === null)
            return;
        if (root.left === null && root.right === null) {
            obj.push({ character: root.character, frequency: root.frequency, code: str });
        }
        this.traverseTheTree(root.left, str + '0', obj);
        this.traverseTheTree(root.right, str + '1', obj);
    }
}

const buildFrequencyTable = (data) => {
    let freq_table = Array(256).fill(0);
    for (let i = 0; i < data.length; i++) {
        // console.log(data.charCodeAt(i))
        freq_table[data.charCodeAt(i)]++;
    }
    return freq_table;
}

const buildHuffmanTree = (freq_table) => {
    let priorityQueue = [];
    for (let i = 0; i < freq_table.length; i++)
        if (freq_table[i] > 0)
            priorityQueue.push(new huffmanNode(String.fromCharCode(i), freq_table[i], null, null));
    let pqSorted = sortAccordingToFreqOrCharacter(priorityQueue);

    while (pqSorted.length > 1) {
        let left = pqSorted.shift();
        let right = pqSorted.shift();
        let parent = new huffmanNode('\0', left.frequency + right.frequency, left, right);
        pqSorted.push(parent);
        let temp = pqSorted;
        pqSorted = sortAccordingToFreqOrCharacter(temp);
    }
    // console.log(pqSorted[0].left);
    return pqSorted.shift();
}

function sortAccordingToFreqOrCharacter(priorityQueue) {
    for (let i = 0; i < priorityQueue.length; i++) {
        for (let j = 0; j < priorityQueue.length - i - 1; j++) {
            if (priorityQueue[j].frequency > priorityQueue[j + 1].frequency) {
                let temp = priorityQueue[j];
                priorityQueue[j] = priorityQueue[j + 1];
                priorityQueue[j + 1] = temp;
            } else if (priorityQueue[j].frequency === priorityQueue[j + 1].frequency) {
                if (priorityQueue[j].character > priorityQueue[j + 1].character) {
                    let temp = priorityQueue[j];
                    priorityQueue[j] = priorityQueue[j + 1];
                    priorityQueue[j + 1] = temp;
                }
            }
        }
    }
    return priorityQueue;
}

function compressedCode(resArray, data) {
    let resStr = '';
    let helperStr = '';
    for (let i = 0; i < resArray.length; i++) {
        helperStr += resArray[i].character;
    }
    for (let i = 0; i < data.length; i++) {
        let index = helperStr.indexOf(data.charAt(i));
        resStr += resArray[index].code + " ";
    }
    return resStr;
}

function countBits(resArray) {
    let count = 0;
    for (let i = 0; i < resArray.length; i++) {
        count += resArray[i].frequency * resArray[i].code.length;
    }
    return count;
}

function averageBits(resArray) {
    let totalBits = countBits(resArray);
    let count = 0;
    for (let i = 0; i < resArray.length; i++)
        count += resArray[i].frequency;
    return (totalBits / count).toFixed(2);
}

const port = Process.env.PORT || 2000
app.listen(port, () => console.log('Port active at 2000'))