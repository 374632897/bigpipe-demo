const fs = require('fs')
const http = require('http')
const path = require('path')
const st = require('st')

const layout = fs.readFileSync('./layout.html');

const read = (moduleName) => (new Promise((resolve, reject) => {
  const filePath = path.resolve(__dirname, 'module', moduleName + '.html');
  fs.readFile(filePath, (err, data) => {
    const res = {
      moduleName,
      html: '',
    }
    if (err) {
      console.error('[ReadFileError] => %s', err)
    } else {
      res.html = data.toString();
    }
    resolve(res);
  });
}));

const mount = st({
  path: path.resolve(__dirname, 'static'),
  url: 'static/',
});

const renderScript = (sel, html) => `<script>renderToModule('${sel}', '${html}')</script>`;

const modules = ['a', 'b', 'c', 'd'];

http.createServer((req, res) => {
  if (mount(req, res)) return;
  res.writeHeader(200, {'Content-type': 'text/html'});
  res.write(layout)
  Promise.all(modules.map(item => read(item).then(({ moduleName, html }) => {
    res.write(renderScript('.' + moduleName, html.replace(/\s/g, ' ')));
  }))).then(() => {
    res.end('</body></html>');
  }).catch(console.error.bind(console, '[Promise.all Error] => '));
}).listen(4000);
