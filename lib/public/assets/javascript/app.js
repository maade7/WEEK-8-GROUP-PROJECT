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

var myBeers = [];

function addBeer(beer) {
    myBeers.push({
        name: beer.name,
        style: beer.style.shortName,
        isOrganic: beer.isOrganic,
        abv: beer.abv,
        description: beer.description,
        styleDescription: beer.styleDescription,
        // labels: beer.labels.icon,
        labels: "http://placehold.it/20x20",
        beerID: beer.id

    })

}

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
                    addBeer(data[i]);
                    break;
                }
            }
            setHTML();
            console.log(name);
        });
    }
}

function setHTML() {
    // make beer row
    var rows = [];
    for (var i = 0; i < myBeers.length; i++) {
        var beer = myBeers[i];
        var row = $('<tr id="' + beer.beerID + 'row" rating="' + rating + '" >');
        row.append($('<td><button type="button" class="btn btn-xs btn-success fav" id="' + beer.beerID + '">★</button></td>'))
            .append($('<td><a href="#' + beer.beerID + 'info" data-toggle="collapse">' + beer.name + '</td>'))
            .append($("<td>" + beer.style + "</td>"))
            .append($('<td><div class="btn-group"><button type="button" class="btn btn-xs btn-default selection" >' + rating + '</button><button type="button" class="btn btn-xs btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="caret"></span><span class="sr-only">Toggle Dropdown</span></button><ul class="dropdown-menu"><li><a href="#">1</a></li><li><a href="#">2</a></li><li><a href="#">3</a></li><li><a href="#">4</a></li><li><a href="#">5</a></li><li><a href="#">6</a></li><li><a href="#">7</a></li><li><a href="#">8</a></li><li><a href="#">9</a></li><li><a href="#">10</a></li></ul></div></td>'))
            .append($("<td>" + beer.abv + "</td>"))
            .append($('<td><button type="button" class="btn btn-warning btn-xs delete" id="' + beer.beerID + '">X</button></td>'))
        rows.push(row);
        var info = $('<tr id="' + beer.beerID + 'info" class="collapse">')
        info.append($('<td colspan=1><img src="' + beer.labels + '"</td>'))
            .append($('<td colspan=6><p>' + beer.description + '<br><br>' + beer.styleDescription + '</p></td>'))
        rows.push(info);
    }

    $("tbody").html(rows);

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

    var sortedBeer, sortedABV, sortedStyle, sortedRating; 

    function sortBeer() {
        myBeers.sort(function(a, b) {
            if (sortedBeer !== "asc") {
                return a.name > b.name;
            } else {
                return b.name > a.name;
            }
        });
        if (sortedBeer !== "asc") {
            sortedBeer = "asc";
        } else {
            sortedBeer = "desc";
        }
        setHTML();
    }

    function sortStyle() {
        myBeers.sort(function(a, b) {
            if (sortedStyle !== "asc") {
                return a.style > b.style;
            } else {
                return b.style > a.style;
            }
        });
        if (sortedStyle !== "asc") {
            sortedStyle = "asc";
        } else {
            sortedStyle = "desc";
        }
        setHTML();
    }

    function sortRating() {
        myBeers.sort(function(a, b) {
            if (sortedRating !== "asc") {
                return a.isOrganic > b.isOrganic;
            } else {
                return b.isOrganic > a.isOrganic;
            }
        });
        if (sortedRating !== "asc") {
            sortedRating = "asc";
        } else {
            sortedRating = "desc";
        }
        setHTML();
    }

    function sortAlcohol() {
        myBeers.sort(function(a, b) {
            if (sortedABV !== "asc") {
                return a.abv > b.abv;
            } else {
                return b.abv > a.abv;
            }
        });
        if (sortedABV !== "asc") {
            sortedABV = "asc";
        } else {
            sortedABV = "desc";
        }
        setHTML();
    }
