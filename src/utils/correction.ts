export function correctTokensRun() {
    const allTokens: NodeListOf<HTMLElement> = document.querySelectorAll('[data-test$="challenge-tap-token"]');
    const collectTokens = window.sol.correctTokens;
    const clickedTokens: HTMLElement[] = [];

    collectTokens.forEach(correct_token => {
        const matching_elements: HTMLElement[] = Array.from(allTokens).filter(element => (element.textContent ?? "").trim() === correct_token.trim());
        if (matching_elements.length > 0) {
            const match_index = clickedTokens.filter(token => (token.textContent ?? "").trim() === correct_token.trim()).length;
            if (match_index < matching_elements.length) {
                matching_elements[match_index].click();
                clickedTokens.push(matching_elements[match_index]);
            } else {
                clickedTokens.push(matching_elements[0]);
            }
        }
    });
}

export function correctIndicesRun() {
    if (window.sol.correctIndices) {
        window.sol.correctIndices?.forEach(index => {
            (document.querySelectorAll('div[data-test="word-bank"] [data-test="challenge-tap-token-text"]')[index] as HTMLElement).click();
        });
        // nextButton.click();
    }
}
