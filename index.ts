#!/usr/bin/env node

import Fs from 'fs/promises';
import { marked } from 'marked';

interface NavData {
    title: string;
    link: string;
}

async function main() {
    //read directory
    const files = (await Fs.readdir('.'))
        // filter files
        .filter(async (item) => (await Fs.stat(item)).isFile() == true)
        // filter markdown
        .filter((file) => /^(.*)\.md$/.test(file) == true);

    await Fs.mkdir('dist', { recursive: true });

    const allNavData: NavData[] = [];
    for (const i in files) {
        const file = files[i];
        allNavData[i] = {
            title: await getTitle(file),
            link: convertName(file),
        };
    }

    for (const i in files) {
        const file = files[i];
        const navData = allNavData[i];

        const htmlName = convertName(file);
        const htmlCode = await buildCode(file, navData, allNavData);

        await Fs.writeFile(getPath(htmlName), htmlCode);
    }
}

function convertName(fileName: string) {
    return fileName.replace(/.md$/, '.html');
}

function getPath(fileName: string) {
    return `dist/${fileName}`;
}

async function getTitle(fileName: string) {
    return (await readFile(fileName)).split('\n')[0];
}

async function readFile(fileName: string) {
    return await Fs.readFile(fileName, { encoding: 'utf-8' });
}

function toHTML(markdown: string) {
    return marked.parse(markdown, { mangle: false, headerIds: false });
}

async function buildCode(
    fileName: string,
    navData: NavData,
    allNavData: NavData[],
) {
    const markdown = await readFile(fileName);
    const contentHTML = toHTML(markdown);

    const nav = allNavData
        .map(
            (data) =>
                `<li><a href="${data.link}" class="${
                    navData.link == data.link ? 'active' : ''
                }">${data.title}</a></li>`,
        )
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
}

main();
