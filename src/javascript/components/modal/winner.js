import showModal from './modal';

export default function showWinnerModal(fighter) {
    const fightResult = {
        title: "Winner!",
        bodyElement: fighter.name 
      }
      return showModal(fightResult);
}
