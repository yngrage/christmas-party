const board = document.querySelector('#game-board');
const movesDisplay = document.querySelector('#moves');
const matchesDisplay = document.querySelector('#matches');
const message = document.querySelector('#game-message');
const symbols = ['🎄', '🕯️', '🧦', '⭐', '🍊', '🎁'];
let firstCard = null;
let lockBoard = false;
let moves = 0;
let matches = 0;

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function makeCard(symbol, index) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'gift-card';
  card.setAttribute('aria-label', `Gift ${index + 1}, unopened`);
  card.dataset.symbol = symbol;
  card.innerHTML = '<span class="gift-inner"><span class="gift-face gift-back" aria-hidden="true">✳</span><span class="gift-face gift-front" aria-hidden="true"></span></span>';
  card.querySelector('.gift-front').textContent = symbol;
  card.addEventListener('click', () => flipCard(card));
  return card;
}

function flipCard(card) {
  if (lockBoard || card === firstCard || card.classList.contains('is-matched')) return;
  card.classList.add('is-flipped');
  card.setAttribute('aria-label', `Gift: ${card.dataset.symbol}`);
  if (!firstCard) {
    firstCard = card;
    return;
  }
  moves++;
  movesDisplay.textContent = moves;
  if (firstCard.dataset.symbol === card.dataset.symbol) {
    firstCard.classList.add('is-matched');
    card.classList.add('is-matched');
    firstCard.setAttribute('aria-label', `Matched ${card.dataset.symbol}`);
    card.setAttribute('aria-label', `Matched ${card.dataset.symbol}`);
    firstCard = null;
    matches++;
    matchesDisplay.textContent = `${matches} / 6`;
    if (matches === symbols.length) {
      message.textContent = `All unwrapped in ${moves} moves. You found the Christmas magic! ✨`;
      return;
    }
    message.textContent = ['A perfect match. Keep going!', 'A little Christmas magic!'][Math.floor(Math.random() * 2)];
  } else {
    lockBoard = true;
    const previous = firstCard;
    firstCard = null;
    message.textContent = 'Not a pair just yet. Try another two.';
    window.setTimeout(() => {
      previous.classList.remove('is-flipped');
      card.classList.remove('is-flipped');
      previous.setAttribute('aria-label', 'Gift, unopened');
      card.setAttribute('aria-label', 'Gift, unopened');
      lockBoard = false;
    }, 850);
  }
}

function startGame() {
  firstCard = null;
  lockBoard = false;
  moves = 0;
  matches = 0;
  movesDisplay.textContent = '0';
  matchesDisplay.textContent = '0 / 6';
  message.textContent = 'Pick any two gifts to begin.';
  board.replaceChildren(...shuffle([...symbols, ...symbols]).map(makeCard));
}

document.querySelector('#restart').addEventListener('click', startGame);
startGame();
