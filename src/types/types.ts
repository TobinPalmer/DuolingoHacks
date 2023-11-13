export interface DisplayToken {
  text: string;
  isBlank: boolean;
}

export interface Pair {
  fromToken: string;
  learningToken: string;
  character: string;
  transliteration: string;
  learningWord: string;
  translation: string;
}

export interface Solution {
  type: "listenMatch"
  pairs: Pair[];
  correctTokens: string[];
  correctIndex: number;
  correctIndices: number[];
  correctSolutions: string[];
  displayTokens: DisplayToken[];
  prompt: string;
}

export interface ReactProps {
  props: {
    currentChallenge: Solution
  }
}

declare global {
  export interface Window {
    sol: Solution;
    findReact: (dom: HTMLElement, traverseUp?: number) => ReactProps;
    ss: () => void;
  }
}
