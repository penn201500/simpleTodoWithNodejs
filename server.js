let express = require("express")
let path = require('path')
let ourApp = express()

ourApp.use(express.urlencoded({extended: false}))

ourApp.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'todo.html'))
})

ourApp.get('/about', (req, res) => {
    res.end('hello, this is about page')
})

ourApp.post('/createItem', (req, res) => {
        let itemValue = req.body.item;
        console.log(console.log('itemValue: ', itemValue))

        res.send(`
        <li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
            <span class="item-text">${itemValue}</span>
            <div>
                <button class="edit-me btn btn-secondary btn-sm me-1">Edit</button>
                <button class="delete-me btn btn-danger btn-sm">Delete</button>
            </div>
        </li>
        `)
    }
)

ourApp.use((req, res) => {
    res.status(404).send('we cannot find the page you are looking for')

})

ourApp.listen(3000)