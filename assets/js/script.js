var width = 40;
var height = 24;
var grid = [];
var hero;
var enemies = [];
var items = [];
var enemyCount = 10;

function newGameDiv(text, status) { // Блок Новая игра
    var field_box = document.getElementById('field-box');
    document.removeEventListener('keydown', handleInput);
    field_box.style.borderTop = '2px solid #d0d0d0';
    document.querySelector('.health').remove();
    var new_block = document.createElement('div');
    new_block.className = 'new-game__block';
    field_box.appendChild(new_block);
    var newGame__block = document.querySelector('.new-game__block');
    var new_text = document.createElement('h1');
    new_text.className = 'new-game__text';
    if (status == 0)
        new_text.className = 'lose_text';
    if (status == 1) {
        new_text.className = 'win_text';
    }
    new_text.innerText = text;
    newGame__block.appendChild(new_text);
    var newGame = document.createElement('button');
    newGame.className = 'new-game__btn';
    newGame.setAttribute('id', 'new-game');
    newGame.innerText = 'Заново';
    var newGame__block = document.querySelector('.new-game__block');
    newGame__block.appendChild(newGame);
    alertMessage('');
    document.getElementById('new-game').addEventListener('click', () => location.reload()); // Нажатие кнопки "Заново"
    document.addEventListener('keyup', event => {
        if (event.code === 'Enter') location.reload(); // Нажатие Enter для новой игры
    });

}

function initializeGrid() { // Инициализация сетки (создание поля и стен)
    for (var i = 0; i < height; i++) {
        grid[i] = [];
        for (var j = 0; j < width; j++) {
            grid[i][j] = 'wall'; // Генерация стен
        }
    }
}

function getRandomInt(min, max) { // Генерация рандомного числа (без округления)
    return Math.floor(Math.random() * (max - min)) + min;
}

function randHP(min, max, num) { // Генерация рандомного числа для здоровья противника и силы атаки (с округлением)
    return Math.floor(Math.floor(Math.random() * (max - min + 1) + min) / num) * num;
}

var roomCenters = []; // массив для хранения центров комнат

function createRoom() { // Создание стен
    var roomWidth = getRandomInt(3, 8); // Рандомная ширина комнаты
    var roomHeight = getRandomInt(3, 8); // Рандомная высота комнаты
    var x = getRandomInt(1, width - roomWidth - 1); // Рандомная x координата комнаты
    var y = getRandomInt(1, height - roomHeight - 1); // Рандомная y координата комнаты

    // Создание комнаты
    for (var i = 0; i < roomHeight; i++) {
        for (var j = 0; j < roomWidth; j++) {
            grid[y + i][x + j] = '.'; // комната
        }
    }

    // Находим центр комнаты
    var centerX = x + Math.floor(roomWidth / 2);
    var centerY = y + Math.floor(roomHeight / 2);
    roomCenters.push({
        x: centerX,
        y: centerY
    }); // Добавление центра комнаты в массив
}

