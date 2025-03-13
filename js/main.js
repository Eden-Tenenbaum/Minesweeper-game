'use strict'
var gBoard
var gLevel = { SIZE: 4, MINES: 2 }
var gGame = {
    isOn: false,
    secPassed: 0,
    markedCount: 0,
    revealedCount: 0,
}
var gTimerInterval;
// console.table(buildBoard())




function onInit() {
    console.log("starting...")

    gGame = {
        isOn: true,
        secPassed: 0,
        markedCount: 0,
        revealedCount: 0,
    }

    clearInterval(gTimerInterval)
    gTimerInterval = null
    document.querySelector('.timer').innerText = '0'

    document.querySelector('.smiley').innerText = '😊'

    document.querySelector('.mines-count').innerText = gLevel.MINES


    gBoard = buildBoard()
    renderBoard(gBoard)
}

function setLevel(size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines
    onInit()
}

function buildBoard() {
    var board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                isMarked: false,
                isMine: false,
                isCovered: true,
                minesAroundCount: 0,
            }
        }
    }
    placeMines(board)
    setMinesNegsCount(board)
    return board
}


function placeMines(board) {
    var minesPlaced = 0

    while (minesPlaced < gLevel.MINES) {
        var i = getRandomInt(0, gLevel.SIZE)
        var j = getRandomInt(0, gLevel.SIZE)

        if (!board[i][j].isMine) {
            board[i][j].isMine = true
            minesPlaced++
        }
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (!board[i][j].isMine) {
                board[i][j].minesAroundCount = countNeighborMines(board, i, j)
            }
        }
    }
}

function countNeighborMines(board, rowIdx, colIdx) {
    var count = 0

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue
            if (i === rowIdx && j === colIdx) continue

            if (board[i][j].isMine) count++
        }
    }

    return count
}

function renderBoard(board) {
    var strHTML = ''
    strHTML += `<table>`
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            var className = `cell cell-${i}-${j}`
            if (!cell.isCovered) {
                className += ' revealed'

            }
            if (cell.isMarked) {
                className += ' marked'

            }
            strHTML += `<td class="${className}"
                        onclick = "onCellClicked(this, ${i},${j})"
                        oncontextmenu = "onCellMarked(event, this, ${i},${j}); return false;">`


            if (!cell.isCovered) {
                if (cell.isMine) {
                    strHTML += '💣'
                } else if (cell.minesAroundCount > 0) {
                    strHTML += `<span class="mines-${cell.minesAroundCount}">${cell.minesAroundCount}</span>`
                }
            }
            if (cell.isMarked) {
                strHTML += '🚩'
            }
            strHTML += `</td>`
        }
        strHTML += `</tr>`
    }
    strHTML += `</table>`
    document.querySelector('.board-container').innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn || gBoard[i][j].isMarked) return

    if (!gGame.timerStarted) {
        startTimer()
        gGame.timerStarted = true
    }


    if (gGame.revealedCount === 0 && gGame.markedCount === 0) {
        startTimer()
    }
    var cell = gBoard[i][j]
    if (!cell.isCovered) return

    cell.isCovered = false
    gGame.reveledCount++

    if (cell.isMine) {
        gameOver(false)

    } else if (cell.minesAroundCount === 0) {
        expandReveal(gBoard, i, j)
    }

    checkGameOver();


    renderBoard(gBoard)

}

function onCellMarked(event, elCell, i, j) {
    event.preventDefault();

    if (!gGame.isOn || !gBoard[i][j].isCovered) return;

    if (!gGame.timerStarted) {
        startTimer()
        gGame.timerStarted = true
    }

    if (gGame.revealedCount === 0 && gGame.markedCount === 0) {
        startTimer();
    }

    var cell = gBoard[i][j];
    cell.isMarked = !cell.isMarked;

    gGame.markedCount += cell.isMarked ? 1 : -1;

    var minesLeft = gLevel.MINES - gGame.markedCount;
    document.querySelector('.mines-count').innerText = minesLeft;


    checkGameOver()


    renderBoard(gBoard)
}


function expandReveal(board, i, j) {
    for (var row = i - 1; row <= i + 1; row++) {
        if (row < 0 || row >= gLevel.SIZE) continue;

        for (var col = j - 1; col <= j + 1; col++) {
            if (col < 0 || col >= gLevel.SIZE) continue;
            if (row === i && col === j) continue;

            var currCell = board[row][col];

            if (currCell.isCovered && !currCell.isMarked) {
                currCell.isCovered = false;
                gGame.revealedCount++;

                if (currCell.minesAroundCount === 0) {
                    expandReveal(board, row, col);
                }
            }
        }
    }
}


function checkGameOver() {
    var nonMineCells = gLevel.SIZE * gLevel.SIZE - gLevel.MINES;
    if (gGame.revealedCount === nonMineCells) {
        for (var i = 0; i < gLevel.SIZE; i++) {
            for (var j = 0; j < gLevel.SIZE; j++) {
                if (gBoard[i][j].isMine && !gBoard[i][j].isMarked) {
                    gBoard[i][j].isMarked = true;
                    gGame.markedCount++;
                }
            }
        }
        gameOver(true);

        document.querySelector('.mines-count').innerText = 0;
    }
}



function gameOver(isWin) {
    gGame.isOn = false;
    clearInterval(gTimerInterval);

    document.querySelector('.smiley').innerText = isWin ? '😎' : '😵';

    if (!isWin) {
        for (var i = 0; i < gLevel.SIZE; i++) {
            for (var j = 0; j < gLevel.SIZE; j++) {
                if (gBoard[i][j].isMine) {
                    gBoard[i][j].isCovered = false;
                }
            }
        }
        renderBoard(gBoard);
    }
}



function startTimer() {
    if (gameOver === true) return
    if (gTimerInterval) {
        clearInterval(gTimerInterval);
    }
    gGame.secPassed = 0;
    var elTimer = document.querySelector('.timer')
    elTimer.innerText = '0'

    gTimerInterval = setInterval(() => {
        gGame.secPassed++
        elTimer.innerText = gGame.secPassed

    }, 1000)
}



