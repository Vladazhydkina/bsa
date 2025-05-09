import controls from '../../constants/controls';
import createElement from '../helpers/domHelper';

export async function fight(firstFighter, secondFighter) {
  return new Promise((resolve) => {
    const waitForElements = setInterval(() => {
      const healthBarsHTML = document.getElementsByClassName("arena___health-bar");
      const healthBarsTitleHTML = document.getElementsByClassName("arena___health-title");
      const statusViewHTML = document.getElementsByClassName("arena___health-indicator");
      const healthBarContainerHTML = document.getElementsByClassName("arena___fighter-indicator");

      if (healthBarsHTML.length === 2 && healthBarsTitleHTML.length === 2 && statusViewHTML.length === 2 && healthBarContainerHTML.length === 2) {
        clearInterval(waitForElements);
        startGame(firstFighter, secondFighter, resolve, healthBarsHTML, healthBarsTitleHTML, statusViewHTML, healthBarContainerHTML);
      }
    }, 100);
  });
}

function startGame(firstFighter, secondFighter, resolve, healthBarsHTML, healthBarsTitleHTML, statusViewHTML, healthBarContainerHTML) {
  const healthBarsTitleArray = [...healthBarsTitleHTML];
  const healthBarsArray = [...healthBarsHTML];
  const statusViewsArray = [...statusViewHTML];
  const healthBarContainerArray = [...healthBarContainerHTML];

  const gameStatus = {
    currentHealth: 100,
    criticalDamageChecker: Date.now(),
    block: false,
    keyCombination: [],
  };

  const FighterOne = {
    ...firstFighter,
    ...gameStatus,
    healthBar: healthBarsArray[0],
    healthBarValue: healthBarsTitleArray[0],
    healthBarTitleValue: healthBarsTitleArray[0]?.innerText,
    statusView: statusViewsArray[0],
    position: "left"
  };

  const FighterTwo = {
    ...secondFighter,
    ...gameStatus,
    healthBar: healthBarsArray[1],
    healthBarValue: healthBarsTitleArray[1],
    healthBarTitleValue: healthBarsTitleArray[1]?.innerText,
    statusView: statusViewsArray[1],
    position: "right"
  };

  function showBlockingStatus(fighter) {
    const statusElementId = `arena___health-status-${fighter.position}`;
    if (document.getElementById(statusElementId)) {
      document.getElementById(statusElementId).remove();
    }

    const positionIndex = fighter.position === "left" ? 0 : 1;
    if (healthBarContainerArray[positionIndex]) {
      const element = createElement({
        tagName: "span",
        className: "arena___health-status",
        attributes: { id: statusElementId },
      });
      element.innerText = "Blocking";
      healthBarContainerArray[positionIndex].append(element);
    }
  }

  function fighterAttackHandler(attacker, defender) {
    if (attacker.block || defender.block) return;
    const damage = getDamage(attacker, defender);
    defender.currentHealth = Math.max(0, defender.currentHealth - damage / defender.health * 100);
    defender.healthBarTitleValue = Math.max(0, (defender.healthBarTitleValue || 0) - damage);

    if (defender.healthBar) {
      defender.healthBar.style.width = `${defender.currentHealth}%`;
    }
    if (defender.healthBarValue) {
      defender.healthBarValue.innerText = defender.healthBarTitleValue?.toFixed(1) || "0";
      defender.healthBarValue.style.color = "#ff0000";
      if (defender.healthBar) {
        defender.healthBar.style.backgroundColor = "#ff0000";
      }
      setTimeout(() => {
        defender.healthBarValue.style.color = "#ebd759";
        if (defender.healthBar) {
          defender.healthBar.style.backgroundColor = "#ebd759";
        }
      }, 200);
    }

    if (defender.currentHealth <= 0) {
      document.removeEventListener("keyup", keyUp);
      document.removeEventListener("keydown", keyDown);
      if (defender.healthBar) {
        defender.healthBar.style.width = "0%";
      }
      if (defender.healthBarValue) {
        defender.healthBarValue.innerText = "0";
      }
      resolve(attacker);
    }
  }

  function criticalDamage(fighter, defender, key) {
    fighter.keyCombination.push(key);

    const criticalChecker = new Date();
    if (criticalChecker - fighter.criticalDamageChecker > 10000 && fighter.keyCombination.length === 3) {
      const criticalDamageAmount = fighter.attack * 2;
      defender.currentHealth = Math.max(0, defender.currentHealth - criticalDamageAmount / defender.health * 100);
      defender.healthBarTitleValue = Math.max(0, (defender.healthBarTitleValue || 0) - criticalDamageAmount);

      if (defender.healthBar) {
        defender.healthBar.style.width = `${defender.currentHealth}%`;
      }
      if (defender.healthBarValue) {
        defender.healthBarValue.innerText = defender.healthBarTitleValue?.toFixed(1) || "0";
        defender.healthBarValue.style.color = "#ff0000";
        if (defender.healthBar) {
          defender.healthBar.style.backgroundColor = "#ff0000";
        }
        setTimeout(() => {
          defender.healthBarValue.style.color = "#ebd759";
          if (defender.healthBar) {
            defender.healthBar.style.backgroundColor = "#ebd759";
          }
        }, 700);
      }
      fighter.criticalDamageChecker = criticalChecker;
    }

    if (defender.currentHealth <= 0) {
      document.removeEventListener("keyup", keyUp);
      document.removeEventListener("keydown", keyDown);
      if (defender.healthBar) {
        defender.healthBar.style.width = "0%";
      }
      if (defender.healthBarValue) {
        defender.healthBarValue.innerText = "0";
      }
      resolve(fighter);
    }
  }

  function keyUp(event) {
    console.log("keyUp:", event.code);
    if (controls.PlayerOneCriticalHitCombination.includes(event.code)) {
      FighterOne.keyCombination = FighterOne.keyCombination.filter((e) => e !== event.code);
    }
    if (controls.PlayerTwoCriticalHitCombination.includes(event.code)) {
      FighterTwo.keyCombination = FighterTwo.keyCombination.filter((e) => e !== event.code);
    }
    switch (event.code) {
      case controls.PlayerOneAttack:
        fighterAttackHandler(FighterOne, FighterTwo);
        break;
      case controls.PlayerTwoAttack:
        fighterAttackHandler(FighterTwo, FighterOne);
        break;
      case controls.PlayerOneBlock:
        FighterOne.block = false;
        showBlockingStatus(FighterOne);
        break;
      case controls.PlayerTwoBlock:
        FighterTwo.block = false;
        showBlockingStatus(FighterTwo);
        break;
    }
  }

  function keyDown(event) {
    if (event.repeat) return;
    if (controls.PlayerOneCriticalHitCombination.includes(event.code)) {
      criticalDamage(FighterOne, FighterTwo, event.code);
    }
    if (controls.PlayerTwoCriticalHitCombination.includes(event.code)) {
      criticalDamage(FighterTwo, FighterOne, event.code);
    }
    switch (event.code) {
      case controls.PlayerOneBlock:
        FighterOne.block = true;
        showBlockingStatus(FighterOne);
        break;
      case controls.PlayerTwoBlock:
        FighterTwo.block = true;
        showBlockingStatus(FighterTwo);
        break;
    }
  }
  document.addEventListener("keyup", keyUp);
  document.addEventListener("keydown", keyDown);
}

export function getDamage(attacker, defender) {
  const damage = getHitPower(attacker) - getBlockPower(defender);
  return Math.max(0, damage);
}

export function getHitPower(fighter) {
  const criticalHitChance = Math.random() + 1;
  const { attack } = fighter;
  return attack * criticalHitChance;
}

export function getBlockPower(fighter) {
  const { defense } = fighter;
  const dodgeChance = Math.random() + 1;
  return defense * dodgeChance;
}