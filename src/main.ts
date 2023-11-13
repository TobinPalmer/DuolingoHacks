// ==UserScript==
// @name        DuolingoW
// @namespace   Tobin Palmer
// @match       https://*.duolingo.com/*
// @grant       GM_log
// @version     1.0
// @author      Tobin P
// @description Duolingo W
// ==/UserScript==

import {findReact} from "./utils/reactUtils";
import {solving} from "./utils/solve";
import init from "./init";

declare const GM_log: (...data: any[]) => void;

export const debug = false;

init()


window.findReact = findReact;
window.ss = solving;
