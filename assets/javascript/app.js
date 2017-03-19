// Initial Values
var beerName = "";
var beerArray = "";
var beerID = "";
var name = "";
var style = "";
var rating = "-";
var fav = "N";
var abv = "";
var description = "";
var url = "";
var type = "";
var labels = "";
var count = "";
var rows = [""];

var myImage = "http://clubsodafortwayne.com/wp-content/uploads/2013/03/02-13-Beer-List.jpg";

// converting image to text

// Tesseract.recognize(myImage)
//     .progress(function(p) {
//         console.log('progress', p)
//     })
//     .then(function(result) {
//         console.log('result', result)
//     })


$('textarea').on('paste input', function() {
    if ($(this).outerHeight() > this.scrollHeight) {
        $(this).height(1)
    }
    while ($(this).outerHeight() < this.scrollHeight + parseFloat($(this).css("borderTopWidth")) + parseFloat($(this).css("borderBottomWidth"))) {
        $(this).height($(this).height() + 1)
    }
});


// Initialize Firebase

// var config = {
//     apiKey: "AIzaSyDdoqQmy6PZn0tlP33NvL83hClgelO1rkU",
//     authDomain: "week-8-group-project.firebaseapp.com",
//     databaseURL: "https://week-8-group-project.firebaseio.com",
//     storageBucket: "week-8-group-project.appspot.com",
//     messagingSenderId: "836948854327"
// };
// firebase.initializeApp(config);
var database = firebase.database();
// authenticate users

var provider = new firebase.auth.GoogleAuthProvider();
firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    // ...
}).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
});



// submit input box
$("#submit-btn").on("click", function(event) {
    event.preventDefault();
    // Grabbed values from text box
    beerArray = $("#name-input").val().trim().split('\n');
    ajaxCall()
});

// clear input box
$("#clear-btn").on("click", function(event) {
    $("#name-input").val("");
    $("#name-input").height('20px');
});

// ajax call
function ajaxCall() {
    // for each beer in the list
    for (var i = 0; i < beerArray.length; i++) {
        beerName = beerArray[i];
        // call the beer API
        $.ajax({
            url: "https://api.brewerydb.com/v2/search?key=6c667709753ad53866207f52c01820c8&q=" + beerName,
            cache: false,
            method: 'GET'
        }).done(function(response) {
            console.log(response);
            var data = response.data;
            // return only the first object that is a beer
            for (var i = 0; i < data.length; i++) {
                if (data[i].type == "beer") {
                    // Set variables
                    name = data[i].name;
                    style = data[i].style.shortName;
                    abv = data[i].abv;
                    description = data[i].description;
                    styleDescription = data[i].style.description;
                    labels = data[i].labels.medium;
                    beerID = data[i].id;
                    setHTML();
                    break;
                }
            }
            $("tbody").append(rows);
            rows = [""];
            console.log(name);
        });
    }
}

function setHTML() {

    // make beer row
    var row = $('<tr id="' + beerID + 'row" rating="' + rating + '">');
    row.append($('<td><button type="button" class="btn btn-xs btn-warning fav" fav="' + fav + '" id="' + beerID + '">★</button></td>'))
        .append($('<td><a href="#' + beerID + 'info" data-toggle="collapse">' + name + '</td>'))
        .append($('<td>' + style + '</td>'))
        .append($('<td><div class="btn-group"><button type="button" class="btn btn-xs btn-default selection" >' + rating + '</button><button type="button" class="btn btn-xs btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="caret"></span><span class="sr-only">Toggle Dropdown</span></button><ul class="dropdown-menu"><li><a href="#">1</a></li><li><a href="#">2</a></li><li><a href="#">3</a></li><li><a href="#">4</a></li><li><a href="#">5</a></li><li><a href="#">6</a></li><li><a href="#">7</a></li><li><a href="#">8</a></li><li><a href="#">9</a></li><li><a href="#">10</a></li></ul></div></td>'))
        .append($('<td>' + abv + '</td>'))
        .append($('<td><button type="button" class="btn btn-danger btn-xs delete" id="' + beerID + '">X</button></td>'))
    rows.push(row);
    var info = $('<tr id="' + beerID + 'info" class="collapse">');
    info.append($('<td colspan=6><div class="row"><div class="col-xs-4"><img src="' + labels + '"></div><div class="col-xs-8"><p>' + description + '<br><br>' + styleDescription + '</p></div></div></td>'))

    rows.push(info);

}

// load favorites to firebase
$(document).on("click", ".fav", favBeer);

function favBeer() {
    var favBeerRow = $(this).attr("id");
    if ($(this).attr("fav") == "Y") {
        database.ref().child(favBeerRow).remove();
        $(this).attr("fav", "N");
    } else {
        $(this).attr("fav", "Y");
        rating = $('tr[id="' + favBeerRow + 'row"]').attr("rating");
        console.log(rating);
        $.ajax({
            url: "https://api.brewerydb.com/v2/beer/" + favBeerRow + "?key=6c667709753ad53866207f52c01820c8",
            cache: false,
            method: 'GET'
        }).done(function(response) {
            console.log(response);
            var data = response.data;
            // add to firebase
            database.ref().child(favBeerRow).set({
                name: data.name,
                style: data.style.shortName,
                rating: rating,
                fav: "Y",
                abv: data.abv,
                description: data.description,
                styleDescription: data.style.description,
                labels: data.labels.medium,
                beerID: data.id
            });
            console.log(data.id);
        });
    }
}


// call favorites from firebase on refresh
callFirebase()

function callFirebase() {
    database.ref().once("value", function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var childData = childSnapshot.val();
                name = childData.name;
                style = childData.style;
                rating = childData.rating;
                fav = childData.fav;
                abv = childData.abv;
                description = childData.description;
                styleDescription = childData.styleDescription;
                labels = childData.labels;
                beerID = childData.beerID;

                setHTML();
            });
            // Change the HTML to reflect
            $("tbody").append(rows);
            rows = [""];
            fav = "N";
            rating = "-";
        },
        // Handle the errors
        function(errorObject) {
            console.log("Errors handled: " + errorObject.code);
        });
}

// set rating
$(document).on("click", ".dropdown-menu li a", ratingBtn);

function ratingBtn() {
    $(this).parents("tr").attr("rating", ($(this).text()));
    $(this).parents(".btn-group").find('.selection').text($(this).text());
    $(this).parents(".btn-group").find('.selection').val($(this).text());
}

// delete row
$(document).on("click", ".delete", removeBeer);

function removeBeer() {
    var deleteKey = $(this).attr("id");
    $('tr[id="' + deleteKey + 'row"]').remove();
    $('tr[id="' + deleteKey + 'info"]').remove();
    console.log($(this).attr("id"));
    database.ref().child(deleteKey).remove();
}

// Delete all - clear list except favorites
$("#deleteAll-btn").on("click", function(event) {
    $("tbody").empty();
    callFirebase()
});
