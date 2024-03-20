const http = require("http");

let ourApp = http.createServer((req, res) => {
    console.log(`the req url is ${req.url}`)
    switch (req.url) {
        case "/":
            res.end('hello, this is a simple node.js server')
            break
        case "about":
            res.end('hello, this is about page')
            break;
        default:
            res.end('we cannot find the page you are looking for')
    }
})

ourApp.listen(3000)