const http = require("http");
const fs = require('fs');

http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    // response.end('Hello World\n'); // 返回 response
    getIndex(res);  // 返回 index.html
}).listen(8523); // 指定监听端口

function getIndex(res) {
    fs.readFile('index.html', (err, data) => {
        if (err) return hadErr(err, res);
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(data.toString());
    })
}

console.log('Server running at http://127.0.0.1:8523');
