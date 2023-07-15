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
        <meta name="viewport" content="width=device-with,initial-scale=1">

        <style>
            body {
                font-family: sans-serif;
            }

            nav, main {
                float: left
            }

            nav {
                margin-right: 2rem;
                padding: 1rem 2rem;
                padding-right: 3rem;

                background-color: lightgray;
            }

            a.active {
                font-weight: bold;
            }

            th, td {
                border: 1px solid lightgray;
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
