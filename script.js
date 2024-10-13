// 定義正面圖片路徑
const frontImage = "/images/food/picture0.png";

// 定義食物主題的背面圖片
const foodImages = Array.from({ length: 18 }, (_, i) => `/images/food/picture${i + 1}.png`);

// 定義動物主題的背面圖片
const animalImages = Array.from({ length: 18 }, (_, i) => `/images/animals/animal${i + 1}.png`);

let selectedImages = []; // 用來存儲當前選中的主題圖片集
let flippedCards = []; // 存儲翻轉中的卡片
let matchedPairs = 0; // 配對成功的數量
let timer; // 用於存儲計時器
let previewTimer; // 用於正面顯示倒計時
let time = 0; // 用來計算遊戲用時
let hideCompleted = false; // 用於存儲是否隱藏完成圖片的選擇
let totalCards = 0; // 用來存儲當前模式的卡片總數

// 隨機選擇圖片
function selectRandomImages(images, count) {
    const shuffled = shuffleArray([...images]);
    return shuffled.slice(0, count);
}

// 生成背面圖片數組，確保每張圖片最多出現2次
function generateBackImages(imageCount) {
    const randomImages = selectRandomImages(selectedImages, imageCount);
    return shuffleArray(randomImages.flatMap(image => [image, image])); // 每張圖片添加兩次並隨機打亂
}

// 打亂數組的函數
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 生成卡片的函數
function generateCards(cardCount) {
    const cardWrapper = document.getElementById('card-wrapper');
    cardWrapper.innerHTML = ''; // 清空現有卡片

    // 根據選擇的模式設置類
    if (cardCount === 4) {
        cardWrapper.className = 'grid-2x2';
    } else if (cardCount === 16) {
        cardWrapper.className = 'grid-4x4';
    } else if (cardCount === 36) {
        cardWrapper.className = 'grid-6x6';
    }

    // 隨機生成背面圖片池
    const backImagePool = generateBackImages(cardCount / 2); // 根據卡片數量決定圖片對數

    for (let i = 0; i < cardCount; i++) {
        const card = createCard(backImagePool[i], i + 1);
        cardWrapper.appendChild(card);
    }

    // 一開始顯示正面 根據選擇的倒數時間
    const countdownTime = parseInt(document.getElementById('countdown-select').value); // 取得倒數時間
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => card.classList.add('flipped')); // 顯示正面

    // 設置選擇的秒數後自動翻轉為背面
    previewTimer = setTimeout(() => {
        cards.forEach(card => card.classList.remove('flipped')); // 翻回背面
        startTimer(); // 開始遊戲計時
    }, countdownTime * 1000); // 使用倒數時間進行翻轉

}

// 創建卡片的函數
function createCard(backImage, index) {
    const cardContainer = document.createElement('div');
    cardContainer.classList.add('card-container');

    const card = document.createElement('div');
    card.classList.add('card');
    card.id = `card${index}`;
    card.dataset.image = backImage;

    // 添加正面和背面
    card.appendChild(createCardFace('front', frontImage));
    card.appendChild(createCardFace('back', backImage));

    // 添加點擊翻轉事件
    card.addEventListener('click', () => flipCard(card));
    cardContainer.appendChild(card);
    return cardContainer;
}

// 創建卡片面朝向的函數
function createCardFace(face, imageSrc) {
    const cardFace = document.createElement('div');
    cardFace.classList.add('card-face', `card-${face}`);
    const imgElement = document.createElement('img');
    imgElement.src = imageSrc;
    cardFace.appendChild(imgElement);
    return cardFace;
}

// 點擊卡片時翻轉的邏輯
function flipCard(card) {
    if (flippedCards.length < 2 && !card.classList.contains('flipped')) {
        card.classList.add('flipped');
        flippedCards.push(card);
        if (flippedCards.length === 2) {
            setTimeout(checkMatch, 1000); // 一秒後檢查配對
        }
    }
}

