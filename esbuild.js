require('esbuild').build({
    entryPoints: ['./src/main.ts'],
    bundle: true,
    platform: 'browser',
    outfile: 'build/main.js',
    sourcemap: false,
    target: "firefox102",
    banner: { js: `// ==UserScript==
// @name        DuolingoW
// @namespace   Tobin Palmer
// @match       https://*.duolingo.com/*
// @grant       GM_log
// @version     1.0
// @author      Tobin P
// @description Duolingo W
// ==/UserScript==` },
}).then(r => r)
