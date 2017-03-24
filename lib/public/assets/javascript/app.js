// Initial Values
// var map = "";
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
var newSortedBeers = [];


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
                    // console.log('progress', p)
                    progress = (p.progress * 100);
                    $(".progress").show();
                    $("#progress").attr("style", "width:" + progress + "%");
                    $("#progress").text(Math.floor(progress) + "%");
                    // console.log(progress);
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
                    labels = "assets/images/beer-background.jpg";
                }
                beerID = childData.beerID;


                setHTML();
                // Change the HTML to reflect
                getLocation();
                $('tbody').append(rows);
                sortBeersArray.push(sortBeers);
                // }
            });
        },
        // Handle the errors
        function(errorObject) {
            // console.log("Errors handled: " + errorObject.code);
        });
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
        favBeer();
    }
}

function favBeer() {
    getLocation();
    rating = $('tr[id="' + beerID + 'row"]').attr("rating");
    note = $('#' + beerID + 'note').val();
    $('#' + beerID).attr("fav", "Y");
    var result = sortBeersArray.filter(function(obj) {
        return obj.beerID == beerID;
    });
    result[0].fav = "Y";
    result[0].uluru = uluru;
    console.log(uluru);
    // console.log(rating);
    $.ajax({
        url: "/api/brewerydb/v2/beer/" + beerID + "?key=6c667709753ad53866207f52c01820c8",
        cache: false,
        method: 'GET'
    }).done(function(response) {

        console.log(response);
        var data = response.data;
        // add to firebasename = data[i].name;
        if (typeof data.style.shortName != "undefined") {
            style = data.style.shortName;
        } else {
            style = "";
        }
        if (typeof data.abv != "undefined") {
            abv = data.abv;
        } else {
            abv = "";
        }
        if (typeof data.description != "undefined") {
            description = data.description;
        } else {
            description = "";
        }
        if (typeof data.style.description != "undefined") {
            styleDescription = data.style.description;
        } else {
            styleDescription = "";
        }
        if (typeof data.labels != "undefined") {
            labels = data.labels.medium;
        } else {
            labels = "assets/images/beer-background.jpg";
        }

        database.ref().child(uid + '/' + beerID).set({
            name: data.name,
            style: style,
            rating: rating,
            fav: "Y",
            note: note,
            abv: abv,
            description: description,
            styleDescription: styleDescription,
            labels: labels,
            beerID: beerID,
            uluru: uluru

        });

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
                    if (typeof data[i].style.description != "undefined") {
                        styleDescription = data[i].style.description;
                    } else {
                        styleDescription = "";
                    }
                    if (typeof data[i].labels != "undefined") {
                        labels = data[i].labels.medium;
                    } else {
                        labels = "assets/images/beer-background.jpg";
                    }
                    beerID = data[i].id;
                    setHTML();

                    break;
                }
                // console.log(name + i);
            }
            getLocation();
            $('tbody').append(rows);
            sortBeersArray.push(sortBeers);
            rows = [""];
        });
    }
}



function setHTML() {

    // make beer row
    if (fav == "N") {
        uluru = {};
    }
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
    // console.log(sortBeersArray);
}

// locate user
$(document).on("click", ".accordion-toggle", initMap);

function initMap() {

    beerID = $(this).attr('data-name');
    if (document.getElementById(beerID + 'map')) {

        var result = sortBeersArray.filter(function(obj) {
            return obj.beerID == beerID;
        });
        if (result[0].fav == "Y") {


            console.log(result[0].uluru);
            var map = new google.maps.Map(document.getElementById(beerID + 'map'), {
                zoom: 12,
                disableDefaultUI: true,
                zoomControl: false,
                scrollwheel: false,
                disableDoubleClickZoom: true,
                center: result[0].uluru
            });
            var marker = new google.maps.Marker({
                position: result[0].uluru,
                map: map

            });
        }
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
}



// set rating
$(document).on("click", ".dropdown-menu li a", ratingBtn);

function ratingBtn() {
    $(this).parents("tr").attr("rating", ($(this).text()));
    $(this).parents(".btn-group").find('.selection').text($(this).text());
    $(this).parents(".btn-group").find('.selection').val($(this).text());
    beerID = $(this).parents(".btn-group").find('.selection').attr('data-name');
    // console.log(beerID);
    favBeer();
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
        return el.beerID !== deleteKey;
        console.log("after delete" + sortBeersArray);
    });
}

// Delete all - clear list except favorites
$("#deleteAll-btn").on("click", function(event) {
    $("tbody").empty();
    sortBeersArray = [];
    beerNames = [];
    rows = [];
    callFirebase($(this).attr("data-name"));
});




// sorting
var sorted = "";

function sortBeer() {
    sortBeersArray.sort(function(a, b) {
        if (sorted !== "asc") {
            return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
        } else {
            return (a.name < b.name) ? 1 : ((b.name < a.name) ? -1 : 0);

        }
    });
    if (sorted !== "asc") {
        sorted = "asc";
    } else {
        sorted = "desc";
    }
    sortHTML();
    console.log(sorted);
}

function sortStyle() {
    sortBeersArray.sort(function(a, b) {
        if (sorted !== "asc") {
            return (a.style > b.style) ? 1 : ((b.style > a.style) ? -1 : 0);
        } else {
            return (a.style < b.style) ? 1 : ((b.style < a.style) ? -1 : 0);

        }
    });
    if (sorted !== "asc") {
        sorted = "asc";
    } else {
        sorted = "desc";
    }
    sortHTML();
}

function sortRating() {
    sortBeersArray.sort(function(a, b) {
        if (sorted !== "asc") {
            return (a.rating > b.rating) ? 1 : ((b.rating > a.rating) ? -1 : 0);
        } else {
            return (a.rating < b.rating) ? 1 : ((b.rating < a.rating) ? -1 : 0);

        }
    });
    if (sorted !== "asc") {
        sorted = "asc";
    } else {
        sorted = "desc";
    }
    sortHTML();
}

function sortAlcohol() {
    sortBeersArray.sort(function(a, b) {
        if (sorted !== "asc") {
            return (Number(a.abv) > Number(b.abv)) ? 1 : ((Number(b.abv) > Number(a.abv)) ? -1 : 0);
        } else {
            return (Number(a.abv) < Number(b.abv)) ? 1 : ((Number(b.abv) < Number(a.abv)) ? -1 : 0);

        }
    });
    if (sorted !== "asc") {
        sorted = "asc";
    } else {
        sorted = "desc";
    }
    sortHTML();
}




function sortHTML() {
    rows = [];
    beerNames = [];
    // newSortedBeers = sortBeersArray;
    for (var i = 0; i < sortBeersArray.length; i++) {
        if (beerNames.indexOf(sortBeersArray[i].name) == -1) {
            name = sortBeersArray[i].name;
            style = sortBeersArray[i].style;
            rating = sortBeersArray[i].rating;
            fav = sortBeersArray[i].fav;
            note = sortBeersArray[i].note;
            abv = sortBeersArray[i].abv;
            description = sortBeersArray[i].description;
            styleDescription = sortBeersArray[i].styleDescription;
            labels = sortBeersArray[i].labels;
            beerID = sortBeersArray[i].beerID;
            uluru = sortBeersArray[i].uluru;
            setHTML();
        }
    }
    getLocation();
    $("tbody").empty();
    $('tbody').append(rows);
    // sortBeersArray.push(sortBeers);
}
