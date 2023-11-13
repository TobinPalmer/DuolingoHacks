import {ReactProps} from "../types/types";

interface ReactElement extends HTMLElement {
    _owner: {
        stateNode: {
            props: ReactProps
        }
    }
}

export function findSubReact(dom: HTMLElement) {
    const key = Object.keys(dom).find(key => key.startsWith("__reactProps$")) ?? "";

    // @ts-ignore
    return dom.parentElement[key].children.props;
}

// This kindof recursivly looks up a subtree of elements and looks for something called __reactProps$RANDOMSTRING.
// Then we basically go into the secret duolingo stuff that has the answer and return it.
// The props contain a correct answer and a list of tokens that are the words in the answer.
export function findReact(dom: HTMLElement, traverseUp = 0): ReactProps {
    let reactProps: string = Object.keys(dom.parentElement as HTMLElement).find((key) => key.startsWith("__reactProps$")) ?? ""

    while (traverseUp-- > 0 && dom.parentElement) {
        dom = dom.parentElement;
        reactProps = Object.keys(dom.parentElement as HTMLElement).find((key) => key.startsWith("__reactProps$")) ?? ""
    }

    // @ts-ignore
    return dom?.parentElement?.[reactProps]?.children[0]?._owner?.stateNode;
}