function createPassages() {
    var horizontalPassages = getRandomInt(3, 5); // Количество горизонтальных проходов (рандом от 3 до 5)
    var verticalPassages = getRandomInt(3, 5); // Количество вертикальных проходов (рандом от 3 до 5)
    var connectedRooms = new Set(); // Коллекция значений соединенных комнат
    connectedRooms.add(roomCenters[0]); // Начало с первой комнаты

    while (connectedRooms.size < roomCenters.length) {
        var start = Array.from(connectedRooms)[Math.floor(Math.random() * connectedRooms.size)]; // Стартовая точка для прохода
        var end = roomCenters[Math.floor(Math.random() * roomCenters.length)]; // конечная точка для прохода
        if (!connectedRooms.has(end)) { // Соединение стартовой и конечной комнаты горизонтально и вертикально
            for (var i = 0; i < horizontalPassages; i++) {
                if (start.x !== end.x) { // проверка, находятся ли стартовая и конечная комната на одной вертикали (по оси X)
                    // Горизонтальный проход
                    var passageY = start.y; // На той же высоте, что и стартовая комната
                    if (start.x < end.x) { // проверка, находится ли стартовая комната левее конечной (по оси X
                        for (var x = start.x; x <= end.x; x++) {
                            if (grid[passageY][x] !== '.') { // Проверка на наличие прохода
                                grid[passageY][x] = '.'; // горизонтальный проход
                            }
                        }
                    } else { // Если стартовая комната находится правее конечной
                        for (var x = end.x; x <= start.x; x++) {
                            if (grid[passageY][x] !== '.') { // Проверка на наличие прохода
                                grid[passageY][x] = '.'; // горизонтальный проход
                            }
                        }
                    }
                }
            }
            for (var i = 0; i < verticalPassages; i++) {
                if (start.y !== end.y) {
                    // Вертикальный проход
                    var passageX = end.x; // На той же оси, что и конечная комната
                    if (start.y < end.y) {
                        for (var y = start.y; y <= end.y; y++) {
                            if (grid[y][passageX] !== '.') { // Проверка на наличие прохода
                                grid[y][passageX] = '.'; // вертикальный проход
                            }
                        }
                    } else {
                        for (var y = end.y; y <= start.y; y++) {
                            if (grid[y][passageX] !== '.') { // Проверка на наличие прохода
                                grid[y][passageX] = '.'; // вертикальный проход
                            }
                        }
                    }
                }
                connectedRooms.add(end); // Добавление конечной комнаты в соединенные
            }
        }
    }
}


function placeItemsAndEnemies() { // Помещение предметов и врагов на игровое поле
    var placed = 0; // Количество уже помещенных предметов и врагов
    var totalItems = 12; // 2 меча и 10 зельев здоровья
    while (placed < totalItems) {
        var x = getRandomInt(1, width - 2); // Рандомная координата x
        var y = getRandomInt(1, height - 2); // Рандомная координата y
        if (grid[y][x] === '.') {
            if (placed < 2) {
                grid[y][x] = 'Sword'; // меч
                placed++;
            } else {
                grid[y][x] = 'Health'; // зелье здоровья
                placed++;
            }
        }
    }

    for (var i = 0; i < enemyCount; i++) {
        var x, y;
        do {
            x = getRandomInt(1, width - 2); // Рандомная координата x
            y = getRandomInt(1, height - 2); // Рандомная координата y
        } while (grid[y][x] !== '.');
        grid[y][x] = 'Enemy'; // враг
        enemies.push({ // Свойства врагов
            x: x,
            y: y,
            health: randHP(10, 30, 5),
        });
    }
}

function placeHero() { // Размещение героя на игровом поле
    var x, y;
    do {
        x = getRandomInt(1, width - 2); // Рандомная координата x
        y = getRandomInt(1, height - 2); // Рандомная координата y
    } while (grid[y][x] !== '.');
    grid[y][x] = 'Hero'; // герой
    hero = { // Свойства героя
        x: x,
        y: y,
        health: 100,
        attackPower: 10,
        potion: 0,
    };
};


function drawGrid() { // Отрисовка игрового поля
    var field = document.getElementById('field'); // Поле
    var hp = document.querySelector('.hp'); // Свойство "Здоровье"
    hp.innerText = hero.health + ' ед.';
    var attack = document.querySelector('.attack'); // Свойство "Атака"
    attack.innerText = hero.attackPower + ' ед.';
    var potion = document.querySelector('.potion'); // Зелье в инвентаре
    potion.innerText = 'Зелье: ' + hero.potion + ' шт.';
    field.innerHTML = ''; // Очистка поля
    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            var tile = document.createElement('div');
            tile.className = 'tile';
            if (grid[i][j] === 'wall') {
                tile.className = 'wall'; // Стена
            } else if (grid[i][j] === '.') {
                tile.className = 'tile'; // пустое пространство
            } else if (grid[i][j] === 'Hero') {
                tile.className = 'hero'; // герой
                var healthHero = document.createElement('div');
                healthHero.className = 'health-hero'; // Шкала здоровья над героем
                healthHero.style.width = hero.health + '%';
                tile.appendChild(healthHero);
                var healthScale = document.querySelector('.health'); // Шкала здоровья над игровым полем
                if (healthScale) {
                    healthScale.style.width = hero.health + '%';
                }
            } else if (grid[i][j] === 'Enemy') {
                tile.className = 'enemy'; // враг
            } else if (grid[i][j] === 'Sword') {
                tile.className = 'sword'; // меч
            } else if (grid[i][j] === 'Health') {
                tile.className = 'potion'; // зелье здоровья
            }
            field.appendChild(tile);
        }
    }
    if (enemies.length == 0) {
        newGameDiv('Вы победили!', 1); // VICTORY
    }
}



