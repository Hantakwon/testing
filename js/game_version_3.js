// Game 요소 가져오기
const game = document.querySelector("#game");
const characterImg = document.querySelector("#character");
const hitbox = document.querySelector("#hitbox");
const hpDiv = document.querySelector("#hp");
const levelDiv = document.querySelector("#level");
const scoreDiv = document.querySelector("#score");

// 전역에서 써야되는 변수들
// 이미지
let stand_img = ""; 
let walk_img = "";
let atk_img = "";
let heal_img = "";

// 이미지 위치 자료
let center_offset_x = 0;
let center_offset_y = 0;
const gameRect = game.getBoundingClientRect();    
console.log(gameRect);
const position = { x: gameRect.x + gameRect.width / 2 , y: gameRect.y + gameRect.height / 2}; // 초기 위치

// 이미지 결정 boolean 값
let isAtkMode = false;
let isMoving = false;
let isFacingRight = false; // 캐릭터가 오른쪽을 보고 있는 상태
let currentState = "stand";

// 키보드 입력
const keysPressed = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

// 캐릭터 정보
let prevHp, prevLevel, prevScore;
let hp; // HP
let atk; // 데미지
let speed; // 이동 속도
let level = 0; // 레벨
let score = 0; // 점수
let canTakeDamage = true;

// 몬스터 정보
let monsters = []; // 몬스터들을 저장할 배열

// API 호출 및 데이터 가져오기
async function fetchCharacterStatus(characterName) {
    try {
        const characterResponse = await fetch(`http://127.0.0.1:8000/character/status/${characterName}`);
        const characterData = await characterResponse.json();

        const monsterResponse = await fetch(`http://127.0.0.1:8000/monster/info`);
        const monsterData = await monsterResponse.json();

        console.log(characterData);
        console.log(monsterData);

        if (characterData.error || monsterData.error) {
            alert(characterData.error);
            return;
        }

        setGameData(characterData);
        setCharacter(characterData);
        setHitbox(characterData);
        spawnMonster(monsterData);

    } catch (error) {
        console.error('Error fetching character status:', error);
    }
}

// ------------- < Game 데이터 설정 > ---------------------

// 게임 기본 데이터 설정
function setGameData(characterData){
    hp = parseInt(characterData.hp);
    atk = parseInt(characterData.atk);
    speed = parseInt(characterData.speed);

    updateGameData();
}

function updateGameData() {
    if (hp !== prevHp) {
        hpDiv.innerText = `HP : ${hp}`;
        prevHp = hp;
    }
    if (level !== prevLevel) {
        levelDiv.innerText = `LEVEL : ${level}`;
        prevLevel = level;
    }
    if (score !== prevScore) {
        scoreDiv.innerText = `SCORE : ${score}`;
        prevScore = score;
    }
}

// 충돌 감지
function checkCollision(monster) {
    const hitboxRect = hitbox.getBoundingClientRect(); // 캐릭터 히트박스의 위치와 크기
    const monsterRect = monster.element.getBoundingClientRect(); // 몬스터의 위치와 크기    

    // 히트박스와 몬스터가 겹치는지 확인
    const isColliding =
        hitboxRect.left < monsterRect.right &&
        hitboxRect.right > monsterRect.left &&
        hitboxRect.top < monsterRect.bottom &&
        hitboxRect.bottom > monsterRect.top;

    if (isColliding && canTakeDamage) { // 충돌했으며 데미지를 받을 수 있는 상태라면
        hp -= 1; // HP 감소
        updateGameData(); // HP 업데이트

        canTakeDamage = false; // 일정 시간 동안 추가 데미지를 받지 않도록 설정
        setTimeout(() => canTakeDamage = true, 1000); // 1초 후 다시 데미지를 받을 수 있도록 설정

        if (hp <= 0) { // HP가 0 이하가 되면 게임 종료
            alert("Game Over!");
            cancelAnimationFrame(moveCharacter); // 게임 루프 중지
        }
    }
}

// 게임 루프
function startGame(monster) {
    moveCharacter(); // 캐릭터 이동 업데이트

    
    // 몬스터 움직임 및 충돌 감지
    monsters.forEach((monster) => {
        moveMonster(monster); // 몬스터 이동
        checkCollision(monster); // 충돌 감지
    });
    
    // moveMonster(monster);
    // checkCollision(monster);

    updateGameData(); // 게임 상태 업데이트
    requestAnimationFrame(startGame); // 다음 프레임 요청
}


// ---------------------- < 캐릭터 설정 > --------------------
// 캐릭터 이미지 설정
function setCharacter(characterData) {
    characterImg.style.width = `${characterData.imagesize[0]}px`;
    characterImg.style.height = `${characterData.imagesize[1]}px`;

    stand_img = characterData.stand_img;
    walk_img = characterData.walk_img;
    atk_img = characterData.atk_img;
    heal_img = characterData.heal_img || "";

    characterImg.src = stand_img;

    characterImg.style.border = "2px dashed red";
    characterImg.style.position = "absolute";
}

function updateCharacter(state) {
	if(state === 'stand') {
		return stand_img;
	}	
	else if (state === 'walk') {
		return walk_img;
	}
}

// 히트 박스 설정
function setHitbox(characterData) {
    const { width, height } = characterData.hitbox;
    
    hitbox.style.width = `${width}px`;
    hitbox.style.height = `${height}px`;

    hitbox.style.border = "2px dashed red";
    hitbox.style.position = "absolute";

    center_offset_x = characterData.hitbox.center_offset.x;
    center_offset_y = characterData.hitbox.center_offset.y;
}

