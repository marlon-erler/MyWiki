#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const marked_1 = require("marked");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        //read directory
        const files = (yield promises_1.default.readdir('.'))
            // filter files
            .filter((item) => __awaiter(this, void 0, void 0, function* () { return (yield promises_1.default.stat(item)).isFile() == true; }))
            // filter markdown
            .filter((file) => /^(.*)\.md$/.test(file) == true);
        yield promises_1.default.mkdir('dist', { recursive: true });
        const allNavData = [];
        for (const i in files) {
            const file = files[i];
            allNavData[i] = {
                title: yield getTitle(file),
                link: convertName(file),
            };
        }
        for (const i in files) {
            const file = files[i];
            const navData = allNavData[i];
            const htmlName = convertName(file);
            const htmlCode = yield buildCode(file, navData, allNavData);
            yield promises_1.default.writeFile(getPath(htmlName), htmlCode);
        }
    });
}
function convertName(fileName) {
    return fileName.replace(/.md$/, '.html');
}
function getPath(fileName) {
    return `dist/${fileName}`;
}
function getTitle(fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield readFile(fileName)).split('\n')[0];
    });
}
function readFile(fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield promises_1.default.readFile(fileName, { encoding: 'utf-8' });
    });
}
function toHTML(markdown) {
    return marked_1.marked.parse(markdown, { mangle: false, headerIds: false });
}
function buildCode(fileName, navData, allNavData) {
    return __awaiter(this, void 0, void 0, function* () {
        const markdown = yield readFile(fileName);
        const contentHTML = toHTML(markdown);
        const nav = allNavData
            .map((data) => `<li><a href="${data.link}" class="${navData.link == data.link ? 'active' : ''}">${data.title}</a></li>`)
            .join('\n');
        return `
<!DOCTYPE html>
<html>
    <head>
        <title>${navData.title}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">

        <style>
			:root {
				--background: white;
				--nav: #f7f7f7;
				--hover: #e9e9e9;
				--text: black;
				--link: #3d727b;

				--nav-width: 16rem;
			}

			@media (prefers-color-scheme: dark) {
				:root {
					--background: black;
					--nav: #323232;
					--hover: #252525;
					--text: white;
					--link: #3d727b;
				}
			}

            body {
                font-family: sans-serif;
				background: var(--background);
				color: var(--text);
            }

            nav, main {
                float: left;
				width: 100%;
				box-sizing: border-box;
            }

			@media (min-width: 950px) {
				nav {
					width: var(--nav-width);
				}

				main {
					width: calc(100% - 2rem - var(--nav-width));
				}
			}

            nav {
                margin-right: 2rem;
                padding: 1rem;

                background-color: var(--nav);

				border-radius: .5rem;
            }

			nav li {
				list-style-type: none;
				height: auto;
			}

			a {
				color: var(--link);
				text-decoration: none;

				padding: .5rem;
				box-sizing: border-box;
				border-radius: .5rem;

				display: block;
				width: 100%;
			}

			a.active,
			a:hover {
				background: var(--hover);
			}

			table {
				width: 100%;
			}

            th, td {
				background: var(--nav);
				border-radius: .2rem;
                padding: .5rem;
            }
        </style>
    </head>
    <body>
        <nav>
            ${nav}
        </nav>

        <main>
            ${contentHTML}
        </main>
    </body>
</html>
    `;
    });
}
main();
