localStorage.clear();

apiKey = "2d80f2990142a3c995a775d2b5594436";

function cityFinder() {
    var cityId = properCasing($("#city-search")[0].value.trim());

    var apiLink = "https://api.openweathermap.org/data/2.5/weather?q=" + cityId + "&appid=" + apiKey;

    fetch(apiLink)
    .then(function (response) {
        if (response.ok) {
            response.json()
            .then(function (data) {
                
                console.log(data);
                $("#city-id")[0].textContent = cityId + " (" + dayjs().format('M/D/YYYY') + ")";

                $("#cities-searched").append('<button type="button" class="list-group-item list-group-item-action list-group-item-light location-name">' + cityId);
                
                weatherCurrent(data);
                
                const latty = data.coord.lat;
                const longy = data.coord.lon;

                const coordCouple = `${latty} ${longy}`;

                localStorage.setItem(cityId, coordCouple);

                var apiLinkTwo = "https://api.openweathermap.org/data/3.0/onecall?lat=" + latty + "&lon=" + longy + "&appid=" + apiKey;

                fetch(apiLinkTwo)
                .then(function (freshData) {
                    if (freshData.ok) {
                        freshData.json()
                        .then(function (dataUpdate) {
                            weatherCurrent(dataUpdate);
                        })
                    }
                })
            })
        } else {
            alert("City not found! (Enter city name only)");
        }
    })
}

// This function appends the current data from the OpenWeather API to their pre-determined positions in the document

function weatherCurrent(data) {

    $("#iconNow").src = "http://openweathermap.org/img/wn/" + data.weather[0].icon;
    $("#temp-now").textContent = "Current Temp: " + data.main.temp.toFixed(1) + " \u2109";
    $("#humid-now").textContent = "Humidity: " + data.main.humidity + "%";
    $("#wind-now").textContent = "Wind Speed: " + data.wind.speed.toFixed(1) + " MPH";
    $("#uv-now").textContent = "  " + data.current.uvi;

    if (data.current.uvi < 3) {
        $("#uv-now").removeClass("choppy extreme");
        $("#uv-now").addClass("calm");
    } else if (data.current.uvi < 6) {
        $("#uv-now").removeClass("calm extreme");
        $("#uv-now").addClass("choppy");
    } else {
        $("#uv-now").removeClass("calm choppy");
        $("#uv-now").addClass("extreme");
    }

    weatherFuture(data);
}

function weatherFuture(data) {
    for (let i = 0; i < 5; i++) {
        var estWeatherFuture = {
            date: convUnixTime(data, i),
            icon: "http://openweathermap.org/img/wn/" + data.daily[i + 1].weather[0].icon,
            temp: data.daily[i + 1].temp.day.toFixed(1),
            humidity: data.daily[i + 1].humidity
        }

        var nowSelect = "#day-" + i;
        $(nowSelect)[0].textContent = estWeatherFuture.date;
        nowSelect = "#icon-" + i;
        $(nowSelect)[0].src = estWeatherFuture.icon;
        nowSelect = "#temp-" + i;
        $(nowSelect)[0].textContent = "Current Temp: " + estWeatherFuture.temp + " \u2109";
        nowSelect = "#humid-" + i;
        $(nowSelect)[0].textContent = "Humidity: " + estWeatherFuture.humidity + "%";
    }
}

// This function retrieves refreshed data for any of the listed cities that have already been retrieved
function listedCity(coords) {
    apiLink = "https://api.openweathermap.org/data/3.0/onecall?lat=" + coords.split(" ")[0] + "&lon=" + coords.split(" ")[1] + "&exclude=minutely,hourly&units=imperial&appid=2d80f2990142a3c995a775d2b5594436";

    fetch(apiLink)
    .then(function (freshData) {
        if (freshData.ok) {
            freshData.json()
            .then(function (dataUpdate) {
                weatherCurrent(dataUpdate);
            })
        }
    })
}

// converts the Unix time format received from the server
function convUnixTime(data, index) {
    return dayjs.unix(data.daily[index + 1].dt).format('M/D/YYYY');
}

function properCasing(city) {
    var cityRefresh = city.toLowerCase().split(" ");
    var retFreshCity = "";
    for (let i = 0; i < cityRefresh.length; i++) {
        cityRefresh[i] = cityRefresh[i][0].toUpperCase() + cityRefresh[i].slice(1);
        retFreshCity += " " + cityRefresh[i];
    }
    return retFreshCity;
}

// click event handlers
$("#clickSearch").on("click", function (event) {
    event.preventDefault();

    cityFinder();

    $("#search-form")[0].reset();
})

$(".city-search-list").on("click", ".location-name", function () {

    var coords = localStorage.getItem($(this)[0].textContent).split(" ");
    coords[0] = parseFloat(coords[0]);
    coords[1] = parseFloat(coords[1]);

    $("#city-id")[0].textContent = $(this)[0].textContent + " (" + dayjs().format('M/D/YYYY') + ")";

    listedCity(coords);
})