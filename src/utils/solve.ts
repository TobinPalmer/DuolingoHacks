import {DisplayToken} from "../types/types";
import {correctIndicesRun, correctTokensRun} from "./correction";
import {debug} from "../main";
import {findReact, findSubReact} from "./reactUtils";

declare const GM_log: (...data: any[]) => void;

let solvingIntervalId: number | undefined;
let isAutoMode = false;

export function solving(): void {
    if (solvingIntervalId) {
        clearInterval(solvingIntervalId);
        solvingIntervalId = undefined;
        (document.querySelector("#solveAllButton") as HTMLElement).innerText = "SOLVE ALL";
        isAutoMode = false;
    } else {
        (document.querySelector("#solveAllButton") as HTMLElement).innerText = "PAUSE SOLVE";
        isAutoMode = true;
        solvingIntervalId = setInterval(solve, 500);
    }
}

export function solve() {

    const selAgain: NodeListOf<HTMLElement> = document.querySelectorAll('[data-test="player-practice-again"]');
    const practiceAgain: HTMLElement | null = document.querySelector('[data-test="player-practice-again"]');

    if (selAgain.length === 1 && isAutoMode) {
        selAgain[0].click();
        return;
    }

    if (practiceAgain !== null && isAutoMode) {
        practiceAgain.click();
        return;
    }

    try {
        GM_log("React", findReact(document.getElementsByClassName('_3FiYg')[0] as HTMLElement)?.props?.currentChallenge);
        window.sol = findReact(document.getElementsByClassName('_3FiYg')[0] as HTMLElement)?.props?.currentChallenge;
    } catch {
        const next: HTMLElement | null = document.querySelector('[data-test="player-next"]');
        if (next) {
            next.click();
        }
        return;
    }
    if (!window.sol) {
        return;
    }
    let nextButton: HTMLElement | null = document.querySelector('[data-test="player-next"]');
    if (!nextButton) return;

    if (document.querySelectorAll('[data-test*="challenge-speak"]').length > 0) {
        if (debug) {
            (document.querySelector("#solveAllButton") as HTMLElement).innerText = 'Challenge Speak';
        }

        const buttonSkip: HTMLElement | null = document.querySelector('button[data-test="player-skip"]');
        if (buttonSkip) buttonSkip.click();

    } else if (window.sol.type === 'listenMatch') {
        if (debug) {
            (document.getElementById("solveAllButton") as HTMLElement).innerText = 'Listen Match';
        }

        const inputList: NodeListOf<HTMLInputElement> = document.querySelectorAll('[data-test$="challenge-tap-token"]');
        window.sol.pairs?.forEach((pair) => {
            for (let i = 0; i < inputList.length; i++) {
                let inputListText: string

                if (inputList[i].querySelectorAll('[data-test="challenge-tap-token-text"]').length > 1) {
                    inputListText = (inputList[i].querySelector('[data-test="challenge-tap-token-text"]') as HTMLElement).innerText.toLowerCase().trim();
                } else {
                    inputListText = findSubReact(inputList[i]).text.toLowerCase().trim();
                }
                if (
                    (
                        inputListText === pair.learningWord.toLowerCase().trim() ||
                        inputListText === pair.translation.toLowerCase().trim()
                    ) &&
                    !inputList[i].disabled
                ) {
                    inputList[i].click();
                }
            }
        });
    } else if (document.querySelectorAll('[data-test="challenge-choice"]').length > 0) {
        // choice challenge
        if (debug) {
            (document.getElementById("solveAllButton") as HTMLElement).innerText = 'Challenge Choice';
        }

        if (window.sol.correctTokens !== undefined) {
            correctTokensRun();
            nextButton.click()
        } else if (window.sol.correctIndex !== undefined) {
            (document.querySelectorAll('[data-test="challenge-choice"]')[window.sol.correctIndex] as HTMLElement).click();
            nextButton.click();
        }
    } else if (document.querySelectorAll('[data-test$="challenge-tap-token"]').length > 0) {
        // Match correct tokens
        if (window.sol.pairs !== undefined) {
            if (debug) {
                (document.getElementById("solveAllButton") as HTMLElement).innerText = 'Pairs';
            }

            // Tokens for tapping problems
            let tapTokensList: NodeListOf<HTMLInputElement> = document.querySelectorAll('[data-test$="challenge-tap-token"]');
            if (document.querySelectorAll('[data-test="challenge-tap-token-text"]').length === tapTokensList.length) {
                window.sol.pairs?.forEach((pair) => {
                    for (let i = 0; i < tapTokensList.length; i++) {
                        const tapToken = (tapTokensList[i].querySelector('[data-test="challenge-tap-token-text"]') as HTMLElement).innerText.toLowerCase().trim();
                        try {
                            if (
                                (
                                    tapToken === pair.transliteration.toLowerCase().trim() ||
                                    tapToken === pair.character.toLowerCase().trim()
                                )
                                && !tapTokensList[i].disabled
                            ) {
                                tapTokensList[i].click()
                            }
                        } catch (TypeError) {
                            if (
                                (
                                    tapToken === pair.learningToken.toLowerCase().trim() ||
                                    tapToken === pair.fromToken.toLowerCase().trim()
                                )
                                && !tapTokensList[i].disabled
                            ) {
                                tapTokensList[i].click()
                            }
                        }
                    }
                })
            }
        } else if (window.sol.correctTokens !== undefined) {
            if (debug)
                (document.getElementById("solveAllButton") as HTMLElement).innerText = 'Token Run';
            correctTokensRun();
            nextButton.click()
        } else if (window.sol.correctIndices !== undefined) {
            if (debug)
                (document.getElementById("solveAllButton") as HTMLElement).innerText = 'Indices Run';
            correctIndicesRun();
        }
    } else if (document.querySelectorAll('[data-test="challenge-tap-token-text"]').length > 0) {
        if (debug)
            (document.getElementById("solveAllButton") as HTMLElement).innerText = 'Challenge Tap Token Text';
        // fill the gap challenge
        correctIndicesRun();
    } else if (document.querySelectorAll('[data-test="challenge-text-input"]').length > 0) {
        if (debug) {
            (document.getElementById("solveAllButton") as HTMLElement).innerText = 'Challenge Text Input';
        }

        let elm = document.querySelectorAll('[data-test="challenge-text-input"]')[0];
        let nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set!;
        nativeInputValueSetter.call(elm, window.sol.correctSolutions ? window.sol.correctSolutions[0] : (window.sol.displayTokens ? (window.sol.displayTokens.find(t => t.isBlank) as DisplayToken).text : window.sol.prompt));
        let inputEvent = new Event('input', {
            bubbles: true
        });

        elm.dispatchEvent(inputEvent);
    } else if (document.querySelectorAll('[data-test*="challenge-partialReverseTranslate"]').length > 0) {
        if (debug)
            (document.getElementById("solveAllButton") as HTMLElement).innerText = 'Partial Reverse';
        let elm = document.querySelector('[data-test*="challenge-partialReverseTranslate"]')?.querySelector("span[contenteditable]") as HTMLElement;
        let nativeInputNodeTextSetter = Object.getOwnPropertyDescriptor(Node.prototype, "textContent")!.set!
        nativeInputNodeTextSetter.call(elm, '"' + window.sol?.displayTokens?.filter(t => t.isBlank)?.map(t => t.text)?.join()?.replaceAll(',', '') + '"');

        let inputEvent = new Event('input', {
            bubbles: true
        });

        elm.dispatchEvent(inputEvent);
    } else if (document.querySelectorAll('textarea[data-test="challenge-translate-input"]').length > 0) {
        if (debug) {
            (document.getElementById("solveAllButton") as HTMLElement).innerText = 'Challenge Translate Input';
        }
        const elm = document.querySelector('textarea[data-test="challenge-translate-input"]') as HTMLTextAreaElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")!.set!;
        nativeInputValueSetter.call(elm, window.sol.correctSolutions ? window.sol.correctSolutions[0] : window.sol.prompt);

        let inputEvent = new Event('input', {
            bubbles: true
        });

        elm.dispatchEvent(inputEvent);
    }
    nextButton.click()
}
