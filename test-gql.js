
const { Octokit } = require('octokit');
const fs = require('fs');
const dotenv = require('dotenv');
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const octokit = new Octokit({ auth: envConfig.GITHUB_PAT });
const q = 'query { repository(owner: \x22xixiyhaha\x22, name: \x22code-life-blog\x22) { discussionCategories(first: 10) { nodes { id name slug } } } }';
octokit.graphql(q).then(res => console.log(JSON.stringify(res, null, 2))).catch(console.error);

