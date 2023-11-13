// ==UserScript==
// @name        DuolingoW
// @namespace   Tobin Palmer
// @match       https://*.duolingo.com/*
// @grant       GM_log
// @version     1.0
// @author      Tobin P
// @description Duolingo W
// ==/UserScript==
"use strict";
(() => {
  // src/utils/reactUtils.ts
  function findSubReact(dom) {
    const key = Object.keys(dom).find((key2) => key2.startsWith("__reactProps$")) ?? "";
    return dom.parentElement[key].children.props;
  }
  function findReact(dom, traverseUp = 0) {
    let reactProps = Object.keys(dom.parentElement).find((key) => key.startsWith("__reactProps$")) ?? "";
    while (traverseUp-- > 0 && dom.parentElement) {
      dom = dom.parentElement;
      reactProps = Object.keys(dom.parentElement).find((key) => key.startsWith("__reactProps$")) ?? "";
    }
    return dom?.parentElement?.[reactProps]?.children[0]?._owner?.stateNode;
  }

  // src/utils/correction.ts
  function correctTokensRun() {
    const allTokens = document.querySelectorAll('[data-test$="challenge-tap-token"]');
    const collectTokens = window.sol.correctTokens;
    const clickedTokens = [];
    collectTokens.forEach((correct_token) => {
      const matching_elements = Array.from(allTokens).filter((element) => (element.textContent ?? "").trim() === correct_token.trim());
      if (matching_elements.length > 0) {
        const match_index = clickedTokens.filter((token) => (token.textContent ?? "").trim() === correct_token.trim()).length;
        if (match_index < matching_elements.length) {
          matching_elements[match_index].click();
          clickedTokens.push(matching_elements[match_index]);
        } else {
          clickedTokens.push(matching_elements[0]);
        }
      }
    });
  }
  function correctIndicesRun() {
    if (window.sol.correctIndices) {
      window.sol.correctIndices?.forEach((index) => {
        document.querySelectorAll('div[data-test="word-bank"] [data-test="challenge-tap-token-text"]')[index].click();
      });
    }
  }

  // src/utils/solve.ts
  var solvingIntervalId;
  var isAutoMode = false;
  function solving() {
    if (solvingIntervalId) {
      clearInterval(solvingIntervalId);
      solvingIntervalId = void 0;
      document.querySelector("#solveAllButton").innerText = "SOLVE ALL";
      isAutoMode = false;
    } else {
      document.querySelector("#solveAllButton").innerText = "PAUSE SOLVE";
      isAutoMode = true;
      solvingIntervalId = setInterval(solve, 500);
    }
  }
  function solve() {
    const selAgain = document.querySelectorAll('[data-test="player-practice-again"]');
    const practiceAgain = document.querySelector('[data-test="player-practice-again"]');
    if (selAgain.length === 1 && isAutoMode) {
      selAgain[0].click();
      return;
    }
    if (practiceAgain !== null && isAutoMode) {
      practiceAgain.click();
      return;
    }
    try {
      GM_log("React", findReact(document.getElementsByClassName("_3FiYg")[0])?.props?.currentChallenge);
      window.sol = findReact(document.getElementsByClassName("_3FiYg")[0])?.props?.currentChallenge;
    } catch {
      const next = document.querySelector('[data-test="player-next"]');
      if (next) {
        next.click();
      }
      return;
    }
    if (!window.sol) {
      return;
    }
    let nextButton = document.querySelector('[data-test="player-next"]');
    if (!nextButton)
      return;
    if (document.querySelectorAll('[data-test*="challenge-speak"]').length > 0) {
      if (debug) {
        document.querySelector("#solveAllButton").innerText = "Challenge Speak";
      }
      const buttonSkip = document.querySelector('button[data-test="player-skip"]');
      if (buttonSkip)
        buttonSkip.click();
    } else if (window.sol.type === "listenMatch") {
      if (debug) {
        document.getElementById("solveAllButton").innerText = "Listen Match";
      }
      const inputList = document.querySelectorAll('[data-test$="challenge-tap-token"]');
      window.sol.pairs?.forEach((pair) => {
        for (let i = 0; i < inputList.length; i++) {
          let inputListText;
          if (inputList[i].querySelectorAll('[data-test="challenge-tap-token-text"]').length > 1) {
            inputListText = inputList[i].querySelector('[data-test="challenge-tap-token-text"]').innerText.toLowerCase().trim();
          } else {
            inputListText = findSubReact(inputList[i]).text.toLowerCase().trim();
          }
          if ((inputListText === pair.learningWord.toLowerCase().trim() || inputListText === pair.translation.toLowerCase().trim()) && !inputList[i].disabled) {
            inputList[i].click();
          }
        }
      });
    } else if (document.querySelectorAll('[data-test="challenge-choice"]').length > 0) {
      if (debug) {
        document.getElementById("solveAllButton").innerText = "Challenge Choice";
      }
      if (window.sol.correctTokens !== void 0) {
        correctTokensRun();
        nextButton.click();
      } else if (window.sol.correctIndex !== void 0) {
        document.querySelectorAll('[data-test="challenge-choice"]')[window.sol.correctIndex].click();
        nextButton.click();
      }
    } else if (document.querySelectorAll('[data-test$="challenge-tap-token"]').length > 0) {
      if (window.sol.pairs !== void 0) {
        if (debug) {
          document.getElementById("solveAllButton").innerText = "Pairs";
        }
        let tapTokensList = document.querySelectorAll('[data-test$="challenge-tap-token"]');
        if (document.querySelectorAll('[data-test="challenge-tap-token-text"]').length === tapTokensList.length) {
          window.sol.pairs?.forEach((pair) => {
            for (let i = 0; i < tapTokensList.length; i++) {
              const tapToken = tapTokensList[i].querySelector('[data-test="challenge-tap-token-text"]').innerText.toLowerCase().trim();
              try {
                if ((tapToken === pair.transliteration.toLowerCase().trim() || tapToken === pair.character.toLowerCase().trim()) && !tapTokensList[i].disabled) {
                  tapTokensList[i].click();
                }
              } catch (TypeError) {
                if ((tapToken === pair.learningToken.toLowerCase().trim() || tapToken === pair.fromToken.toLowerCase().trim()) && !tapTokensList[i].disabled) {
                  tapTokensList[i].click();
                }
              }
            }
          });
        }
      } else if (window.sol.correctTokens !== void 0) {
        if (debug)
          document.getElementById("solveAllButton").innerText = "Token Run";
        correctTokensRun();
        nextButton.click();
      } else if (window.sol.correctIndices !== void 0) {
        if (debug)
          document.getElementById("solveAllButton").innerText = "Indices Run";
        correctIndicesRun();
      }
    } else if (document.querySelectorAll('[data-test="challenge-tap-token-text"]').length > 0) {
      if (debug)
        document.getElementById("solveAllButton").innerText = "Challenge Tap Token Text";
      correctIndicesRun();
    } else if (document.querySelectorAll('[data-test="challenge-text-input"]').length > 0) {
      if (debug) {
        document.getElementById("solveAllButton").innerText = "Challenge Text Input";
      }
      let elm = document.querySelectorAll('[data-test="challenge-text-input"]')[0];
      let nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      nativeInputValueSetter.call(elm, window.sol.correctSolutions ? window.sol.correctSolutions[0] : window.sol.displayTokens ? window.sol.displayTokens.find((t) => t.isBlank).text : window.sol.prompt);
      let inputEvent = new Event("input", {
        bubbles: true
      });
      elm.dispatchEvent(inputEvent);
    } else if (document.querySelectorAll('[data-test*="challenge-partialReverseTranslate"]').length > 0) {
      if (debug)
        document.getElementById("solveAllButton").innerText = "Partial Reverse";
      let elm = document.querySelector('[data-test*="challenge-partialReverseTranslate"]')?.querySelector("span[contenteditable]");
      let nativeInputNodeTextSetter = Object.getOwnPropertyDescriptor(Node.prototype, "textContent").set;
      nativeInputNodeTextSetter.call(elm, '"' + window.sol?.displayTokens?.filter((t) => t.isBlank)?.map((t) => t.text)?.join()?.replaceAll(",", "") + '"');
      let inputEvent = new Event("input", {
        bubbles: true
      });
      elm.dispatchEvent(inputEvent);
    } else if (document.querySelectorAll('textarea[data-test="challenge-translate-input"]').length > 0) {
      if (debug) {
        document.getElementById("solveAllButton").innerText = "Challenge Translate Input";
      }
      const elm = document.querySelector('textarea[data-test="challenge-translate-input"]');
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      nativeInputValueSetter.call(elm, window.sol.correctSolutions ? window.sol.correctSolutions[0] : window.sol.prompt);
      let inputEvent = new Event("input", {
        bubbles: true
      });
      elm.dispatchEvent(inputEvent);
    }
    nextButton.click();
  }

  // src/utils/addButtons.ts
  function addButtons() {
    if (window.location.pathname === "/learn") {
      let button = document.querySelector('a[data-test="global-practice"]');
      if (button)
        return;
    }
    const solveAllButton = document.getElementById("solveAllButton");
    if (solveAllButton !== null)
      return;
    const original = document.querySelectorAll('[data-test="player-next"]')[0];
    if (typeof original === void 0) {
      const startButton = document.querySelector('[data-test="start-button"]');
      console.log(`Wrapper line: ${startButton}`);
      if (startButton === null)
        return;
      const wrapper = startButton.parentNode;
      const solveAllButton2 = document.createElement("a");
      solveAllButton2.className = startButton.className;
      solveAllButton2.id = "solveAllButton";
      solveAllButton2.innerText = "COMPLETE SKILL";
      solveAllButton2.removeAttribute("href");
      solveAllButton2.addEventListener("click", () => {
        solving();
        setInterval(() => {
          const startButton2 = document.querySelector('[data-test="start-button"]');
          if (startButton2 && startButton2.innerText.startsWith("START")) {
            startButton2.click();
          }
        }, 3e3);
        startButton.click();
      });
      if (wrapper)
        wrapper.appendChild(solveAllButton2);
    } else {
      const wrapper = document.getElementsByClassName("_10vOG")[0];
      wrapper.style.display = "flex";
      const solveCopy = document.createElement("button");
      const repoLink = document.createElement("p");
      const pauseCopy = document.createElement("button");
      solveCopy.id = "solveAllButton";
      solveCopy.innerHTML = "SOLVE";
      solveCopy.disabled = false;
      pauseCopy.innerHTML = "SOLVE";
      repoLink.innerHTML = 'Made By <a href="https://github.com/TobinPalmer">Tobin Palmer</a>';
      const buttonStyle = `
          min-width: 150px;
          font-size: 17px;
          border:none;
          border-bottom: 4px solid #58a700;
          border-radius: 18px;
          padding: 13px 16px;
          transform: translateZ(0);
          transition: filter .2s;
          font-weight: 700;
          letter-spacing: .8px;
          background: #55CD2E;
          color:#fff;
          margin-left:20px;
          cursor:pointer;
        `;
      const repoStyle = `
          font-family: "Jetbrains Mono";
          position: fixed;
          right: 1rem;
          bottom: 1rem;
    `;
      solveCopy.style.cssText = buttonStyle;
      pauseCopy.style.cssText = buttonStyle;
      repoLink.style.cssText = repoStyle;
      [solveCopy, pauseCopy].forEach((button) => {
        button.addEventListener("mousemove", () => {
          button.style.filter = "brightness(1.1)";
        });
        button.addEventListener("mouseleave", () => {
          button.style.filter = "none";
        });
      });
      original.parentElement.appendChild(pauseCopy);
      original.parentElement.appendChild(solveCopy);
      original.parentElement.appendChild(repoLink);
      solveCopy.addEventListener("click", solving);
      pauseCopy.addEventListener("click", solve);
    }
  }

  // src/init.ts
  function init() {
    setInterval(addButtons, 1e3);
  }

  // src/main.ts
  var debug = false;
  init();
  window.findReact = findReact;
  window.ss = solving;
})();
