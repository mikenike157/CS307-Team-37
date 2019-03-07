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

module.exports = {
  nameCard: nameCard
};
