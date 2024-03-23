function itemTemplate(item) {
    return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
            <span class="item-text">${item.text}</span>
            <div>
                <button data-id=${item._id} class="edit-me btn btn-secondary btn-sm me-1">Edit</button>
                <button data-id=${item._id} class="delete-me btn btn-danger btn-sm">Delete</button>
            </div>
        </li>`
}

// let ourHTML = items.map((item) => {
//         return itemTemplate(item)
//     }
// ).join("")
// document.getElementById("item-list").insertAdjacentHTML("beforeend", ourHTML)

document.getElementById("form").addEventListener("submit", (e) => {
        e.preventDefault()
        let userInput = document.getElementById("input-field")
        if (userInput) {
            axios.post('/create-item', {text: userInput.value}).then((response) => {
                document.getElementById("item-list").insertAdjacentHTML("beforeend", itemTemplate(response.data))
                userInput.value = ""
                userInput.focus()
            }).catch(() => {
                    console.log("Please try again");
                }
            )
        }
    }
)

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-me")) {
        let userInput = prompt("Enter your desired new text", e.target.parentElement.parentElement.querySelector(".item-text").innerHTML)
        if (userInput) {
            axios.post('/update-item', {text: userInput, id: e.target.getAttribute("data-id")}).then(() => {
                e.target.parentElement.parentElement.querySelector(".item-text").innerText = userInput
            }).catch(() => {
                console.log("Please try again later")
            })
        }
    }

    if (e.target.classList.contains("delete-me")) {
        if (confirm("Delete this task permanently?")) {
            axios.post('/delete-item', {id: e.target.getAttribute("data-id")}).then(() => {
                e.target.parentElement.parentElement.remove()
            }).catch(() => {
                console.log("Please try again later")
            })
        }
    }
})


// Add an event listener to fetch items on page load
document.addEventListener('DOMContentLoaded', function() {
    axios.get('/get-items').then(function(response) {
        let ourHTML = response.data.map((item) => {
            return itemTemplate(item);
        }).join("");
        document.getElementById("item-list").insertAdjacentHTML("beforeend", ourHTML);
    }).catch(function(error) {
        console.log("There was an error fetching the items:", error);
    });
});