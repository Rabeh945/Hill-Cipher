const addSizeBtn = document.getElementById('add-size');
const delSizeBtn = document.getElementById('remove-size');

const encryptBtn = document.getElementById('encrypt-btn')
const decryptBtn = document.getElementById('decrypt-btn')

const alphabet = 'abcdefghijklmnopqrstuvwxyz'
const resultField = document.getElementById('result')
const keyTable = document.getElementById('code').children[0]


addSizeBtn.addEventListener("click", addSize);
delSizeBtn.addEventListener("click", removeSize);

encryptBtn.addEventListener('click', () => {
    let string = encrypt()
    if (string.includes('undefined')) {
        afficher('Matrix non invertible')
    } else {
        afficher(string)
    }
})
decryptBtn.addEventListener('click', () => {
    let string = decrypt()
    if (string.includes('undefined')) {
        afficher('Matrix non invertible')
    } else {
        afficher(string)
    }

})

function afficher(string) {
    result = document.getElementById('result').children[0]
    result.textContent = string
}

function addRow() {
    let rows = document.querySelectorAll('tr')
    let cols = document.querySelectorAll('td')
    let tr = document.createElement('tr')
    tr.id = rows.length + 1
    for (let i = 0; i < cols.length / rows.length; i++) {
        let td = document.createElement('td')
        let input = document.createElement('input')
        input.type = 'text';
        td.id = i;
        td.append(input)
        tr.append(td)
    }
    keyTable.append(tr)
}

function addCol() {
    let rows = document.querySelectorAll('tr')
    let cols = document.querySelectorAll('td')
    let td = document.createElement('td')
    td.id = cols.length / rows.length
    let input = document.createElement('input')
    input.type = 'text';
    td.append(input)
    rows.forEach(tr => {
        let clonedTd = td.cloneNode(true);
        tr.appendChild(clonedTd);
    });

}

function addSize() {
    addRow();
    addCol();
}

function removeCol() {
    let rows = document.querySelectorAll('tr');
    rows.forEach(tr => {
        let lastCell = tr.lastElementChild;
        if (lastCell) {
            if (tr.childElementCount > 2) {
                tr.removeChild(lastCell);
            }
        }
    });
}

function removeRow() {
    let table = document.querySelector('table');
    let rowCount = table.rows.length;
    if (rowCount > 2) {
        table.deleteRow(rowCount - 1);
    }
}

function removeSize() {
    removeCol()
    removeRow()
}

function plainTextToBlocks(plaintext, matrixSize) {
    let blocks = [];
    let blockLength = matrixSize;
    if (plaintext !== null) {
        if (plaintext.length % matrixSize !== 0) {
            let missingChars = matrixSize - (plaintext.length % matrixSize);
            plaintext += 'x'.repeat(missingChars);
            //console.log(plaintext)
        }

        for (let i = 0; i < plaintext.length; i += blockLength) {
            let block = [];
            for (let j = i; j < i + blockLength; j++) {
                let charIndex = alphabet.indexOf(plaintext[j]);
                block.push(charIndex);
            }
            blocks.push(block);
        }
        return blocks;
    }

}

function getKeyAsPairs() {
    let table = keyTable
    let key = Array.from(table.rows, row => Array.from(row.cells, cell => Number(cell.querySelector('input').value)));
    return key
}




function encrypt() {
    let plaintext = document.getElementById('plaintext').value
    plaintext = plaintext.toString()
    let matrixSize = document.querySelector('table').rows.length
    let key = getKeyAsPairs()
    let blocks = plainTextToBlocks(plaintext, matrixSize);
    let cipherBlocks = []
    let tempBlock = []
    let result = '';

    blocks.forEach(block => {
        for (let i in block) {
            tempBlock = []
            for (let j in key) {
                // console.log(block[j] + '*' + key[i][j])
                tempBlock.push(block[j] * key[i][j])
            }
            cipherBlocks.push(tempBlock)
        }
    })
    cipherBlocks = cipherBlocks.map(block => {
        let sum = 0
        block.forEach(num => {
            sum += num
        })
        return sum;
    })
    cipherBlocks = cipherBlocks.map(num => {
        let sum = 0
        sum = num % 26
        return sum
    })

    cipherBlocks.map(num => {
        result += alphabet[num];
    });
    return result;

}

function detInverse(matrix) {
    const detInverseT = [
        [1, 1],
        [3, 9],
        [5, 21],
        [7, 15],
        [9, 3],
        [11, 19],
        [15, 7],
        [17, 23],
        [19, 11],
        [21, 5],
        [23, 17]

    ]
    let detI
    matrixDet = Math.abs(math.det(matrix) % 26)
    detInverseT.forEach(det => {
        if (matrixDet === det[0]) {
            //console.log(det[1])
            detI = det[1];
        }
    })
    return detI;

}

function minor(matrix) {
    let result = [];
    let tempResult = [];
    for (let row = 0; row < matrix.length; row++) {
        let minors = [];
        for (let col = 0; col < matrix.length; col++) {
            let minor = [];
            for (let i = 0; i < matrix.length; i++) {
                if (i !== row) {
                    let temp = [];
                    for (let j = 0; j < matrix[i].length; j++) {
                        if (j !== col) {
                            temp.push(matrix[i][j]);
                        }
                    }
                    minor.push(temp);
                }
            }
            minors.push(math.det(minor));
        }
        tempResult.push(minors)
    }
    //console.log(tempResult)
    result = signFactor(tempResult);
    //console.log(result)
    return math.transpose(result);
}

function signFactor(matrix) {
    return matrix.map((row, i) => {
        return row.map((element, j) => {
            return element * Math.pow(-1, i + j);
        });
    });
}


function decryptedMatrix() {
    let matrix = getKeyAsPairs()
    let detI = detInverse(matrix)
    let minorMatrix = minor(matrix)

    minorMatrix = minorMatrix.map(row => row.map(element => element * detI));
    //console.log(minorMatrix)
    let encryptedPT = [];
    for (let i = 0; i < minorMatrix.length; i++) {
        let row = [];
        for (let j = 0; j < minorMatrix.length; j++) {
            row.push(math.mod(minorMatrix[i][j], 26));
        }
        encryptedPT.push(row);
    }
    //console.log(encryptedPT)
    return encryptedPT;
}

function decrypt() {
    let plaintext = document.getElementById('plaintext').value
    plaintext = plaintext.toString()
    let matrixSize = document.querySelector('table').rows.length
    let key = decryptedMatrix()
    let blocks = plainTextToBlocks(plaintext, matrixSize);
    let cipherBlocks = []
    let tempBlock = []
    let result = '';
    //console.log(key)
    //console.log(blocks)
    blocks.forEach(block => {
        for (let i in block) {
            tempBlock = []
            for (let j in key) {
                //console.log(block[j] + '*' + key[i][j])
                tempBlock.push(block[j] * key[i][j])
            }
            cipherBlocks.push(tempBlock)
        }
    })
    cipherBlocks = cipherBlocks.map(block => {
        let sum = 0
        block.forEach(num => {
            sum += num
        })
        return sum;
    })
    cipherBlocks = cipherBlocks.map(num => {
        let sum = 0
        sum = num % 26
        return sum
    })

    cipherBlocks.map(num => {
        result += alphabet[num];
    });
    return result;
}