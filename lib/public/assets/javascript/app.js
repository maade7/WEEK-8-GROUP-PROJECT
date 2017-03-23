// Initial Values
var uluru = {};
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
// sort
var sortBeers = {};
var sortBeersArray = [];


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




// authenticate user for firebase
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
    $("#userName").text(user.displayName + "'s Beer List")
    console.log(uid);
});


// call favorites from firebase
function callFirebase() {
    database.ref().child(uid).once("value", function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var childData = childSnapshot.val();
                // if (beerNames.indexOf(childData.name) === -1) {

                name = childData.name;
                if (typeof childData.style != "undefined") {
                    style = childData.style;
                } else {
                    style = "";
                }
                rating = childData.rating;
                fav = childData.fav;
                note = childData.note;
                uluru = childData.uluru;

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
                $('tbody').append(rows);
                initMap();
                // }
            });
        },
        // Handle the errors
        function(errorObject) {
            console.log("Errors handled: " + errorObject.code);
        });
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
    ajaxCall();
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
            $('tbody').append(rows);

            rows = [""];
            console.log(name + i);
        });
    }
}



function setHTML() {

    // make beer row

    var row = $('<tr id="' + beerID + 'row" rating="' + rating + '">');
    row.append($('<td><button type="button" class="btn btn-xs btn-warning fav" fav="' + fav + '" id="' + beerID + '">★</button></td>'))
        .append($('<td><a href="#' + beerID + 'collapse" data-parent="#accordion" data-toggle="collapse" class="accordion-toggle" data-name="' + beerID + '">' + name + '</td>'))
        .append($('<td>' + style + '</td>'))
        .append($('<td><div class="btn-group"><button type="button" class="btn btn-xs btn-default selection" data-name="' + beerID + '">' + rating + '</button><button type="button" class="btn btn-xs btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="caret"></span><span class="sr-only">Toggle Dropdown</span></button><ul class="dropdown-menu"><li><a>1</a></li><li><a>2</a></li><li><a>3</a></li><li><a >4</a></li><li><a>5</a></li><li><a>6</a></li><li><a>7</a></li><li><a>8</a></li><li><a>9</a></li><li><a>10</a></li></ul></div></td>'))
        .append($('<td>' + abv + '</td>'))
        .append($('<td><button type="button" class="btn btn-danger btn-xs delete" data-name="' + name + '" id="' + beerID + '">X</button></td>'))
    beerNames.push(name)
    rows.push(row);
    var info = $('<tr id="' + beerID + 'info">');
    info.append($('<td class="tdInfo"colspan=6><div id="' + beerID + 'collapse" class="row panel-collapse collapse"><div class="col-xs-4"><img src="' + labels + '">  <div id="' + beerID + 'map" class="map"></div> </div><div class="col-xs-8"><p>' + description + '<br><br>' + styleDescription + '</p><textarea class="form-control" id="' + beerID + 'note">' + note + '</textarea></div></div></td>'))

    rows.push(info);
    sortBeers = {
        name: name,
        style: style,
        rating: rating,
        fav: fav,
        note: note,
        abv: abv,
        description: description,
        styleDescription: styleDescription,
        labels: labels,
        beerID: beerID,
        uluru: uluru
    }
    sortBeersArray.push(sortBeers);
    console.log(sortBeersArray);
}

// locate user
function initMap() {
    if (document.getElementById(beerID + 'map')) {


        console.log("map= " + beerID);
        var map = new google.maps.Map(document.getElementById(beerID + 'map'), {
            zoom: 12,
            zoomControl: false,
            scrollwheel: false,
            disableDoubleClickZoom: true,
            center: uluru
        });
        var marker = new google.maps.Marker({
            position: uluru,
            map: map
        });
    }
}
getLocation();

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    uluru = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };
    lat = position.coords.latitude;
    lng = position.coords.longitude;
}

// refresh map
$(document).on("click", ".accordion-toggle", refreshMap);

function refreshMap() {

    beerID = $(this).attr('data-name');
    var result = $.grep(sortBeersArray, function(e) {
        return e.id == beerID;
        result[0].uluru;
    });
    console.log(result);
    var map = (document.getElementById(beerID + 'map'));

    google.maps.event.trigger(map, "resize");

}


// load favorites to firebase
$(document).on("click", ".fav", favBeerCheck);

function favBeerCheck() {
    beerID = $(this).attr("id");
    if ($(this).attr("fav") == "Y") {
        database.ref().child(uid + '/' + beerID).remove();
        $(this).attr("fav", "N");
    } else {
        $(this).attr("fav", "Y");
        favBeer(beerID);
    }
}

function favBeer(beerID) {
    rating = $('tr[id="' + beerID + 'row"]').attr("rating");
    note = $('#' + beerID + 'note').val();
    $('#' + beerID).attr("fav", "Y");
    console.log(rating);
    $.ajax({
        url: "/api/brewerydb/v2/beer/" + beerID + "?key=6c667709753ad53866207f52c01820c8",
        cache: false,
        method: 'GET'
    }).done(function(response) {
        console.log(response);
        var data = response.data;
        // add to firebase
        database.ref().child(uid + '/' + beerID).set({
            name: data.name,
            style: data.style.shortName,
            rating: rating,
            fav: "Y",
            note: note,
            abv: data.abv,
            description: data.description,
            styleDescription: data.style.description,
            labels: data.labels.medium,
            beerID: data.id,
            uluru: uluru

        });
        console.log(data.id);
    });
}




// set rating
$(document).on("click", ".dropdown-menu li a", ratingBtn);

function ratingBtn() {
    $(this).parents("tr").attr("rating", ($(this).text()));
    $(this).parents(".btn-group").find('.selection').text($(this).text());
    $(this).parents(".btn-group").find('.selection').val($(this).text());
    beerID = $(this).parents(".btn-group").find('.selection').attr('data-name');
    console.log(beerID);
    favBeer(beerID);
}

// delete row
$(document).on("click", ".delete", removeBeer);

function removeBeer() {
    var deleteKey = $(this).attr("id");
    $('tr[id="' + deleteKey + 'row"]').remove();
    $('tr[id="' + deleteKey + 'info"]').remove();
    console.log($(this).attr("id"));
    database.ref().child(uid + '/' + deleteKey).remove();
    var index = beerNames.indexOf($(this).attr("data-name"));
    if (index > -1) {
        beerNames.splice(index, 1);
    }
    sortBeersArray = sortBeersArray.filter(function(el) {
        return el.name !== deleteKey;
        console.log("left" + sortBeersArray);
    });
}

// Delete all - clear list except favorites
$("#deleteAll-btn").on("click", function(event) {
    $("tbody").empty();
    sortBeersArray = [];
    beerNames = [];
    callFirebase($(this).attr("data-name"));
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
