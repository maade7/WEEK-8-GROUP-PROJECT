$( document ).ready(function() {   
    // var authkey = "f675a8ca036d9e4f10c0cb3c5083be08";
    // var queryURL = "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY";
    // "http://api.brewerydb.com/v2/locations/?p=" + curr_page.toString() + "&region=Illinois&key=481d514448fd7365873ba9501d928e10&format=json";
    var curr_page = 1;
    var beer= "";
    var key = "6c667709753ad53866207f52c01820c8";
    // var queryURL = "https://api.brewerydb.com/v2/beers?key=" + key;
    var queryURL = "https://api.brewerydb.com/v2/locations/?p="+ curr_page.toString() + "&region=Georgia&key=" + key;
    $.ajax({
      url: queryURL,
      cache: false,
      method: 'GET'
    }).done(function(response) {
      console.log(response);
    });


});//end document.ready