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

			nav li a {
				max-width: 100%;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				
				padding: .5rem;
				box-sizing: border-box;
				border-radius: .5rem;

				display: block;
				width: 100%;
			}

			a {
				color: var(--link);
				text-decoration: none;
			}

			a.active,
			a:hover {
				background: var(--hover);
			}

			table {
				width: 100%;
				table-layout: fixed;
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
}

main();