// 檢查配對
function checkMatch() {
    const [firstCard, secondCard] = flippedCards;
    const firstImage = firstCard.querySelector('.card-back img').src;
    const secondImage = secondCard.querySelector('.card-back img').src;

    console.log(`Comparing: ${firstImage} and ${secondImage}`);

    if (firstImage === secondImage) {
        matchedPairs++;
        console.log(`Matched pairs: ${matchedPairs} Total pairs: ${totalCards / 2}`);

        // 檢查是否所有配對都完成
        if (matchedPairs === totalCards / 2) {
            console.log('所有配對完成，結束遊戲。');
            clearInterval(timer);
            endGame(); // 直接結束遊戲
        } else if (hideCompleted) {
            // 隱藏已配對的圖片
            firstCard.classList.add('matched');
            secondCard.classList.add('matched');
        }
    } else {
        // 如果配對不成功，將卡片翻回背面
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
    }
    flippedCards = []; // 重置翻轉卡片
}

// 結束遊戲並顯示 SweetAlert2 彈窗
function endGame() {
    console.log('結束遊戲函數被調用');
    
    // 獲取遊戲所用時間
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const formattedTime = `${minutes} 分 ${seconds} 秒`;

    console.log('結束遊戲並顯示提示。');

    Swal.fire({
        title: '恭喜你！',
        text: `你完成了遊戲，總共用時: ${formattedTime}`,
        icon: 'success',
        confirmButtonText: '重新開始'
    }).then(() => {
        restartGame(); // 重新開始遊戲
    });
}



// 重新開始遊戲
function restartGame() {
    matchedPairs = 0;
    flippedCards = [];
    document.getElementById('game-status').textContent = '';
    document.getElementById('startGame').disabled = false; // 允許再次開始遊戲
    document.getElementById('timer').textContent = ''; // 清空計時器顯示
    clearInterval(timer); // 停止舊的計時器
    clearTimeout(previewTimer); // 停止正面展示計時
}

// 計時器功能
function startTimer() {
    time = 0; // 重置時間
    timer = setInterval(() => {
        time++;
        
        // 計算分鐘和秒數
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;

        // 格式化為 mm:ss
        const formattedTime = `${minutes} 分 ${seconds} 秒`;
        document.getElementById('timer').textContent = `已經過 ${formattedTime}`; // 更新顯示
    }, 1000);
}


// 顯示正面並根據選擇的倒數時間翻回背面
document.getElementById('showFront').addEventListener('click', () => {
    const countdownTime = parseInt(document.getElementById('countdown-select').value); // 取得倒數時間
    const cards = document.querySelectorAll('.card');

    // 顯示正面
    cards.forEach(card => {
        card.classList.add('flipped');
    });

    // 倒數選擇的秒數後翻回背面
    setTimeout(() => {
        cards.forEach(card => {
            card.classList.remove('flipped');
        });
    }, countdownTime * 1000); // 使用倒數時間進行翻轉
});


// 開始遊戲
document.getElementById('startGame').addEventListener('click', () => {
    const mode = document.getElementById('mode-select').value;
    const theme = document.getElementById('theme-select').value;
    hideCompleted = document.getElementById('hide-completed-select').value === 'hide'; // 更新隱藏選擇

    if (mode && theme) {
        document.getElementById('startGame').disabled = true; // 禁用開始按鈕
        document.getElementById('showFront').disabled = false; // 啟用顯示正面按鈕
        document.getElementById('showBack').disabled = false; // 啟用顯示背面按鈕


        // 根據模式選擇卡片數量
        if (mode === '2x2') totalCards = 4;
        else if (mode === '4x4') totalCards = 16;
        else if (mode === '6x6') totalCards = 36;

        // 選擇主題圖片
        selectedImages = theme === 'food' ? foodImages : animalImages;

        generateCards(totalCards); // 生成卡片
    }
});


// 顯示正面
document.getElementById('showFront').addEventListener('click', () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.add('flipped');
    });
});

// 顯示背面
document.getElementById('showBack').addEventListener('click', () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.remove('flipped');
    });
});

// 監聽重新開始按鈕
document.getElementById('restartGame').addEventListener('click', resetGame);

// 重置遊戲
function resetGame() {
    clearInterval(timer); // 停止計時
    clearTimeout(previewTimer); // 停止正面展示計時
    matchedPairs = 0;
    flippedCards = [];
    document.getElementById('game-status').textContent = '';
    time = 0; // 重置時間
    document.getElementById('timer').textContent = '已經過 0 秒'; // 重置顯示時間
    document.getElementById('startGame').disabled = false; // 允許再次開始遊戲
}

// 監聽主題和模式選擇的改變
document.getElementById('theme-select').addEventListener('change', resetGame);
document.getElementById('mode-select').addEventListener('change', resetGame);
document.getElementById('hide-completed-select').addEventListener('change', resetGame);