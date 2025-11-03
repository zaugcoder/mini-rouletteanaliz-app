const WebApp = Telegram.WebApp;
WebApp.ready();
WebApp.expand();

let history = [];
const WORKER_URL = 'https://analiz-bot.zaugoldima.workers.dev';  // Твой Worker URL

// Порядок и цвета как на скрине (красные/чёрные, 1-36 в 6 колонках)
const numbers = [
  {num: 1, color: 'red'}, {num: 2, color: 'black'}, {num: 3, color: 'red'}, {num: 4, color: 'black'}, {num: 5, color: 'red'}, {num: 6, color: 'black'},
  {num: 7, color: 'red'}, {num: 8, color: 'black'}, {num: 9, color: 'red'}, {num: 10, color: 'black'}, {num: 11, color: 'black'}, {num: 12, color: 'red'},
  {num: 13, color: 'black'}, {num: 14, color: 'red'}, {num: 15, color: 'black'}, {num: 16, color: 'red'}, {num: 17, color: 'black'}, {num: 18, color: 'red'},
  {num: 19, color: 'red'}, {num: 20, color: 'black'}, {num: 21, color: 'red'}, {num: 22, color: 'black'}, {num: 23, color: 'red'}, {num: 24, color: 'black'},
  {num: 25, color: 'red'}, {num: 26, color: 'black'}, {num: 27, color: 'red'}, {num: 28, color: 'black'}, {num: 29, color: 'black'}, {num: 30, color: 'red'},
  {num: 31, color: 'black'}, {num: 32, color: 'red'}, {num: 33, color: 'black'}, {num: 34, color: 'red'}, {num: 35, color: 'black'}, {num: 36, color: 'red'}
];

const table = document.getElementById('table');
const top3 = document.getElementById('top3');

// Строим 1-36 в 6 колонках (6 рядов)
numbers.forEach(item => {
  const cell = document.createElement('div');
  cell.className = `cell ${item.color}`;
  cell.textContent = item.num;
  cell.onclick = () => analyzeNumber(item.num);
  table.appendChild(cell);
});

// Контейнер для 0 и 00 (рядом, овальные)
const greenContainer = document.createElement('div');
greenContainer.className = 'green-container';
[{num: 0, color: 'green'}, {num: '00', color: 'green'}].forEach(item => {  // '00' как строка
  const cell = document.createElement('div');
  cell.className = `cell ${item.color}`;
  cell.textContent = item.num === 0 ? '0' : '00';
  cell.onclick = () => analyzeNumber(item.num);
  greenContainer.appendChild(cell);
});
table.appendChild(greenContainer);

async function analyzeNumber(num) {
  let x;
  if (num === 0 || num === '00') x = '00';
  else x = num.toString().padStart(2, '0');

  top3.innerHTML = 'Расчет: ...';  // Начало анимации

  // Анимация: Меняем числа рандомно
  const interval = setInterval(() => {
    const randomNums = Array.from({length: 3}, () => Math.floor(Math.random() * 37).toString().padStart(2, '0')).join(' ');
    top3.innerHTML = `Расчет: ${randomNums}`;
  }, 200);  // Меняем каждые 200мс

  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_top_after', number: x })
    });
    if (!response.ok) throw new Error('Ошибка сети: ' + response.status);
    const data = await response.json();
    clearInterval(interval);
    if (data.top && data.top.length > 0) {
      const topText = data.top.map(([n]) => n).join(' ');
      top3.innerHTML = `Ответ: ${topText}`;
    } else {
      top3.innerHTML = 'Нет данных для анализа';
    }
  } catch (e) {
    clearInterval(interval);
    top3.innerHTML = 'Ошибка расчета';
    WebApp.showAlert('Ошибка: ' + e.message);
  }
}

// Загрузка истории (для анализа, без отображения)
fetch(WORKER_URL, { method: 'GET' }).then(r => r.json()).then(data => {
  history = data.history || [];
}).catch(e => console.log('Ошибка загрузки:', e));
</script>
</body>
</html>
