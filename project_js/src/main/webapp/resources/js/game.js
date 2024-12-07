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

const position = { x: gameRect.width / 2, y: gameRect.height / 2 }; // 초기 위치

// 이미지 결정 boolean 값
let isAtkMode = false;
let isMoving = false;
let isFacingRight = false; // 캐릭터가 오른쪽을 보고 있는 상태
let currentState = "stand";

// 키보드 입력
const keysPressed = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

// 캐릭터 정보
let prevHp, prevAtk, prevSpeed, prevLevel, prevScore, prevExperience; // 상태 값 변화 감지 저장
let hp, atk, speed; // 체력, 공격력, 속도
let level = 1; // 레벨
let experience = 0; // 경험치
let score = 0; // 점수
let canTakeDamage = true;
let atkBox;

// 몬스터 정보
let monsters = []; // 몬스터들을 저장할 배열

// 게임 정보
let isLevelUp = false; // 레벨업 상태

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
        try {
            // 5초마다 spawnMonster 실행
            monsterSpawnInterval = setInterval(() => {
                spawnMonster(monsterData);
            }, 5000); // 5000ms = 5초
        } catch (error) {
            console.error("Error starting monster spawning:", error);
        }

    } catch (error) {
        console.error('Error fetching character status:', error);
    }
}

// ------------- < Game 데이터 설정 > ---------------------

// 게임 기본 데이터 설정
function setGameData(characterData) {
    hp = parseInt(characterData.hp);
    atk = parseInt(characterData.atk);
    speed = parseInt(characterData.speed);

    updateGameData();
}

function updateGameData() {
    if (hp !== prevHp || atk !== prevAtk || speed !== prevSpeed) {
        hpDiv.innerHTML = `HP : ${hp} <br> atk : ${atk} speed : ${speed}`;
        prevHp = hp;
        prevAtk = atk;
        prevSpeed = speed;
    }
    if (level !== prevLevel || experience !== prevExperience) {
        levelDiv.innerHTML = `LEVEL : ${level} <br> EXP : ${experience}`;
        prevLevel = level;
        prevExperience = experience;
    }
    if (score !== prevScore) {
        scoreDiv.innerText = `SCORE : ${score}`;
        prevScore = score;
    }
}

// 게임 루프
function startGame() {
    if (isLevelUp) return;
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

// 게임 오버 처리
function gameOver() {
    alert("Game Over!");
    window.location.href = "gameOver.html"; // 게임 오버 시 'gameOver.html' 페이지로 이동
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
    if (state === 'stand') {
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
            cancelAnimationFrame(startGame); // 게임 루프 중지
            gameOver();
        }
    }
}

// 어택 박스 설정
function setAtkbox() {
    atkBox = document.createElement("div");
    const hitboxRect = hitbox.getBoundingClientRect(); // 캐릭터 히트박스의 위치와 크기
    const characterRect = characterImg.getBoundingClientRect();
    const characterImgWidth = parseFloat(characterImg.style.width); // 캐릭터 이미지 너비
    const hitboxWidth = parseFloat(hitbox.style.width); // 히트박스 너비
	
    // 공격 범위 (어택 박스) 설정
    let atkboxWidth = 0;
    let atkboxLeft = 0;

    if (isFacingRight) {
        // 오른쪽을 볼 때
        atkboxWidth = characterImgWidth - (hitboxRect.x - characterRect.x) - hitboxWidth;
        atkboxLeft = hitboxRect.x;
    } else {
        // 왼쪽을 볼 때
        atkboxWidth = hitboxRect.x - characterRect.x;
        atkboxLeft = characterRect.x;
    }
	
    atkBox.style.width = `${atkboxWidth}px`;
    atkBox.style.height = `${hitboxRect.height}px`;
    atkBox.style.position = "absolute";
    atkBox.style.top = `${hitboxRect.y}px`;
    atkBox.style.left = `${atkboxLeft}px`;
    atkBox.style.backgroundColor = "rgba(255, 0, 0, 0.5)"; // 반투명 빨간색으로 표시
    atkBox.style.border = "2px dashed red";

	
	console.log(atkBox);
    // 게임 영역에 추가
    game.appendChild(atkBox);
    checkAtkCollision(atkBox);
    // 일정 시간 후 제거 (예: 공격 애니메이션 지속 시간)
    setTimeout(() => {
        game.removeChild(atkBox);
    }, 700);
}


// 공격 시 몬스터와의 충돌 감지
function checkAtkCollision(atkBox) {
    const atkBoxRect = atkBox.getBoundingClientRect(); // atkBox의 위치와 크기 가져오기
    console.log(atkBoxRect);

    monsters.forEach(monster => {
        const monsterRect = monster.element.getBoundingClientRect();
        // 어택 박스와 몬스터가 겹치는지 확인
        const isColliding =
            atkBoxRect.left < monsterRect.right &&
            atkBoxRect.right > monsterRect.left &&
            atkBoxRect.top < monsterRect.bottom &&
            atkBoxRect.bottom > monsterRect.top;

        if (isColliding) {
            console.log(monster.hp);
            // 몬스터 HP 감소
            monster.hp -= atk;

            console.log("atk!");
            // 몬스터 HP가 0 이하일 경우 몬스터 제거
            if (monster.hp <= 0) {
                deadMonster(monster);
                checkLevelUp();
            }
        }
    });
}

function checkLevelUp() {
    if (experience >= 5)  {
        level += 1;
        experience = 0;
        isLevelUp = true; // 레벨업 상태로 설정
        showChoiceScreen(); // 선택지 화면 표시
    }    
}

