let webpack = require("webpack");
let colors = require('colors');
let path = require('path');
let fs = require('fs');
// let shell = require('shelljs');
let pageConfig = require('./webpack.config.page.js');
let nodeConfig = require('./webpack.config.server.js');

let watch = process.argv[2]

function callback (err, statses) {
  const manifestPath = path.join(pageConfig.output.path, './manifest.json')
  let manifest = {}

  if (fs.existsSync(manifestPath)) {
    manifest = fs.readFileSync(manifestPath, 'utf-8')
    manifest = JSON.parse(manifest)
  }
  Object.assign(manifest, {
    time: new Date(),
    hash: statses.hash
  })
  if (!manifest.files) {
    manifest.files = {}
  }

  statses.stats.forEach(stats => {
    Object.values(stats.compilation.entrypoints).forEach((entry) => {
      if (entry.name === 'vendors') return

      const urlPath = entry.name.replace(/\./g, '/')

      const files = entry.chunks.map(c => c.files)
        .reduce((prev, next) => (prev).concat(next))
        .map((file) => {
          return fixPathSlash(path.join('/', pageConfig.output.path, file))
        })

      let entryFilePathConfig = manifest.files[urlPath];
      
      if (stats.compilation.options.target === 'node') {
        if (entryFilePathConfig && entryFilePathConfig.node) {
          entryFilePathConfig.node = entryFilePathConfig.node.concat(files)
        } else if(entryFilePathConfig && !entryFilePathConfig.node){
          manifest.files[urlPath].node = files;
        } else {
          manifest.files[urlPath] = { node: files }
        }
      } else {
        if (entryFilePathConfig && entryFilePathConfig.page) {
          entryFilePathConfig.page = entryFilePathConfig.page.concat(files)
        } else if(entryFilePathConfig && !entryFilePathConfig.page) {
          manifest.files[urlPath].page = files
        } else {
          manifest.files[urlPath] = { page: files }
        }
      }
    })
  })
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  console.log(colors.green('编译完成...'))
}

function fixPathSlash (pathToFix) {
  return pathToFix.replace(/\\/g, '/')
}

let compiler = webpack([pageConfig, nodeConfig]);
if (watch) { 
  compiler.watch({}, callback)
} else {
  compiler.run(callback)
}
