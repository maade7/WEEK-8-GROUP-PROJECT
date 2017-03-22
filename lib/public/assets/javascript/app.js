// Initial Values
var beerName = "";
var beerArray = "";
var beerID = "";
var name = "";
var beerNames = [];
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
var progress = "0%";
// user info
var displayName = "";
var email = "";
var emailVerified = "";
var photoURL = "";
var uid = "";
var providerData = "";


// click hidden image import button
$("#photo-btn").on("click", function() {
    $("#myFileInput").trigger("click");
});

// Tesseract convert image to text

$(".progress").hide();

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e) {
            // $('#blah').attr('src', e.target.result);
            // console.log(e.target.result);
            Tesseract.recognize(e.target.result)
                .progress(function(p) {
                    console.log('progress', p)
                    progress = (p.progress * 100);
                    $(".progress").show();
                    $("#progress").attr("style", "width:" + progress + "%");
                    $("#progress").text(Math.floor(progress) + "%");
                    console.log(progress);
                })
                .then(function(result) {
                    console.log('result', result);
                    $("#name-input").val(result.text);
                    $(".progress").hide();
                    $('#name-input').trigger('input');
                })
        }
        reader.readAsDataURL(input.files[0]);
    }
}
$("#myFileInput").change(function() {
    readURL(this);

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




// clear input box
$("#clear-btn").on("click", function(event) {
    $("#name-input").val("");
    $("#name-input").height('20px');
});





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
                    if (typeof childData.style != "undefined") {
                        style = childData.style;
                    } else {
                        style = "";
                    }
                    rating = childData.rating;
                    fav = childData.fav;
                    note = childData.note;
                    if (typeof childData.abv != "undefined") {
                        abv = childData.abv;
                    } else {
                        abv = "";
                    }
                    if (typeof childData.description != "undefined") {
                        description = childData.description;
                    } else {
                        description = "";
                    }
                    if (typeof childData.styleDescription != "undefined") {
                        styleDescription = childData.styleDescription;
                    } else {
                        styleDescription = "";
                    }
                    if (typeof childData.labels != "undefined") {
                        labels = childData.labels;
                    } else {
                        labels = "../images/beer-background.jpg";
                    }
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


// ajax call
function ajaxCall() {
    // for each beer in the list
    for (var i = 0; i < beerArray.length; i++) {
        beerName = beerArray[i];
        // call the beer API
        $.ajax({
            url: "/api/brewerydb/v2/search?key=6c667709753ad53866207f52c01820c8&q=" + beerName,
            cache: false,
            method: 'GET'
        }).done(function(response) {
            console.log(response);
            var data = response.data;
            // return only the first object that is a beer
            for (var i = 0; i < data.length; i++) {
                if (data[i].type == "beer") {
                    // Set variables
                    // debugger
                    if (beerNames.indexOf(data[i].name) != -1) {
                        break;
                    }
                    name = data[i].name;
                    if (typeof data[i].style.shortName != "undefined") {
                        style = data[i].style.shortName;
                    } else {
                        style = "";
                    }
                    if (typeof data[i].abv != "undefined") {
                        abv = data[i].abv;
                    } else {
                        abv = "";
                    }
                    if (typeof data[i].description != "undefined") {
                        description = data[i].description;
                    } else {
                        description = "";
                    }
                    styleDescription = data[i].style.description;
                    if (typeof data[i].labels.medium != "undefined") {
                        labels = data[i].labels.medium;
                    } else {
                        labels = "../images/beer-background.jpg";
                    }
                    beerID = data[i].id;
                    setHTML();
                    break;
                }
            }
            $("tbody").append(rows);
            rows = [""];
            console.log(name + i);
        });
    }
}

function setHTML() {

    // make beer row
    var row = $('<tr id="' + beerID + 'row" rating="' + rating + '">');
    row.append($('<td><button type="button" class="btn btn-xs btn-warning fav" fav="' + fav + '" id="' + beerID + '">★</button></td>'))
        .append($('<td><a href="#' + beerID + 'info" data-parent="#accordion" data-toggle="collapse">' + name + '</td>'))
        .append($('<td>' + style + '</td>'))
        .append($('<td><div class="btn-group"><button type="button" class="btn btn-xs btn-default selection" >' + rating + '</button><button type="button" class="btn btn-xs btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="caret"></span><span class="sr-only">Toggle Dropdown</span></button><ul class="dropdown-menu"><li><a href="#">1</a></li><li><a href="#">2</a></li><li><a href="#">3</a></li><li><a href="#">4</a></li><li><a href="#">5</a></li><li><a href="#">6</a></li><li><a href="#">7</a></li><li><a href="#">8</a></li><li><a href="#">9</a></li><li><a href="#">10</a></li></ul></div></td>'))
        .append($('<td>' + abv + '</td>'))
        .append($('<td><button type="button" class="btn btn-danger btn-xs delete" id="' + beerID + '">X</button></td>'))
    beerNames.push(name)
    rows.push(row);
    var info = $('<tr id="' + beerID + 'info" class="panel-collapse collapse">');
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
            url: "/api/brewerydb/v2/beer/" + favBeerRow + "?key=6c667709753ad53866207f52c01820c8",
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




// sorting
var sorted;

function sortBeer() {
    myBeers.sort(function(a, b) {
        if (sorted !== "asc") {
            return a.name > b.name;
        } else {
            return b.name > a.name;
        }
    });
    if (sorted !== "asc") {
        sorted = "asc";
    } else {
        sorted = "desc";
    }
    setHTML();
}

function sortStyle() {
    myBeers.sort(function(a, b) {
        if (sorted !== "asc") {
            return a.style > b.style;
        } else {
            return b.style > a.style;
        }
    });
    if (sorted !== "asc") {
        sorted = "asc";
    } else {
        sorted = "desc";
    }
    setHTML();
}

function sortRating() {
    myBeers.sort(function(a, b) {
        if (sorted !== "asc") {
            return a.isOrganic > b.isOrganic;
        } else {
            return b.isOrganic > a.isOrganic;
        }
    });
    if (sorted !== "asc") {
        sorted = "asc";
    } else {
        sorted = "desc";
    }
    setHTML();
}

function sortAlcohol() {
    myBeers.sort(function(a, b) {
        if (sorted !== "asc") {
            return a.abv > b.abv;
        } else {
            return b.abv > a.abv;
        }
    });
    if (sorted !== "asc") {
        sorted = "asc";
    } else {
        sorted = "desc";
    }
    setHTML();
}
