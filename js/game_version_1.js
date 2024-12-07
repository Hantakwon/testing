// Game 요소 가져오기
const game = document.querySelector("#game");
const characterImg = document.querySelector("#character");
const hitbox = document.querySelector("#hitbox");

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
let hp; // HP
let atk; // 데미지
let speed; // 이동 속도

// API 호출 및 데이터 가져오기
async function fetchCharacterStatus(characterName) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/character/status/${characterName}`);
        const data = await response.json();

        if (data.error) {
            alert(data.error);
            return;
        }

        speed = parseInt(data.speed);
        setCharacterImage(data);
        setHitbox(data);

    } catch (error) {
        console.error('Error fetching character status:', error);
    }
}

// 캐릭터 이미지 설정
function setCharacterImage(data) {
    characterImg.style.width = `${data.imagesize[0]}px`;
    characterImg.style.height = `${data.imagesize[1]}px`;

    stand_img = data.stand_img;
    walk_img = data.walk_img;
    atk_img = data.atk_img;
    heal_img = data.heal_img || "";

    characterImg.src = stand_img;

    characterImg.style.border = "2px dashed red";
    characterImg.style.position = "absolute";
}

function updateState(state) {
	if(state === 'stand') {
		return stand_img;
	}	
	else if (state === 'walk') {
		return walk_img;
	}
}

// 히트 박스 설정
function setHitbox(data) {
    const { width, height } = data.hitbox;
    
    hitbox.style.width = `${width}px`;
    hitbox.style.height = `${height}px`;

    hitbox.style.border = "2px dashed red";
    hitbox.style.position = "absolute";

    center_offset_x = data.hitbox.center_offset.x;
    center_offset_y = data.hitbox.center_offset.y;
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
            hitbox.style.left = `${position.x - hitboxWidth}px`;
        } else {
            hitbox.style.left = `${position.x}px`;
        }
        hitbox.style.top = `${position.y}px`;
    }

    const newState = isMoving ? "walk" : "stand";
    if (!isAtkMode && currentState !== newState) {
        currentState = newState;  
        characterImg.src = updateState(currentState);
    }

    requestAnimationFrame(moveCharacter);
}

document.addEventListener("DOMContentLoaded", () => {
    fetchCharacterStatus("궁수");
    moveCharacter();
});