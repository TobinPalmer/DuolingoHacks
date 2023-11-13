import { solve, solving } from "./solve";

export default function addButtons(): void {
  if (window.location.pathname === '/learn') {
    let button = document.querySelector('a[data-test="global-practice"]');
    if (button) return;
  }

  const solveAllButton = document.getElementById("solveAllButton");
  if (solveAllButton !== null) return;

  const original = document.querySelectorAll('[data-test="player-next"]')[0];
  if (typeof original === undefined) {
    const startButton = document.querySelector('[data-test="start-button"]') as HTMLElement

    console.log(`Wrapper line: ${startButton}`);
    if (startButton === null) return;

    const wrapper = startButton.parentNode;
    const solveAllButton = document.createElement('a');
    solveAllButton.className = startButton.className;
    solveAllButton.id = "solveAllButton";
    solveAllButton.innerText = "COMPLETE SKILL";
    solveAllButton.removeAttribute('href');
    solveAllButton.addEventListener('click', () => {
      solving();
      setInterval(() => {
        const startButton = document.querySelector('[data-test="start-button"]') as HTMLElement
        if (startButton && startButton.innerText.startsWith("START")) {
          startButton.click();
        }
      }, 3000);
      startButton.click();
    });

    if (wrapper) wrapper.appendChild(solveAllButton);
  } else {
    const wrapper = document.getElementsByClassName('_10vOG')[0] as HTMLElement;
    wrapper.style.display = "flex";

    const solveCopy = document.createElement('button');
    const repoLink = document.createElement('p');
    const pauseCopy = document.createElement('button');

    solveCopy.id = 'solveAllButton';
    solveCopy.innerHTML = 'SOLVE'
    solveCopy.disabled = false;
    pauseCopy.innerHTML = 'SOLVE';

    repoLink.innerHTML = 'Made By <a href="https://github.com/TobinPalmer">Tobin Palmer</a>'

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
    `

    solveCopy.style.cssText = buttonStyle;
    pauseCopy.style.cssText = buttonStyle;
    repoLink.style.cssText = repoStyle;

    [solveCopy, pauseCopy].forEach(button => {
      button.addEventListener("mousemove", () => {
        button.style.filter = "brightness(1.1)";
      });

      button.addEventListener("mouseleave", () => {
        button.style.filter = "none";
      });
    });

    (original.parentElement as HTMLElement).appendChild(pauseCopy);
    (original.parentElement as HTMLElement).appendChild(solveCopy);
    (original.parentElement as HTMLElement).appendChild(repoLink);

    solveCopy.addEventListener('click', solving);
    pauseCopy.addEventListener('click', solve);
  }
}
