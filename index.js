
document.addEventListener('DOMContentLoaded', function(){

    let hotdogsURL = `http://localhost:3000/hotdogs`
    let usersURL = `http://localhost:3000/users`

    getAllHotdogs();
    hideActiveUser();

    // list of condiments to select from
    let condimentArray = ["ketchup", "mustard", "onions", "jalapenos", "cream cheese", "hot sauce", "sauteed onions", "poppy seed bun", "relish", "dill pickle spear", "tomato slices", "pickled peppers", "celery salt", "all-beef hot dog", "Beyond Sausage Chicago Dog"]

    condimentArray.forEach(condiment => {
        createCondiment(condiment)
    })

    // create each condiment 
    function createCondiment(condiment){
        let condimentDiv = document.getElementById('condiment-list')
        let newCondimentDiv = document.createElement('div')
        let selectButton = document.createElement('input')
    
        let newCondiment = document.createElement('h6')
        newCondiment.textContent = condiment
        newCondimentDiv.className = "new-condiment-div"
        selectButton.type = 'radio'
    
        newCondimentDiv.appendChild(newCondiment)
        newCondimentDiv.appendChild(selectButton)
        condimentDiv.appendChild(newCondimentDiv)
    
        selectButton.addEventListener('click', function(){
            let ul = document.getElementById('new-hotdog-creation')
            let li = document.createElement('li')
    
            li.textContent = condiment
            ul.appendChild(li)
        })
    }

    // create list of all hotdogs
    function getAllHotdogs(){
        fetch(hotdogsURL)
        .then(resp => resp.json())
        .then(json => {
            json.forEach(hotdog => {
                createHotdog(hotdog.condiment)
            })
        })
    }
    
    // get list of ingredients
    document.getElementById('create-hotdog').addEventListener('click', function(event){
        let ingredientList = event.target.parentNode.querySelectorAll('li')
        let ingredientArray = []

        ingredientList.forEach(ingredient => {
            ingredientArray.push(ingredient.innerText)
        })

        let formattedData = ingredientArray.toString();
        postHotdog(formattedData);
        clearNewHotdog();
    })

    // clear new hotdog list of ingredients
    function clearNewHotdog(){
        let ul = document.getElementById('new-hotdog-creation')
        while (ul.firstChild) {
            ul.removeChild(ul.firstChild);
          }

        let condimentDiv = document.getElementsByClassName('new-condiment-div')
        for(var i = 0; i < condimentDiv.length; i++) {
            condimentDiv[i].lastChild.checked = false;
        }
    }

    // create (POST) new hotdog
    function postHotdog(ingredients){
        fetch(hotdogsURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                condiment: ingredients,
                user_id: loggedInUserID // this doesn't work yet 
            })
        })
        // .then(resp => console.log(resp))
        .catch(resp => console.log(resp))
        addHotdog(ingredients)
    }

    // create hotdog div
    function createHotdog(hotdog){
        let div = document.getElementById('all-hotdog-list')

        let newHotdogDiv = document.createElement('div')
        let newHotdogIngredients = document.createElement('p')

        newHotdogIngredients.textContent = hotdog
        let deleteButton = document.createElement('button')
        deleteButton.textContent = " X "

        newHotdogDiv.appendChild(newHotdogIngredients)
        newHotdogDiv.appendChild(deleteButton)
        div.appendChild(newHotdogDiv)

        deleteButton.addEventListener('click', event => deleteHotdog(event, hotdog))

        return newHotdogDiv;
    }

    // delete hotdog from database & remove from DOM
    function deleteHotdog(event, hotdog){
        fetch(`http://localhost:3000/hotdogs/${hotdog.id}`, {
            method: "DELETE"
        })
        
        let div = event.target.parentNode
        while (div.firstChild) {
            div.removeChild(div.firstChild);
          }
    }

    // add hotdog to DOM
    function addHotdog(hotdog){
        const hotdog_list = document.getElementById("all-hotdog-list")
        const div = createHotdog(hotdog)
        hotdog_list.appendChild(div)
    }

    // get list of all current users
    fetch(usersURL)
    .then(resp => resp.json())
    .then(json => {
        userDropdown(json); 
    })

    // view dropdown of current users 
    function userDropdown(users){
        // let div = document.getElementById('sign-in-dropdown')
        // let dropdown = document.createElement('select')

        let firstItem = document.createElement('option')
        firstItem.textContent = "select your name"

        // div.appendChild(dropdown)
        
        let dropdown = document.getElementById('selectUser')

        dropdown.appendChild(firstItem)

        users.forEach(user => {
            let name = document.createElement('option')
            name.textContent = `${user.name} #${user.id}`
            dropdown.appendChild(name)

            // name.addEventListener('click', function(){
            //     localStorage.clear()
            //     console.log('this works')
            //     setLocalStorage(user)
            // })
        })

        // let userID = dropdown.value.split('#')[1]
        
        document.querySelector('#signin').addEventListener('click', function(event){
            event.preventDefault() 
            let userIDString = document.getElementById('selectUser').value.split('#')[1]
            let userID = parseInt(userIDString)
            let userIdObject = {id: userID}
            // let userName = document.getElementById('selectUser').value.split('#')[0].slice(0, -1)
            localStorage.clear()
            console.log('this works')
            setLocalStorage(userIdObject)
        })

    }

    // get new user info
    document.getElementById('sign-up-button').onclick = function(event){
        event.preventDefault()

        let name = document.getElementById('inpName').value 
        postUser(name) // add new user to database

        let nameField = document.getElementById('inpName') // clear input field 
        nameField.value = ""
    }

    // post new user
    function postUser(name){
        fetch(usersURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                name: name 
            })
        })
        .then(resp => resp.json())
        .then(json => {
            setLocalStorage(json)
        })
    }

    // set local storage value
    function setLocalStorage(activeUser){
        console.log(activeUser)
        // if the id of user matches the id the person logged in - setItem
        fetch(usersURL)
        .then(resp => resp.json())
        .then(json => {
            json.forEach(user => {
                if (user.id === activeUser.id) {
                    localStorage.setItem("user", [user.id, user.name]);
                    showActiveUser(user.name) // add name of logged in user
                }
            })
        })
        console.log(localStorage)
        hideSignin()
    }

    // show new user name as logged in
    function showActiveUser(userName){
        let activeUserDiv = document.getElementById('show-active-user')
        activeUserDiv.style.display = "block";

        let div = document.getElementById('signed-in-as')

        let nameField = document.createElement('p')
        let signOut = document.createElement('button')
        let deleteButton = document.createElement('button')
        
        nameField.textContent = userName
        signOut.textContent = "Sign out"
        deleteButton.textContent = "Delete my account"
        
        div.appendChild(nameField)
        div.appendChild(signOut)
        div.appendChild(deleteButton)
        
        signOut.addEventListener('click', function(){
            clearLocalStorage()
            
            let signInDiv = document.getElementById('sign-in-div')
            signInDiv.style.display = "block";
            
            let signedInDiv = document.getElementById('show-active-user')
            signedInDiv.style.display = "none"

            // remove previously signed in user
            div.removeChild(nameField)
            div.removeChild(signOut)
        })

        deleteButton.addEventListener('click', function(){
            fetch(`http://localhost:3000/users/${localStorage.getItem("user").split(",")[0]}`, {
                method: "DELETE"
            })
            alert("Your account has been deleted");
            window.location.reload()
        })
    }

    // clear local storage
    function clearLocalStorage(){
        localStorage.clear();
    }

    // hide sign in form
    function hideSignin(){
        let div = document.getElementById('sign-in-div')
        div.style.display = "none";
    }

    // hide "Currently signed in as" div
    function hideActiveUser(){
        let div = document.getElementById('show-active-user')
        div.style.display = "none";
    }

})





//*-----------STRETCH GOALS-------------*
//if user selects items for a special style of hot-dog, give yoda-fied life advice
// --> Seattle Dog, Chicago Dog, OR can you guess the Chicago Dog (or Chicago Red Hot) ingredients?
// Chicago Dog: hot dog is topped with yellow mustard, chopped white onions, bright green sweet pickle relish, a dill pickle spear, tomato slices or wedges, pickled sport peppers and a dash of celery salt;

// cannot create same hotdog twice

// separate homepage