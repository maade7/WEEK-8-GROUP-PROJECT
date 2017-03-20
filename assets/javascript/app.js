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
var note = "";
var url = "";
var type = "";
var labels = "";
var count = "";
var rows = [""];
var myImage = "http://clubsodafortwayne.com/wp-content/uploads/2013/03/02-13-Beer-List.jpg";
// user info
var displayName = "";
var email = "";
var emailVerified = "";
var photoURL = "";
var uid = "";
var providerData = "";




// converting image to text

(function() {
    var canvas = document.getElementById("dropMy-canvas"),
        context = canvas.getContext("2d"),
        img = document.createElement("img"),
        mouseDown = false,
        brushColor = "rgb(0, 0, 0)",
        hasText = true,
        clearCanvas = function() {
            if (hasText) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                hasText = false;
            }
        };

    // Adding instructions
    context.fillText("Drop an image onto the canvas", 250, 100);

    // Image for loading
    img.addEventListener("load", function() {
        clearCanvas();
        context.drawImage(img, 0, 0);
    }, false);

    // To enable drag and drop
    canvas.addEventListener("dragover", function(evt) {
        evt.preventDefault();
    }, false);

    // Handle dropped image file - only Firefox and Google Chrome
    canvas.addEventListener("drop", function(evt) {
        var files = evt.dataTransfer.files;
        if (files.length > 0) {
            var file = files[0];
            if (typeof FileReader !== "undefined" && file.type.indexOf("image") != -1) {
                var reader = new FileReader();
                // Note: addEventListener doesn't work in Google Chrome for this event
                reader.onload = function(evt) {
                    img.src = evt.target.result;
                };
                reader.readAsDataURL(file);
            }
        }
        evt.preventDefault();
    }, false);


    var language = 'eng'
    document.body.addEventListener('drop', function(e) {
        e.stopPropagation();
        e.preventDefault();
        var file = e.dataTransfer.files[0]
        var reader = new FileReader();

        Tesseract.recognize(file, language)
            .progress(function(p) {
                console.log('progress', p)
            })
            .then(function(result) {
                console.log('result', result)
            })
        reader.onload = function(e) {
            img.src = e.target.result;
            img.onload = function() {

            }
        }
        reader.readAsDataURL(file);
    })
})();
//convert image to text//


// CORS request
// $.get(url: 'https://api.brewerydb.com/v2').done successFn;




var database = firebase.database();
var user = firebase.auth().currentUser;

firebase.auth().onAuthStateChanged((user) => {
    if (user) {

        displayName = user.displayName;
        email = user.email;
        emailVerified = user.emailVerified;
        photoURL = user.photoURL;
        uid = user.uid;
        providerData = user.providerData;


        // call favorites from firebase on refresh
        callFirebase()
    }

    function callFirebase() {
        database.ref().child(uid).once("value", function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    var childData = childSnapshot.val();
                    name = childData.name;
                    style = childData.style;
                    rating = childData.rating;
                    fav = childData.fav;
                    note = childData.note;
                    abv = childData.abv;
                    description = childData.description;
                    styleDescription = childData.styleDescription;
                    labels = childData.labels;
                    beerID = childData.beerID;

                    setHTML();
                    // Change the HTML to reflect
                    $("tbody").append(rows);

                });
            },
            // Handle the errors
            function(errorObject) {
                console.log("Errors handled: " + errorObject.code);
            });
    }
    $("#userName").text(user.displayName + "'s Beer List")
    console.log(uid);
});


// resize textarea
$(document).on("paste input", ".form-control", resizeTextarea);

function resizeTextarea() {
    if ($(this).outerHeight() > this.scrollHeight) {
        $(this).height(1)
    }
    while ($(this).outerHeight() < this.scrollHeight + parseFloat($(this).css("borderTopWidth")) + parseFloat($(this).css("borderBottomWidth"))) {
        $(this).height($(this).height() + 1)
    }
}


// submit input box
$("#submit-btn").on("click", function(event) {
    event.preventDefault();
    rows = [""];
    fav = "N";
    rating = "-";
    note = "";
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
    info.append($('<td colspan=6><div class="row"><div class="col-xs-4"><img src="' + labels + '"></div><div class="col-xs-8"><p>' + description + '<br><br>' + styleDescription + '</p><textarea class="form-control" id="' + beerID + 'note">' + note + '</textarea></div></div></td>'))

    rows.push(info);

}

// load favorites to firebase
$(document).on("click", ".fav", favBeer);

function favBeer() {
    var favBeerRow = $(this).attr("id");
    if ($(this).attr("fav") == "Y") {
        database.ref().child(uid + '/' + favBeerRow).remove();
        $(this).attr("fav", "N");
    } else {
        $(this).attr("fav", "Y");
        rating = $('tr[id="' + favBeerRow + 'row"]').attr("rating");
        note = $('#' + favBeerRow + 'note').val();
        console.log(rating);
        $.ajax({
            url: "https://api.brewerydb.com/v2/beer/" + favBeerRow + "?key=6c667709753ad53866207f52c01820c8",
            cache: false,
            method: 'GET'
        }).done(function(response) {
            console.log(response);
            var data = response.data;
            // add to firebase
            database.ref().child(uid + '/' + favBeerRow).set({
                name: data.name,
                style: data.style.shortName,
                rating: rating,
                fav: "Y",
                note: note,
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

// master function ***
