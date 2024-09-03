const cityForm = $('#city-form');
const cityInput = $('#city');
const weatherContainer = $('#city-weather-container');
const cityContainer = $('#city-container');
const cityContainerBtn = $('#city-container button');
const citySearch = $('#city-search-term');
const currentDay = $('#city-current-day');

const APIKey = '5bf853e041243134da653080c288c435';
let city = '';
function getApi(city) {
    const queryUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${APIKey}`;

    fetch(queryUrl)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                alert(response.statusText);
                return;
            }
        })
        .then(function (data) {
            console.log(data);
            useCityData(data);
            return data;
        })


}

//saves city to local storage
function saveCityList(cityList) {
    localStorage.setItem('city', JSON.stringify(cityList));
}

function readCityList() {
    let cityList = JSON.parse(localStorage.getItem('city'));
    //returns an empty array if nothing is in local storage
    if (!cityList) {
        cityList = [];
    }

    return cityList;
};

// handles city search form submit
function handleFormSubmit(event) {
    event.preventDefault();
    const city = cityInput.val().trim() || $(event.target).attr('data-city');

    if (!city) {
        alert('enter a city name');
        return;
    } else {
        cityContainer.text("");
        currentDay.text("");
        weatherContainer.empty();
    }

    const cities = readCityList();
    if (cities.indexOf(city) === -1) {
        cities.push(city);
    }

    saveCityList(cities);
    getApi(city);
    displaySearchedButtons(cities);
}

function kelToFahr(temp) {
    const ans = Math.round((temp - 273.15) * 9 / 5 + 32);
    return ans;
}

function useCityData(data) {
    console.log(data);
    let windSpeed = data.list[0].wind.speed;
    let windDirection = data.list[0].wind.deg;

    if (windDirection <= 60) {
        windDirection = "North";
    } else if (windDirection <= 140) {
        windDirection = "East";
    } else if (windDirection <= 230) {
        windDirection = "South";
    } else if (windDirection <= 320) {
        windDirection = "West";
    } else {
        windDirection = "North";
    }

    if (windSpeed === 0) {
        windDirection = "No Wind"
    }

    const currentCity = $('<div>');
    const cityName = $('<h2>');
    cityName.text(data.city.name);

    let weatherIcon = data.list[0].weather[0].icon;
    const currentCityIcon = $('<img>');
    currentCityIcon.attr('src', `https://openweathermap.org/img/wn/${weatherIcon}.png`);

    const cityDate = $('<p>');
    let todayUnixDate = data.list[0].dt;
    // Convert Unix Date
    cityDate.text(dayjs.unix(todayUnixDate).format('MMM D, YYYY'));

    const currentTemp = $('<p>');
    currentTemp.text(`Temp: ${kelToFahr(data.list[0].main.temp)} F`);

    const currentWind = $('<p>');
    currentWind.text(`Wind: ${windSpeed} out of the ${windDirection}`);

    const currentHumidity = $('<p>');
    currentHumidity.text(`Humidity: ${data.list[0].main.humidity}`);

    cityName.append(currentCityIcon);
    currentCity.append(cityName, cityDate, currentTemp, currentWind, currentHumidity);
    currentDay.append(currentCity);

    // 5 day weather
    for (let i = 8; i <= data.list.length; i = i + 7) {
        const cityCard = $('<div>');
        cityCard.addClass('mr-5 px-1 border border-secondary bg-info')
        let weatherIcon = data.list[i].weather[0].icon;
        const cardIcon = $('<img>');
        cardIcon.attr('src', `https://openweathermap.org/img/wn/${weatherIcon}.png`);

        const fiveDate = $('<h5>');
        let cardUnixDate = data.list[i].dt;
        fiveDate.text(dayjs.unix(cardUnixDate).format('MMM D, YYYY'));

        const fiveTemp = $('<p>');
        fiveTemp.text(`Temp: ${kelToFahr(data.list[i].main.temp)} F`);

        const cardWindSpeed = $('<p>');
        cardWindSpeed.text(`Wind Speed: ${data.list[i].wind.speed}mph`);

        const cardHumidity = $('<p>');
        cardHumidity.text(`Humidity: ${data.list[i].main.humidity}`);

        cityCard.append(cardIcon, fiveDate, fiveTemp, cardWindSpeed, cardHumidity);

        weatherContainer.append(cityCard);
        cityInput.val("");
    }
}

function displaySearchedButtons(city) {
    const cityList = readCityList();
    console.log(cityList)
    if (cityList.length === 0) {
        cityContainerEl.text('No city located');
        return;
    }

    // Displays list of cities in localStorage
    for (let cityName of cityList) {
        const cityBtn = $('<button>');
        cityBtn.addClass('d-flex flex-column btn btn-secondary')
        cityBtn.attr('data-city', `${cityName}`);
        cityBtn.text(cityName);
        cityBtn.on('click', handleFormSubmit);

        cityContainer.append(cityBtn);
    }
}
cityForm.on('submit', handleFormSubmit);
window.addEventListener('load', displaySearchedButtons);
