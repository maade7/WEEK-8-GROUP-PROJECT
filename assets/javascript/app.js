//     // var authkey = "f675a8ca036d9e4f10c0cb3c5083be08";
//     // var queryURL = "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY";
//     // "http://api.brewerydb.com/v2/locations/?p=" + curr_page.toString() + "&region=Illinois&key=481d514448fd7365873ba9501d928e10&format=json";
var curr_page = 1;
var beerName = "coors";
var beerId = "avMkil";
var key = "6c667709753ad53866207f52c01820c8";
var beerNameURL = "http://api.brewerydb.com/v2/search?key=6c667709753ad53866207f52c01820c8&q=" + beerName;
// var queryURL = "https://api.brewerydb.com/v2/locations/?p=" + curr_page.toString() + "&region=Georgia&key=" + key;
var beerIdURL = "http://api.brewerydb.com/v2/beer/" + beerId + "?key=6c667709753ad53866207f52c01820c8";

$.ajax({
    url: beerIdURL,
    cache: false,
    method: 'GET'
}).done(function(response) {
    console.log(response);
});




// Initial Values

var fbKey = "";
var Name = "";
var style = "";
var isOrganic = "";
var abv = "";
var Description = "";
var Url = "";
var Type = "";
var Labels = "";
var count = "";
var rows = [""];
// var myImage = "http://clubsodafortwayne.com/wp-content/uploads/2013/03/02-13-Beer-List.jpg";
var myImage = "https://haginl1.github.io/WEEK-8-GROUP-PROJECT/assets/images/test.jpg";
// converting image to text
Tesseract.recognize(myImage)
    .progress(function(p) {
        console.log('progress', p)
    })
    .then(function(result) {
        console.log('result', result)
    })

// Initialize Firebase
var config = {
    apiKey: "AIzaSyDdoqQmy6PZn0tlP33NvL83hClgelO1rkU",
    authDomain: "week-8-group-project.firebaseapp.com",
    databaseURL: "https://week-8-group-project.firebaseio.com",
    storageBucket: "week-8-group-project.appspot.com",
    messagingSenderId: "836948854327"
};
firebase.initializeApp(config);




function setHTML() {
    // make Train array
    var row = $("<tr>").attr("data-key", fbKey);
    row.append($("<td>" + name + "</td>"))
        .append($("<td>" + style + "</td>"))
        .append($("<td>" + isOrganic + "</td>"))
        .append($("<td>" + abv + "</td>"))
        .append($('<button type="button" class="btn btn-warning btn-xs delete" id="' + fbKey + '">Delete</button>'));

    rows.push(row);
}
// setHTML();
// $("tbody").empty();
// $("tbody").append(rows);
// rows = [""];

$(document).on("click", ".delete", removeWine);

function removeWine() {
    var deleteKey = $(this).attr("id");
    // console.log($(this).attr("id"));
    database.ref().child(deleteKey).remove();

    // updateHTML();

}
