function calcDate() {
    var str = "";
    var now = new Date();
    str = now.toDateString() + " " + now.toLocaleTimeString();
    document.getElementById("dateNow").innerHTML = str;

}
setInterval(calcDate, 1000);

function validateFindForm(event) {

    let catOrDog = document.getElementById("catOrDog").value;
    let catDogBreeds = document.getElementById("catDogBreeds").value;
    let ageCategory = document.getElementById("ageCategory").value;
    let femOrMale = document.getElementById("femOrMale").value;
    let moreDogs = document.getElementById("moreDogs").checked;;
    let moreCats = document.getElementById("moreCats").checked;;
    let noPets = document.getElementById("noPets").checked;;
    let noneSel = document.getElementById("noneSel").checked;;

    if (catOrDog === "" && catDogBreeds === "" && ageCategory === "" && femOrMale === "" && (!moreDogs && !moreCats && !noPets && !noneSel)) {
        alert("All fields are blank");
        event.preventDefault();
        return false;
    }
    else if (catOrDog === "" || catDogBreeds === "" || ageCategory === "" || femOrMale === "" || (!moreDogs && !moreCats && !noPets && !noneSel)) {
        alert("Atleast one selection is left empty.");
        event.preventDefault();
        return false;
    }
    return true;

}

function validateAwayForm(event) {
    let catOrDog = document.getElementById("AcatOrDog").value;
    let catDogBreeds = document.getElementById("AcatDogBreeds").value;
    let ageCategory = document.getElementById("AageCategory").value;
    let femOrMale = document.getElementById("AfemOrMale").value;
    let moreDogs = document.getElementById("AmoreDogs").checked;
    let moreCats = document.getElementById("AmoreCats").checked;
    let noPets = document.getElementById("AnoPets").checked;
    let noChild = document.getElementById("AmoreChildren").checked;
    let none = document.getElementById("Anone").checked;
    let ownerName = document.getElementById("ownerName").value;
    let ownerEmail = document.getElementById("ownerEmail").value;

    let emailCheck = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (ownerName === "" && catOrDog === "" && catDogBreeds === "" && ageCategory === "" && femOrMale === "" && (!moreDogs && !moreCats && !noPets && !noChild && !none) && ownerEmail.trim() === "")
    {
        alert("All fields are blank.");
        event.preventDefault();
        return false;
    }
    else if (ownerEmail.trim() === "" || !emailCheck.test(ownerEmail.trim()) || ownerName === "" || catOrDog === "" || catDogBreeds === "" || ageCategory === "" || femOrMale === "" || (!moreDogs && !moreCats && !noPets && !noChild && !none)) {
        alert("Atleast one field is empty or invalid.");
        event.preventDefault();
        return false;
    }
    return true;
}

window.addEventListener('DOMContentLoaded', () => {
    fetch('header.ejs')
        .then(res => res.text())
        .then(html => {
            const headerContainer = document.getElementById('loadHeader');
            if (headerContainer) 
                headerContainer.innerHTML = html;
        });


    fetch('footer.ejs')
        .then(res => res.text())
        .then(html => {
            const footerContainer = document.getElementById('loadFooter');
            if (footerContainer) 
                footerContainer.innerHTML = html;
        });
});