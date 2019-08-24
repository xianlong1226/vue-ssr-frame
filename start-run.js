const koa = require('koa');
const serve = require('koa-static2');
// const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
// const colors = require('colors');
const serverRender = require('vue-server-renderer');
const app = new koa();
const config = require('config');

const publishPath = config.publishPath;
const renderer = serverRender.createRenderer()

app.use(serve(publishPath.replace(/\//g, ''), path.join(__dirname, publishPath)));

app.use(async ctx => {
  let url = ctx.url.substring(1);

  if (url.startsWith('favicon.ico')) {
    return
  }

  if (url.startsWith(publishPath)) {
    return
  }

  const manifestPath = path.join(__dirname, publishPath, '/manifest.json')
  let entryFilePathConfig = JSON.parse(fs.readFileSync(manifestPath, 'utf8')).files[url];

  const context = { url: '/router1' }

  let createApp, scripts = '', links = '';
  entryFilePathConfig.node.forEach(filePath => {
    if (filePath.indexOf('node') != -1 && !filePath.endsWith('map')) {
      createApp = require(filePath).default;
    }
  })
  // createApp = require('./entries/' + url + '/index.server.js').default
  entryFilePathConfig.page.forEach(filePath => {
    if (filePath.endsWith('.js')) {
      scripts += `<script type="text/javascript" src="${filePath}"></script>`
    } else if (filePath.endsWith('.css')) {
      links += `<link type="text/css" rel="stylesheet" href="${filePath}" />`
    }
  })

  let { app, title } = createApp(context)
  // createApp(context).then(app => {
    renderer.renderToString(app, (err, html) => {
      let template = fs.readFileSync('./template.html', 'utf8')
      template = template.replace('<!--TITLE-OCCUPIED -->', title)
                .replace('<!--LINK-OCCUPIED -->', links)
                .replace('<!--CONTENT-OCCUPIED -->', html)
                .replace('<!--SCRIPT-OCCUPIED -->', scripts)
      ctx.body = template;
    });
  // }).catch(err => {
  //   console.error(err.stack)
  // });
});

app.listen(3000, function(){
  console.log('server start listen 3000');

  // 开始编译代码
  require('./start-build.js').run();
});
