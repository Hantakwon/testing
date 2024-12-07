function detailCharacterInfo(characterData) {
	const detailImg = document.querySelector("#detailImg");
	const detailName = document.querySelector("#detailName");
	const detailDescription = document.querySelector("#detailDescription");
	const startBtn = document.querySelector("#startBtn");
	
	console.log("세부 정보 변경" + characterData);
	
	detailImg.src = characterData.image;
	detailName.textContent = characterData.name;
	detailDescription.textContent = characterData.description;
	
	startBtn.addEventListener("click", () =>{
		location.href = `game.html?characterName=${characterData.name}`;
	});
}

async function fetchCharacterInfo() {
    try {
        const response = await fetch('http://127.0.0.1:8000/character/info');
        const data = await response.json();

        console.log('Received data:', data); // 데이터 로깅 추가

        if (data.error) {
            alert(data.error);
            return;
        }

        // 캐릭터 이름을 객체로 정의
        const characters = {
            warrior: data['전사'],
            archer: data['궁수'],
            magician: data['법사'],
            thief: data['도적']
        };

		detailCharacterInfo(characters.warrior);
	
		// Object.entries로 객체 순회
		// characters 객체를 [key, value] 쌍으로 변환하여 forEach로 순회합니다.
		// key는 'warrior', 'archer' 등 캐릭터의 id와 연결된 이름이고,
		// value는 각 캐릭터에 대한 데이터를 담고 있습니다.
		Object.entries(characters).forEach(([key, character]) => {
		    // id 속성 기반으로 해당 캐릭터의 이미지 요소를 찾습니다.
		    // 예: #warriorImage, #archerImage 등
		    const characterImg = document.querySelector(`#${key}Image`);
		    const characterName = document.querySelector(`#${key}Name`);
		    const characterDescription = document.querySelector(`#${key}Description`);

		    if (characterImg) {
                characterImg.src = character.image || ''; 
                characterImg.classList.add("character-img"); // Add the hover and active effects class
                characterImg.addEventListener('click', () => detailCharacterInfo(character)); // Add click event to change the detail view
            }
		    if (characterName) characterName.textContent = character.name || ''; 
		    if (characterDescription) characterDescription.textContent = character.description || ''; 
		});
		
    } catch (error) {
        console.error('Error fetching character info:', error);
    }
}

fetchCharacterInfo();