import BLOCKS from "./blocks.js"

//DOM
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const restartButton = document.querySelector(".game-text > button")
//Setting
const GAME_ROWS = 20;
const GAME_COLS = 10;

// variables 점수
let score = 0;      //점수
let duration = 500; //블럭이 떨어지는 시간
let downInterval;   //
let tempMovingItem; //movingItem 잠깐 담아두는 변수



const movingItem = {
    type: "",
    direction: 0,       //블럭 회전 지표
    top: 0,             //블럭의 x이동거리
    left: 0,            //블럭의 y이동거리
};

init()

// functions
function init() {
    tempMovingItem = { ...movingItem };

    for (let i = 0; i < GAME_ROWS; i++) {
         prependNewLine()
    }
    generateNewBlock()
}

function prependNewLine() {
    const li = document.createElement("li");
    const ul = document.createElement("ul");
    
    for (let j = 0; j < GAME_COLS; j++) {
        const matrix = document.createElement("li");
        ul.prepend(matrix);
    }
    li.prepend(ul)
    playground.prepend(li)
}

function renderBlocks(moveType = "") {
    const { type, direction, top, left } = tempMovingItem;

    //이동 후 남는 색 없앰
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => { 
        moving.classList.remove(type, "moving");
    })

    BLOCKS[type][direction].some(block => {
        const x = block[0] + left;
        const y = block[1] + top;
        const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
        // 위에 삼항연산자는 블럭이 벽에 닿았을때 멈출수 있도록
        const isAvailable = checkEmpty(target);
        if(isAvailable) {
            target.classList.add(type, "moving")
        } else {
            tempMovingItem = { ...movingItem }
            if(moveType === 'retry') {
                clearInterval(downInterval)
                showGameoverText()
            }
            setTimeout( ()=> {
                renderBlocks('retry')
                if(moveType === "top") {
                    seizeBlock();
                }
            }, 0)
            return true;
        }
    })
    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction;
}

function seizeBlock() {
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => { 
        moving.classList.remove("moving");
        moving.classList.add("seized");
    })
    checkMatch()
}

function checkMatch() {
    const childNodes = playground.childNodes;
    childNodes.forEach(child => {
        let matched = true;
        child.children[0].childNodes.forEach(li => {
            if(!li.classList.contains("seized")) {
                matched = false;
            }
        })
        if(matched) {
            child.remove();
            prependNewLine()
            score++;
            scoreDisplay.innerText = score;
        }
    })
    generateNewBlock()
}

function generateNewBlock() { 

    clearInterval(downInterval);  //블럭 자동으로 내려오도록 설정
    downInterval = setInterval(() => {
        moveBlock('top', 1)
    }, duration)

    const blockArray = Object.entries(BLOCKS);
    const randomIndex = Math.floor(Math.random() * blockArray.length)
    
    movingItem.type = blockArray[randomIndex][0]
    movingItem.top = 0;
    movingItem.left = 3;
    movingItem.direction = 0;
    tempMovingItem = { ...movingItem }
    renderBlocks();
}

function checkEmpty(target) {
    if(!target || target.classList.contains("seized")) {
        return false;
    }
    return true;
}

function moveBlock(moveType, amount) {
    tempMovingItem[moveType] += amount;
    renderBlocks(moveType)
}

function changeDirection() {
    const direction = tempMovingItem.direction;
    direction === 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction += 1;
    renderBlocks()
}

function dropBlock() {
    clearInterval(downInterval);
    downInterval = setInterval(() => {
        moveBlock("top", 1)
    }, 10)
}

function showGameoverText() {
    gameText.style.display = "flex"
}

// event handling
document.addEventListener("keydown", e=> {
    switch(e.keyCode) {
        case 39:
            moveBlock("left", 1);
            break;
        case 37:
            moveBlock("left", -1);
            break;
        case 40:
            moveBlock("top", 1);
            break;
        case 88:
            changeDirection();
            break;
        case 90:
            dropBlock();
            break;
        default:
            break;
    }
    //console.log(e)
})

restartButton.addEventListener("click", () => {
    playground.innerHTML = "";
    gameText.style.display = "none";
    init()
})