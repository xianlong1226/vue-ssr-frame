const koa = require('koa');
const serve = require('koa-static2');
const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const colors = require('colors');
const serverRender = require('vue-server-renderer');
const app = new koa();

const renderer = require('vue-server-renderer').createRenderer()

app.use(serve('dist', __dirname + '/dist'));

app.use(async ctx => {
  let url = ctx.url.substring(1);

  if (url.startsWith('favicon.ico')) {
    return
  }

  if (url.startsWith('dist')) {
    return
  }

  const manifestPath = path.join(__dirname, 'dist/manifest.json')
  let entryFilePathConfig = require(manifestPath).files[url];

  let app, scripts = '', links = '';
  entryFilePathConfig.node.forEach(filePath => {
    if (filePath.indexOf('node') != -1 && !filePath.endsWith('map')) {
      app = require(filePath).default();
    }
  })
  entryFilePathConfig.page.forEach(filePath => {
    if (filePath.endsWith('.js')) {
      scripts += `<script type="text/javascript" src="${filePath.replace(__dirname, '')}"></script>`
    } else if (filePath.endsWith('.css')) {
      links += `<link type="text/css" rel="stylesheet" href="${filePath.replace(__dirname, '')}" />`
    }
  })

  renderer.renderToString(app, (err, html) => {
    let template = fs.readFileSync('./template.html', 'utf8')
    template = template.replace('<!--LINK-OCCUPIED -->', links)
               .replace('<!--CONTENT-OCCUPIED -->', html)
               .replace('<!--SCRIPT-OCCUPIED -->', scripts)
    ctx.body = template;
  });
});

app.listen(3000, function(){
  console.log('server start listen 3000')
});

// 开始编译代码
console.log(colors.green('开始编译...'))
shell.rm('-rf', path.join(__dirname, 'dist'));
require('./start-build.js');
