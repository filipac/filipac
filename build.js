const fs = require("fs");
const Parser = require("rss-parser");
const fetch = require("node-fetch");
const parser = new Parser();

const blogPostLimit = 10;
const websiteUrl = "https://pacurar.dev";
const feedUrl = `${websiteUrl}/feed`;

async function loadBlogPosts() {
    const feed = await parser.parseURL(feedUrl);

    let links = "";

    feed.items.slice(0, blogPostLimit).forEach((item, idx) => {
        const nl = idx === blogPostLimit - 1 ? "" : "\n";
        links += `<li><a href=${item.link}>${item.title}</a></li>${nl}`;
    });

    return `
<ul>
${links}
</ul>\n
[📑 ➡️ More blog posts](${websiteUrl}/blog)`;
}

async function getBoardGames() {
    const results = await fetch(`${websiteUrl}/wp-json/filipac/v1/board-games`, {
        agent: new (require("https").Agent)({
            rejectUnauthorized: false,
        }),
    });
    const data = await results.json();

    let string = "";

    for (const game of data) {
        const name = game?.metadata?.description || game?.name;
        const link = `https://xspotlight.com/nfts/${game.identifier}`;

        string += `<li><a href="${link}">${name}</a></li>`;
    }


    let finalstring = `<ul>
${string}
</ul>`

    return finalstring;
}

async function getMyWork() {
    const results = await fetch(`${websiteUrl}/wp-json/filipac/v1/work`, {
        agent: new (require("https").Agent)({
            rejectUnauthorized: false,
        }),
    });
    const data = await results.json();

    let string = `<table style="width:100%; border-collapse: collapse; border: none;" border="0"><tr>`;

    // maximum two columns
    let column = 0;

    for (const work of data) {
        if (!work.categories) {
            continue;
        }

        if (column === 2) {
            string += `</tr><tr>`;
            column = 0;
        }

        string += `<td>
#### ${work.title}
##### ${work.categories}
<img src="${work.image}" style="width: 100%; height: auto;" />
</td>`;
        column++;
    }

    string += `</tr></table>`;

    return string;

}

async function build() {
    let posts = ''; //await loadBlogPosts();
    let boardGames = await getBoardGames();
    let myWork = await getMyWork();
    let md = `![Filip Pacurar](https://raw.githubusercontent.com/filipac/filipac/main/top.svg)

<p align="center">
<img src="https://raw.githubusercontent.com/filipac/filipac/main/logo.png" alt="My logo" width="300"/>
</p>

### Hi there 👋

#### Latest blog posts
${posts}

#### Buy me a coffee
On my blog (both Romanian or English versions) you can find sections where you can pay with USDc or USDt on the MultiversX blockchain and in return you get that space for 10 days to advertise whatever you want.
If you like my work, please consider buying me a coffee by buying an ad space. Thank you!

#### About me

🧑‍💻 My name is Filip Pacurar, web developer for over 10 years.
📆 I started my first programming job in 2012, but I knew PHP, MySQL, HTML, CSS long before this.

👷‍♂️ At 12 years old I forked a torrent tracker PHP script to make it suit my needs, in fact it is still around here on Github and on Sourceforge.

🚧 I currently work daily with these technologies:

- PHP
- MySQL
- PostgreSQL
- CSS [TailwindCSS]
- A lot of JavaScript - React, Vue.JS, AureliaJS, AdonisJS.. a lot of frameworks and vanilla JS
- Some Python and Ruby for hobby projects
- Bash
- VILT stack
- A lot of Laravel

🛑 I am going to stop now because I tend to use whatever is necesary, not limiting myself to a single technology.

🕸️ You can [read more about me and my work on my blog](https://pacurar.dev).

BTW, my website is very weird and I also have hidden things and easter eggs.

#### Portfolio / some of my work
Most of my projects are under some terms though and I cannot publicly share them because they belong 100% to the client. I can however give you an idea of what I've built those past 3 years:


<li>Two intranet portals for an international business company</li>
<li>National web app for online prescriptions and medication delivery</li>
<li>International platform to connect to experts in various categories like motivation, sleep, lifestyle, nutrition or pregnancy</li>
<li>Website for a national olympic team</li>
<li>Advanced app for marketing leads collection</li>
<li>Online courses marketplace</li>
<li>Web app to see information about movies</li>
<li>Dozens or tens of medium sized websites. Actually, I've looked at all repositories I still have access to and since 2018 I've built 55 websites. That's 1 and a half per month. Sure, not all of them were only my job, I've had help, but I touched at least 55 websites since 2018. That's something, isn't it?</li>
<li>Private social media for a niche category</li>
<li>Backend for an international singer</li>

Those are just a few examples of things that kept me busy since 2018, all done as contractor.

If you want to see more of my work in private, send me an email to filip@pacurar.dev and we'll chat more about your digital needs too.

Enough chit-chat! Let me show you a subset of my portofolio now. You can also filter those projects by the technologies used.

${myWork}

#### Board game geek

I like playing board games with my wife, friends and lately with my sons. Here's all the board games that I own. You can find those on my blog as well [here](https://pacurar.dev/board-games).

${boardGames}

#### Finale

Thank you for visiting my Github profile. That would be all for now.

👋

![Filip Pacurar](https://raw.githubusercontent.com/filipac/filipac/main/bottom.svg)
`
    fs.writeFile("README.md", md, function (err) {
        if (err) return console.log(err);
    });

    return md;
}

build();
