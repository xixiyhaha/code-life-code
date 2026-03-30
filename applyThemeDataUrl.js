const fs = require('fs');

const css = `
/* 隐藏输入/预览Tab导航 */
.tabnav { display: none !important; }

/* 隐藏加粗、斜体等排版工具栏 */
.markdown-toolbar { display: none !important; }

/* 隐藏底部 "支持Markdown" 等提示文字 */
.color-fg-muted.text-12, a.markdown-supported { display: none !important; }

/* 整理按钮区域，只保留评论按钮在右下角 */
.form-actions { 
    padding: 0 !important;
    margin-top: 8px !important;
    background: transparent !important; 
    border: none !important;
    display: flex !important;
    justify-content: flex-end !important;
}

/* 隐藏表单底部的其他无用边框和占位 */
.comment-box { 
    border: none !important; 
    background: transparent !important; 
}

/* 核心输入框样式（类似B站） */
textarea.form-control {
    min-height: 48px !important;
    height: 52px !important;
    padding: 10px 14px !important;
    background-color: #f4f5f7 !important; /* 浅色模式下的浅灰背景 */
    border: 1px solid transparent !important;
    border-radius: 6px !important;
    box-shadow: none !important;
    resize: none !important;
    font-size: 14px !important;
    color: inherit !important;
}

/* 输入框聚焦时的状态（激活主题色边框） */
textarea.form-control:focus {
    background-color: #ffffff !important;
    border: 1px solid #00aeec !important; /* B站蓝/可以换成粉 */
}

/* 发送按钮样式 */
.btn-primary, button[type="submit"] {
    background-color: #00aeec !important;
    color: white !important;
    border: none !important;
    border-radius: 6px !important;
    padding: 6px 16px !important;
    font-size: 14px !important;
}
.btn-primary:hover, button[type="submit"]:hover {
    background-color: #0098ce !important;
}

/* 去除多余的阴影和边框层级 */
.timeline-comment, .timeline-comment-header, .timeline-comment-group { 
    border: none !important; 
    background: transparent !important; 
}
.timeline-comment::before, .timeline-comment::after { display: none !important; }

/* 暗黑模式下输入框主动变暗 */
@media (prefers-color-scheme: dark) {
    textarea.form-control {
        background-color: #2b2d31 !important;
        color: #d7d8d9 !important;
    }
    textarea.form-control:focus {
        background-color: #232426 !important;
        border: 1px solid #00aeec !important;
    }
}
`;

const b64 = Buffer.from(css).toString('base64');
const themeUrl = 'data:text/css;base64,' + b64;

const file = 'D:/Desktop/博客/code-life-blog/components/GiscusComments.tsx';
let c = fs.readFileSync(file, 'utf8');
// 将原来的 setTheme 替换为新的 base64 数据流
c = c.replace(/setTheme\([^)]+\);/g, 'setTheme("' + themeUrl + '");');
fs.writeFileSync(file, c);
console.log("注入Giscus自定义CSS成功");
