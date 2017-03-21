var map;

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 33.776695,
			lng: -84.389974
		},
		zoom: 8
	});
}

function initMap() {
	
	var metropolis = {
		info: '<strong>TACO MAC METROPOLIS</strong><br>\
					933 Peachtree St Ne<br> Atlanta, GA 30309<br>\
					<a href="https://www.google.com/maps/place/933+Peachtree+St+NE,+Atlanta,+GA+30309/@33.7806435,-84.3860998,17z/data=!3m1!4b1!4m5!3m4!1s0x88f504429d7b70ff:0x3b9fd8c044b9a910!8m2!3d33.7806435!4d-84.3839111">Get Directions</a>',
		lat: 33.780386,
		long: -84.383672
	};

	var highlands = {
		info: '<strong>TACO MAC VIRGINIA HIGHLANDS</strong><br>\
					1006 N Highland Ave<br> Atlanta, GA 30306<br>\
					<a href="https://www.google.com/maps/place/1006+North+Highland+Avenue+Northeast,+Atlanta,+GA+30306/@33.7820263,-84.3567636,17z/data=!3m1!4b1!4m5!3m4!1s0x88f504207d925cf1:0xbe124a9b98a17496!8m2!3d33.7820263!4d-84.3545749">Get Directions</a>',
		lat: 33.782026,
		long: -84.354575
	};

	

	var locations = [
      [metropolis.info, metropolis.lat, metropolis.long, 0],
      [highlands.info,highlands.lat, highlands.long, 1],
     ];

	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 13,
		center: new google.maps.LatLng(33.780386, -84.383672),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});

	var infowindow = new google.maps.InfoWindow({});

	var marker, i;

	for (i = 0; i < locations.length; i++) {
		marker = new google.maps.Marker({
			position: new google.maps.LatLng(locations[i][1], locations[i][2]),
			map: map
		});

		google.maps.event.addListener(marker, 'click', (function (marker, i) {
			return function () {
				infowindow.setContent(locations[i][0]);
				infowindow.open(map, marker);
			}
		})(marker, i));
	}
}