function showChoiceScreen() {
    const choiceScreen = document.createElement("div");
    choiceScreen.id = "choiceScreen";
    choiceScreen.style.position = "absolute";
    choiceScreen.style.top = "50%";
    choiceScreen.style.left = "50%";
    choiceScreen.style.transform = "translate(-50%, -50%)";
    choiceScreen.style.background = "linear-gradient(to bottom, #3a3a3a, #1f1f1f)";
    choiceScreen.style.padding = "30px";
    choiceScreen.style.borderRadius = "15px";
    choiceScreen.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.5)";
    choiceScreen.style.color = "white";
    choiceScreen.style.textAlign = "center";
    choiceScreen.style.fontFamily = "'Arial', sans-serif";
    choiceScreen.style.width = "300px";

    const title = document.createElement("h2");
    title.innerText = "업그레이드 선택";
    title.style.marginBottom = "20px";
    title.style.color = "#FFD700";
    title.style.fontSize = "24px";
    title.style.textShadow = "0 2px 5px rgba(0, 0, 0, 0.5)";
    choiceScreen.appendChild(title);

    const options = [
        "Increase Speed",
        "Increase HP",
        "Increase Attack"
    ];

    options.forEach((option, index) => {
        const optionElement = document.createElement("button");
        optionElement.innerText = option;
        optionElement.style.display = "flex";
        optionElement.style.margin = "auto";
        optionElement.style.padding = "10px";
        optionElement.style.width = "30%";
        optionElement.style.border = "none";
        optionElement.style.borderRadius = "10px";
        optionElement.style.fontSize = "16px";
        optionElement.style.fontWeight = "bold";
        optionElement.style.cursor = "pointer";
        optionElement.style.transition = "background 0.3s, transform 0.2s";
        optionElement.style.background = "linear-gradient(to right, #4caf50, #2e7d32)";
        optionElement.style.color = "white";
        optionElement.style.boxShadow = "0 3px 5px rgba(0, 0, 0, 0.3)";

        // Hover 효과
        optionElement.onmouseover = () => {
            optionElement.style.background = "linear-gradient(to right, #66bb6a, #388e3c)";
            optionElement.style.transform = "scale(1.05)";
        };
        optionElement.onmouseout = () => {
            optionElement.style.background = "linear-gradient(to right, #4caf50, #2e7d32)";
            optionElement.style.transform = "scale(1)";
        };

        // 클릭 이벤트
        optionElement.onclick = () => handleChoice(index);
        choiceScreen.appendChild(optionElement);
    });

    document.body.appendChild(choiceScreen);

    // 키보드 입력 이벤트 리스너 추가
    window.addEventListener("keydown", handleKeyPress);
}

function handleChoice(choiceIndex) {
    // 선택지에 따른 행동 처리
    switch (choiceIndex) {
        case 0:
            // 속도 증가
            speed += 0.1;
            console.log("Speed increased!");
            break;
        case 1:
            // HP 증가
            hp += 1;
            console.log("HP increased!");
            break;
        case 2:
            // 공격력 증가
            atk += 1;
            console.log("Attack increased!");
            break;
    }

    // 선택 후 처리
    resumeGame();
}

function handleKeyPress(event) {
    if (isLevelUp) {
        if (event.key === "1") {
            handleChoice(0);
        } else if (event.key === "2") {
            handleChoice(1);
        } else if (event.key === "3") {
            handleChoice(2);
        }
    }
}

function resumeGame() {
    isLevelUp = false; // 레벨업 상태 해제
    document.getElementById("choiceScreen").remove(); // 선택지 화면 제거
    
    // 키보드 이벤트 리스너 제거
    window.removeEventListener("keydown", handleKeyPress);

    // 게임 로직 재개
    console.log("Game resumed!");

    // 게임 루프 재개
    requestAnimationFrame(startGame);
}

document.addEventListener("keydown", (event) => {
    if (event.key === 'a' || event.key === 'A') {
        if (!isAtkMode) {
            isAtkMode = true;
            characterImg.src = atk_img;

            // 어택 박스 계산 및 충돌 감지
            setAtkbox();
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
            position.y = Math.max(position.y - speed, 0);
            isMoving = true;
        }
        if (keysPressed.ArrowDown) {
            position.y = Math.min(position.y + speed, gameRect.height- hitboxHeight);
            isMoving = true;
        }
        if (keysPressed.ArrowLeft) {
            position.x = Math.max(position.x - speed, 0);
            isMoving = true;
            if (isFacingRight) {
                characterImg.style.transform = "scaleX(1)";
                isFacingRight = false;
            }
        }
        if (keysPressed.ArrowRight) {
            position.x = Math.min(position.x + speed, gameRect.width);
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

        // 몬스터 종류 리스트
        const monsterNames = Object.keys(monsterData); // 'snail', 'slime', 'goblin' 등

        // 랜덤으로 몬스터 종류 선택
        const randomMonsterName = monsterNames[Math.floor(Math.random() * ((level/2) < monsterNames.length ? (level/2) : monsterNames.length))];
        const monster = monsterData[randomMonsterName];

        // 몬스터 수 설정 (예시로 5마리)
        const numberOfMonsters = Math.floor(Math.random() * 4) + 1;

        // 몬스터 수만큼 생성
        for (let i = 0; i < numberOfMonsters; i++) {
            const monsterWidth = monster.size[0];
            const monsterHeight = monster.size[1];

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
                hp: monster.hp,
                exp: monster.exp,
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

function deadMonster(monster) {
    console.log("Monster defeated!");
    monster.element.remove(); // 몬스터 제거
    monsters = monsters.filter(m => m !== monster); // 배열에서 몬스터 삭제
    score += monster.exp;
    experience += monster.exp;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log(characterName);
    fetchCharacterStatus(characterName);
	startGame();
});