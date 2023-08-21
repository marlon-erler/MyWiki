#!/usr/bin/env node

import Fs from 'fs/promises';
import { marked } from 'marked';

// Types
interface NavData {
    title: string;
    link: string;
}

// Main
async function main() {
    //get files
    const items = (await Fs.readdir('.'));
	const files = [];
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		const stat = await Fs.stat(item);
		if (stat.isFile() == false) continue;
		
		// item is a file
		files.push(item);
	}
	
	const markdownFiles = [];
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const isMarkdown = /^(.*)\.md$/.test(file);
		if (isMarkdown == false) continue;
		
		// item is markdown file
		markdownFiles.push(file);
	}
	
	let header = '';
	const headerFilePath = 'wiki-header.html';
	if (files.indexOf(headerFilePath) > -1) {
		header = await Fs.readFile(headerFilePath, {encoding: 'utf-8'});
	}

	let css = `:root {
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
            }`
	const cssFilePath = 'wiki-styles.css';
	if (files.indexOf(cssFilePath) > -1) {
		css = await Fs.readFile(cssFilePath, {encoding: 'utf-8'});
	}

	//prepare dist
    await Fs.mkdir('dist', { recursive: true });

	//collect nav data
    const allNavData: NavData[] = [];
    for (let i = 0; i < markdownFiles.length; i++) {
        const file = markdownFiles[i];
        allNavData[i] = {
            title: await getTitle(file),
            link: convertName(file),
        };
    }

	//create files
    for (let i = 0; i < markdownFiles.length; i++) {
        const file = markdownFiles[i];
        const navData = allNavData[i];

        const htmlName = convertName(file);
        const htmlCode = await buildCode(file, navData, header, css, allNavData);

        await Fs.writeFile(getPath(htmlName), htmlCode);
    }
}

async function buildCode(
    fileName: string,
    navData: NavData,
	header: string,
	css: string,
    allNavData: NavData[],
) {
    const markdown = await readFile(fileName);
    const contentHTML = toHTML(markdown);

    let nav = "";
	for (let i = 0; i < allNavData.length; i++) {
		const data = allNavData[i];
		const navItemString =  `<li><a href="${data.link}" class="${navData.link == data.link ? 'active' : ''}">${data.title}</a></li>\n`
		nav += navItemString;
	}

    return `
<!DOCTYPE html>
<html>
    <head>
        <title>${navData.title}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">

        <style>
			${css}
        </style>
    </head>
    <body>
        <header>
            ${header}
        </header>
			
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

// Utility
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


main();
