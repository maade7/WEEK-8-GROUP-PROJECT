// Initial Values
var beerName = "";
var beerArray = "";
var beerID = "";
var key = "";
var name = "";
var style = "";
var isOrganic = "";
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

// Initialize Firebase
var config = {
    apiKey: "AIzaSyDdoqQmy6PZn0tlP33NvL83hClgelO1rkU",
    authDomain: "week-8-group-project.firebaseapp.com",
    databaseURL: "https://week-8-group-project.firebaseio.com",
    storageBucket: "week-8-group-project.appspot.com",
    messagingSenderId: "836948854327"
};
firebase.initializeApp(config);


// Capture Button Click
$("#submit-btn").on("click", function(event) {
    event.preventDefault();
    // Grabbed values from text box
    beerArray = $("#name-input").val().trim().split('\n');
    // clear values from text boxes
    // $("#name-input").val("");
    ajaxCall()
});

// //enter key
// $("#inputField").keyup(function(event) {
//     if (event.keyCode == 13) {
//         $("#submit-btn").click();
//     }
// });

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
                    isOrganic = data[i].isOrganic;
                    abv = data[i].abv;
                    description = data[i].description;
                    styleDescription = data[i].style.description;
                    labels = data[i].labels.icon;
                    beerID = data[i].id;
                    setHTML();
                    break;
                }
            }
            // $("tbody").empty();
            $("tbody").append(rows);
            rows = [""];
            console.log(name);
        });
    }
}

function setHTML() {
    // make beer row
    var row = $('<tr id="' + beerID + 'row" >').attr("data-key", key);
    row.append($('<td><button type="button" class="btn btn-xs btn-success fav" id="' + beerID + '">★</button></td>'))
        .append($('<td><a href="#' + beerID + 'info" data-toggle="collapse">' + name + '</td>'))
        .append($("<td>" + style + "</td>"))
        .append($("<td>" + isOrganic + "</td>"))
        .append($("<td>" + abv + "</td>"))
        .append($('<td><button type="button" class="btn btn-warning btn-xs delete" id="' + beerID + '">X</button></td>'))
    rows.push(row);
    var info = $('<tr id="' + beerID + 'info" class="collapse">').attr("data-key", key);
    info.append($('<td colspan=1><img src="' + labels + '"</td>'))
        .append($('<td colspan=6><p>' + description + '<br><br>' + styleDescription + '</p></td>'))
    rows.push(info);

}

$(document).on("click", ".fav", favBeer);

function favBeer() {
    var favBeerRow = $(this).attr("id");
    // add to firebase
    database.ref().push({
        favBeerRow: $('tr[data-key="' + favBeerRow + '"]')
    });
}

$(document).on("click", ".delete", removeBeer);

function removeBeer() {
    var deleteKey = $(this).attr("id");
    $('tr[data-key="' + deleteKey + '"]').remove();
    console.log($(this).attr("id"));
    // database.ref().child(deleteKey).remove();
}
