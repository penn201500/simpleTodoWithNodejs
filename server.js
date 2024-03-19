const http = require("http");

let ourApp = http.createServer((req, res) => {
    console.log(`the req url is ${req.url}`)
    if (req.url === "/") {
        res.end('hello, this is a simple node.js server')
    }
    if (req.url === "/about")
    {
        res.end('hello, this is about page')
    }

    res.end('we cannot find the page you are looking for')
})

ourApp.listen(3000)