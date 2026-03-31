const https = require('https');
https.get('https://api.github.com/repos/xixiyhaha/code-life-blog/contents/content/posts', {
  headers: {
    'User-Agent': 'Mozilla/5.0',
    'Accept': 'application/vnd.github.v3+json'
  }
}, res => {
  let d = '';
  res.on('data', c => d+=c);
  res.on('end', () => require('fs').writeFileSync('D:/Desktop/博客/code-life-blog/gh_out.txt', d));
}).on('error', e => require('fs').writeFileSync('D:/Desktop/博客/code-life-blog/gh_err.txt', e.message));
