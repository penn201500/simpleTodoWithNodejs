let express = require("express")
let ourApp = express()

ourApp.get('/', (req, res) => {
    res.send('hello, this is a simple node.js server'
    )
})

ourApp.get('/about', (req, res) => {
    res.end('hello, this is about page')
})

ourApp.use((req, res) => {
    res.status(404).send('we cannot find the page you are looking for')

})

ourApp.listen(3000)