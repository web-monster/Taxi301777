var oApp = new Framework7({
	cache: false,
	cacheDuration: 1000
});
var $$ = Framework7.$;
var mainView = oApp.addView('.view-main', {
	dynamicNavbar: true,
	swipeBackPage: true
});

var App = {
	isDev : false,
	iCost : 0,
	sCountry : 'Россия',
	sCity : 'Ставрополь',

	checkConnection : function() {
		if(App.isDev) return true;
		var networkState = navigator.connection.type;
		return networkState != "none";
	},

	getDistance : function() {
		App.checkConnection();
		if(!App.checkConnection()) {
			oApp.alert('Нет подключения к интернету.','Ошибка');
			return;
		}

		$$('.toolbarSum span').html(0);
		var address_start = $$('#address_start').val().trim();
		var address_end = $$('#address_end').val().trim();
		if(address_start.length<5) {
			return false;
		}
		if(address_end.length<5) {
			return false;
		}

		oApp.showPreloader('Считаем стоимость поездки');
		var service = new google.maps.DistanceMatrixService();
		service.getDistanceMatrix({
			origins: [App.sCountry+', '+App.sCity+', '+address_start],
			destinations: [App.sCountry+', '+App.sCity+', '+address_end],
			travelMode: google.maps.TravelMode.DRIVING,
			avoidHighways: false,
			avoidTolls: false
		}, App.calcSum);
	},

	calcSum : function(data, status) {
		oApp.hidePreloader();
		$$('input').blur();
		if (status == 'OK') {
			var distanceStatus = data.rows[0]['elements'][0]['status'];
			if(distanceStatus == 'OK') {
				var distance = data.rows[0]['elements'][0]['distance'];
				var distanceKm = distance.value>0 ? distance.value/1000 : 0;
				App.iCost = distanceKm * 20;
				if(App.iCost < 100) {
					App.iCost = 100;
				}
				if(App.iCost > 1000) {
					App.iCost /= 2.5;
				}
				$$('.toolbarSum span').html(App.iCost.toFixed(0));
			} else {
				oApp.alert('Неверный адрес', 'Ошибка');
			}
		} else {
			oApp.alert('Неверный адрес', 'Ошибка');
		}
	},

	taxiSend : function() {
		App.checkConnection();

		var number = $$('div[data-page="index"] input[name="number"]').val().trim();
		var address_start = $$('#address_start').val().trim();
		var address_end = $$('#address_end').val().trim();

		if(address_start.length<5) {
			oApp.alert('Укажите откуда будете ехать', 'Внимание');
			return false;
		}
		if(address_end.length<5) {
			oApp.alert('Укажите куда будете ехать', 'Внимание');
			return false;
		}
		if(number.length<5) {
			oApp.alert('Введите номер телефона', 'Внимание');
			return false;
		}
		var address = address_start+' до '+address_end;

		if(!App.checkConnection()) {
			oApp.alert('Нет подключения к интернету.','Ошибка');
			return;
		}

		oApp.showIndicator();
		$$.ajax({
			method: 'POST',
			//url: 'http://26web.ru/mobile.php?action=sendMail',
			url: 'http://taxi-301777.ru/sendMail.php',
			dataType: 'json',
			data : {"number":number,"text":address},
			success: function() {
				oApp.hideIndicator();
				mainView.loadPage('success.html');
				$$('input').val('').blur();
				$$('.toolbarSum span').html(0);
			}
		});
	}
};
$$('#address_start, #address_end').on('change',App.getDistance);
$$('.taxiSend').on('click',App.taxiSend);