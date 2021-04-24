const cards = [
  { s: 1 }, { s: 2 }, { s: 3 }, { s: 4 }, { s: 5 }, { s: 6 }, { s: 7 }, { s: 8 }, { s: 9 }, { s: 10 }, { s: 'J' }, { s: 'Q' }, { s: 'K' }, { h: 1 }, { h: 2 }, { h: 3 }, { h: 4 }, { h: 5 }, { h: 6 }, { h: 7 }, { h: 8 }, { h: 9 }, { h: 10 }, { h: 'J' }, { h: 'Q' }, { h: 'K' }, { c: 1 }, { c: 2 }, { c: 3 }, { c: 4 }, { c: 5 }, { c: 6 }, { c: 7 }, { c: 8 }, { c: 9 }, { c: 10 }, { c: 'J' }, { c: 'Q' }, { c: 'K' }, { d: 1 }, { d: 2 }, { d: 3 }, { d: 4 }, { d: 5 }, { d: 6 }, { d: 7 }, { d: 8 }, { d: 9 }, { d: 10 }, { d: 'J' }, { d: 'Q' }, { d: 'K' }
]

const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}

const model = {
  score: 0,
  triedRounds: 0,
  revealedCards: [],
  isRevealedCardsMatched () {
    return this.revealedCards[0].dataset.index === this.revealedCards[1].dataset.index
  }
}

const view = {
  generateCardContent (arr) {
    let cardContent = ''
    arr.forEach((obj) => {
      switch (Object.keys(obj)[0]) {
        case 's': // 黑桃
          cardContent += `
        <div class="card back" data-suit="s" data-index="${Object.values(obj)[0]}">
          <p>${Object.values(obj)[0]}</p>
          <img src="img/s.svg">
          <p>${Object.values(obj)[0]}</p>
        </div>`
          break
        case 'h': // 紅心
          cardContent += `
        <div class="card back" data-suit="h" data-index="${Object.values(obj)[0]}">
          <p class="red">${Object.values(obj)[0]}</p>
          <img src="img/h.svg" class="red">
          <p class="red">${Object.values(obj)[0]}</p>
        </div>`
          break
        case 'c': // 梅花
          cardContent += `
        <div class="card back" data-suit="c" data-index="${Object.values(obj)[0]}">
          <p>${Object.values(obj)[0]}</p>
          <img src="img/c.svg">
          <p>${Object.values(obj)[0]}</p>
        </div>`
          break
        case 'd': // 方塊
          cardContent += `
        <div class="card back" data-suit="d" data-index="${Object.values(obj)[0]}">
          <p class="red">${Object.values(obj)[0]}</p>
          <img src="img/d.svg" class="red">
          <p class="red">${Object.values(obj)[0]}</p>
        </div>`
          break
      }
    })
    return cardContent
  },
  displayCards (arr) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = this.generateCardContent(arr)
  },
  flipCards (...cards) {
    cards.forEach(card => card.classList.toggle('back'))
  },
  pairCards (...cards) {
    cards.forEach(card => card.classList.add('paired'))
  },
  displayScore (score) {
    document.querySelector('#score').innerHTML = score
  },
  displayTriedRounds (triedRounds) {
    document.querySelector('#triedRounds').innerHTML = triedRounds
  },
  appendWrongAnimation (...cards) {
    cards.forEach(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },
  displayCompletedInfo () {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedRounds} times</p>
    `
    const header = document.querySelector('header')
    header.before(div)
  }
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards () {
    // 洗牌、發牌
    const shuffledCards = utility.shuffleCards(cards)
    view.displayCards(shuffledCards)
  },
  dispatchCardAction (card) {
    if (!card.classList.contains('back')) {
      // 牌已經被翻開，什麼都不做
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.displayTriedRounds(++model.triedRounds)
        view.flipCards(card)
        model.revealedCards.push(card)
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          view.displayScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          // 260分，遊戲結束
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished
            view.displayCompletedInfo()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
  },
  resetCards () {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

const utility = {
  shuffleCards (arr) {
    for (let index = arr.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1))
        ;[arr[index], arr[randomIndex]] = [arr[randomIndex], arr[index]]
    }
    return arr
  }
}

controller.generateCards()

// 監聽卡片點擊事件
document.querySelector('#cards').addEventListener('click', (event) => {
  const clickTarget = event.target
  if (clickTarget.classList.contains('card')) {
    controller.dispatchCardAction(clickTarget)
  }
})