document.addEventListener("keydown", (event) => {
    if (event.key === 'a' || event.key === 'A') {
        if (!isAtkMode) {
            isAtkMode = true;
            characterImg.src = atk_img;

            setTimeout(() => {
                isAtkMode = false;
                characterImg.src = isMoving ? walk_img : stand_img;
            }, 700);
        }
        return;
    }

    if (keysPressed.hasOwnProperty(event.key)) {
        keysPressed[event.key] = true;
    }
});

document.addEventListener("keyup", (event) => {
    if (keysPressed.hasOwnProperty(event.key)) {
        keysPressed[event.key] = false;
    }
});

function moveCharacter() {
    const characterImgWidth = parseFloat(characterImg.style.width);
    const hitboxWidth = parseFloat(hitbox.style.width); // 문자열을 숫자로 변환
    const hitboxHeight = parseFloat(hitbox.style.height);

    isMoving = false;

    if (!isAtkMode) {
        if (keysPressed.ArrowUp) {
            position.y = Math.max(position.y - speed, gameRect.y);
            isMoving = true;
        }
        if (keysPressed.ArrowDown) {
            position.y = Math.min(position.y + speed, gameRect.y + gameRect.height - hitboxHeight);
            isMoving = true;
        }
        if (keysPressed.ArrowLeft) {
            position.x = Math.max(position.x - speed, gameRect.x);
            isMoving = true;
            if (isFacingRight) {
                characterImg.style.transform = "scaleX(1)";
                isFacingRight = false;
            }
        }
        if (keysPressed.ArrowRight) {
            position.x = Math.min(position.x + speed, gameRect.x + gameRect.width);
            isMoving = true;
            if (!isFacingRight) {
                characterImg.style.transform = "scaleX(-1)";
                isFacingRight = true;
            }
        }
    }

    characterImg.style.left = `${position.x - center_offset_x}px`;
    characterImg.style.top = `${position.y - center_offset_y}px`;

    if (hitbox) {
        if (isFacingRight) {
            hitbox.style.left = `${position.x - (center_offset_x - (characterImgWidth - (hitboxWidth + center_offset_x)))}px`;
        } else {
            hitbox.style.left = `${position.x}px`;
        }
        hitbox.style.top = `${position.y}px`;
    }

    const newState = isMoving ? "walk" : "stand";
    if (!isAtkMode && currentState !== newState) {
        currentState = newState;  
        characterImg.src = updateCharacter(currentState);
    }
}

// -------------------------- < 몬스터 > ------------------------------------
async function spawnMonster(monsterData) {
    try {
        console.log(monsterData);

        // 예시: 'snail' 몬스터 정보 가져오기
        const monster = monsterData.snail;

        // 몬스터 수 설정 (예시로 5마리)
        const numberOfMonsters = 5;

        // 몬스터 수만큼 생성
        for (let i = 0; i < numberOfMonsters; i++) {
            const monsterWidth = 20;
            const monsterHeight = 20;

            // 랜덤 위치 계산 (gameRect의 가장자리)
            const side = Math.floor(Math.random() * 4); // 0: 위, 1: 아래, 2: 왼쪽, 3: 오른쪽
            let x, y;

            switch (side) {
                case 0: // 위쪽
                    x = Math.random() * (gameRect.width - monsterWidth) + gameRect.x;
                    y = gameRect.y - monsterHeight;
                    break;
                case 1: // 아래쪽
                    x = Math.random() * (gameRect.width - monsterWidth) + gameRect.x;
                    y = gameRect.y + gameRect.height;
                    break;
                case 2: // 왼쪽
                    x = gameRect.x - monsterWidth;
                    y = Math.random() * (gameRect.height - monsterHeight) + gameRect.y;
                    break;
                case 3: // 오른쪽
                    x = gameRect.x + gameRect.width;
                    y = Math.random() * (gameRect.height - monsterHeight) + gameRect.y;
                    break;
            }

            // 몬스터 DOM 요소 생성
            const monsterElement = document.createElement("img");
            monsterElement.src = monster.image;
            monsterElement.style.width = `${monsterWidth}px`;
            monsterElement.style.height = `${monsterHeight}px`;
            monsterElement.style.position = "absolute";
            monsterElement.style.left = `${x}px`;
            monsterElement.style.top = `${y}px`;

            // 몬스터 정보를 객체로 저장
            const monsterObj = {
                element: monsterElement,
                x: x,
                y: y,
                speed: monster.speed,
                width: monsterWidth,
                height: monsterHeight
            };

            // 몬스터 배열에 추가
            monsters.push(monsterObj);

            // 몬스터를 게임 영역에 추가
            game.appendChild(monsterElement);

            console.log(`Monster spawned at x: ${x}, y: ${y}`);
        }
    } catch (error) {
        console.error("Error spawning monster:", error);
    }
}

// 몬스터 움직임
function moveMonster(monster) {
    const dx = position.x - monster.x; // 캐릭터와 몬스터 간의 x축 거리 계산
    const dy = position.y - monster.y; // 캐릭터와 몬스터 간의 y축 거리 계산
    const distance = Math.sqrt(dx ** 2 + dy ** 2); // 캐릭터와 몬스터 사이의 유클리드 거리

    if (distance > 0) {
        const moveX = (dx / distance) * monster.speed; // 몬스터의 x축 이동 거리
        const moveY = (dy / distance) * monster.speed; // 몬스터의 y축 이동 거리

        monster.x += moveX; // 몬스터의 x 좌표 업데이트
        monster.y += moveY; // 몬스터의 y 좌표 업데이트

        monster.element.style.left = `${monster.x}px`; // 몬스터의 DOM 요소 위치 업데이트 (x축)
        monster.element.style.top = `${monster.y}px`; // 몬스터의 DOM 요소 위치 업데이트 (y축)
    }
}



document.addEventListener("DOMContentLoaded", () => {
    fetchCharacterStatus("도적");
    startGame();
});