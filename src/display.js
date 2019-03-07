function nameCard(card) {
  let suit = Math.floor(card / 13);
  card = card - (13 * suit);
  let suitStr = ["S", "D", "C", "H"][suit];
  let rankStr = undefined;
  switch (card) {
    case 9: rankStr = "J"; break;
    case 10: rankStr = "Q"; break;
    case 11: rankStr = "K"; break;
    case 12: rankStr = "A"; break;
    default: rankStr = "" + (card + 2);
  }
  return rankStr + suitStr;
}

function namePlayerAndTableCards(pCards, tCards) {
  let retPCards = pCards.map(hand => hand.map(nameCard));
  let retTCards = tCards.map(nameCard);
  return [retPCards, retTCards];
}

module.exports = {
  nameCard: nameCard,
  namePlayerAndTableCards: namePlayerAndTableCards,
};