function moveHero(dx, dy) { // Передвижение героя
    var newX = hero.x + dx; // Новые координаты героя по X
    var newY = hero.y + dy; // Новые координаты героя по Y
    if (grid[newY] && grid[newY][newX] !== 'wall' && grid[newY][newX] !== 'Enemy') { // Проверка стен
        grid[hero.y][hero.x] = '.'; // Замена старых координат на tile
        hero.x = newX;
        hero.y = newY;
        checkForItems(); // Проверка на предметы
        grid[hero.y][hero.x] = 'Hero'; // Отображение героя на новых гоординатах

        moveEnemies(); // Перемещение врагов
        drawGrid(); // Отрисовка игрового поля
    }
}


function moveEnemies() { // Передвижение врагов
    // Случайное движение по одной оси
    for (var i = 0; i < enemies.length; i++) {
        var enemy = enemies[i];

        function getRandomInt(min, max) { // Генерация рандомного числа (без округления)
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        var direction = getRandomInt(0, 1); // Направление 
        var step = getRandomInt(-1, 1); // Шаг от -1 до 1
        var newX = enemy.x + (direction === 0 ? step : 0); // Новая координата X
        var newY = enemy.y + (direction === 1 ? step : 0); // Новая координата Y

        // Проверка возможности движения (отсутствие стен, героя, другого врага, зелья или меча)
        if (grid[newY] && grid[newY][newX] !== 'wall' && grid[newY][newX] !== 'Hero' && grid[newY][newX] !== 'Enemy' &&
            grid[newY][newX] !== 'Health' && grid[newY][newX] !== 'Sword') {
            grid[enemy.y][enemy.x] = '.'; // Замена старых координат на tile
            enemy.x = newX;
            enemy.y = newY;
            grid[enemy.y][enemy.x] = 'Enemy'; // Отображение врага на новых гоординатах
        }
        // Ограничение движения в пределах карты
        enemy.x = Math.max(0, Math.min(width - 1, enemy.x));
        enemy.y = Math.max(0, Math.min(height - 1, enemy.y));
    }
    enemyAttack(); // // Атака врагом на соседней клетке
    drawGrid(); // Отрисовка игрового поля
}

function attackEnemies() { // Атака врагов героем
    for (var i = 0; i < enemies.length; i++) {
        var enemy = enemies[i]; // Один враг из списка
        if ((enemy.x === hero.x && Math.abs(enemy.y - hero.y) === 1) || // Проверка, равна ли координата y героя координате y врага
            (enemy.y === hero.y && Math.abs(enemy.x - hero.x) === 1)) { // Проверка, равна ли координата х героя координате х врага
            if (enemy.health > 0) {
                enemy.health -= hero.attackPower; // уменьшение здоровья врага
                if (enemy.health < 0) { // Проверка, если здоровье меньше 0 (отрицательное значение), то здоровье равно 0
                    enemy.health = 0; // (защита от отрицательных значений здоровья врага)
                }
                alertMessage("Вы атаковали врага! Осталось здоровья врага: " + enemy.health);
                enemyAttack();
            }
            if (enemy.health <= 0) {
                alertMessage("Враг повержен!", 'green');
                grid[enemy.y][enemy.x] = '.'; // Удаление врага
                enemies.splice(i, 1); // Удаление врага из массива
                i--; // Уменьшение индекса для следующего цикла и проверки нового врага, который занял место удалённого
            }
        }
    }
    drawGrid(); // Отрисовка игрового поля
}

function enemyAttack() { // Атака героя врагом
    for (var enemy of enemies) {
        // Условие - если координата x и y совпадает и модуль x и y координаты равен 1
        if ((enemy.x === hero.x && Math.abs(enemy.y - hero.y) === 1) ||
            (enemy.y === hero.y && Math.abs(enemy.x - hero.x) === 1)) {
            hero.health -= 10; // уменьшение здоровье героя
            if (hero.health <= 0) {
                hero.health = 0;
                newGameDiv('Вы погибли!', 0); // LOSE!
            }
        }
    }
    drawGrid(); // Отрисовка игрового поля
}
// Проверка на наличие предметов
function checkForItems() {
    var currentTile = grid[hero.y][hero.x];

    if (currentTile === 'Health') { // если герой наступил на зелье
        grid[hero.y][hero.x] = '.'; // удаление зелья с поля
        if (hero.health == 100) {
            alertMessage('У вас максимальное здоровье\nЗелье отложено в хранилище');
            ++hero.potion;
        } else if (hero.health > 80) {
            hero.health += 10;
            alertMessage('Вы восстановили здоровье!', 'green');
        } else {
            hero.health += 20; // восстановление здоровье
            alertMessage('Вы восстановили здоровье!', 'green');
        }
    } else if (currentTile === 'Sword') { // если герой наступил на меч
        hero.attackPower += randHP(10, 20, 5); // увеличение силы удара
        grid[hero.y][hero.x] = '.'; // удаление меча
        alertMessage("Вы получили меч! Сила удара увеличена!", 'green');
    }
    drawGrid();
}

function usePotion() {
    if (hero.health == 100) {
        alertMessage('У вас максимальное здоровье\nЗелье не использовано');
    } else if (hero.health > 80) {
        hero.health += 10;
        --hero.potion;
        alertMessage('Вы восстановили здоровье!', 'green');
    } else {
        hero.health += 20; // восстановление здоровья
        --hero.potion; // удаление зелья
        alertMessage('Вы восстановили здоровье!', 'green');
    }
    drawGrid();
}

function alertMessage(msg, status) { // Сообщение над игровым полем
    var alert = document.querySelector('.alert-msg');
    alert.style.color = '#fff';
    alert.innerText = '';
    if (status == 'red') {
        alert.style.color = 'red';
    } else if (status == 'green') {
        alert.style.color = 'green';
    }
    alert.innerText = msg;
    const clearText = setTimeout(() => {
        alert.innerText = '';
    }, 4000);
    clearTimeout(clearText);
}



function handleInput(e) { // Управление героем
    switch (e.key) {
        case 'w':
        case 'ц':
            moveHero(0, -1);
            break; // вверх
        case 'a':
        case 'ф':
            moveHero(-1, 0);
            break; // влево
        case 's':
        case 'ы':
            moveHero(0, 1);
            break; // вниз
        case 'd':
        case 'в':
            moveHero(1, 0);
            break; // вправо
        case ' ':
            attackEnemies();
            break; // атака
        case 'h':
        case 'р':
            if (hero.potion == 0)
                alertMessage('Зелье отсутсвует!', 'red');
            else {
                usePotion();
            }
            break; // зелье
    }
}

// Запуск игры - старт всех важных функций: инициализация поля, расположение комнат, проходов, предметов, врагов, героя и 
// дальнейшая отрисовка всех клеток игрового поля
function initGame() {
    initializeGrid();
    for (var i = 0; i < getRandomInt(5, 10); i++) { // Генерация комнат от 5 до 10
        createRoom();
    }
    for (var i = 0; i < getRandomInt(3, 5); i++) { // Генерация проходов от 6 до 10 (суммарно горизонтальных и вертикальных)
        createPassages();
    }

    placeItemsAndEnemies();
    placeHero();
    drawGrid();
    document.addEventListener('keydown', handleInput); // Слушатель нажатия на кнопку для управления героем
}

initGame(); // СТАРТ!!!