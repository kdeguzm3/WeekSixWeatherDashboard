//variables
let city = 'Baltimore';   //defaults to Baltimore 
let current = {};
let history = window.localStorage.getItem("weatherHistory") == null ? [] : JSON.parse(window.localStorage.getItem("weatherHistory"));

let forecast = {
    days: []
}; 

if (history != []) {buildHistory()};
//Event Listener for City Button
$("#button").click(function(event) {
    let query = document.querySelector("#searchText").value;
    if (query != ""){
        city = query.toLowerCase();
        if (history.includes(query.toLowerCase()) == false) {
            history.unshift(query.toLowerCase());
            if (history.length > 5) {
                history.pop();
            }  
        }
        getData(city).catch(error => console.log(error));
        buildHistory()
        window.localStorage.setItem("weatherHistory", JSON.stringify(history));
    }
})

//event listener for history items
document.querySelector("#history").addEventListener("click", (event) => {
    if (event.target.classList.contains("historyDiv")) {
        city = event.target.getAttribute("data-value");
        getData(city).catch(error => console.log(error));
    }
    })


//get data function
async function getData(param) {
    let apiKey = "75c4ff13d86a6fdee4d409b1646fc46c";
    let weatherURL = `https://api.openweathermap.org/data/2.5/forecast?q=${param}&appid=${apiKey}&units=imperial`;
    $("#dashboard").html("");
    let response = await $.ajax({
        url: weatherURL,
        method: "GET"
    });
    let uvInfo = await $.ajax({
        url: `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${response.city.coord.lat}&lon=${response.city.coord.lon}`,
        method: "GET"
    })

        //Collecting info for the main div
        current.city = response.city.name;
        now = response.list[0];
        dateArray = now.dt_txt.split(" ");
        current.date = dateArray[0];
        current.icon = `http://openweathermap.org/img/wn/${now.weather[0].icon}@2x.png`
        current.temp = now.main.temp;
        current.humidity = now.main.humidity;
        current.windSpd = now.wind.speed;
        current.uvIndex = uvInfo.value;
        if (uvInfo.value <= 2) {
            current.uvColor = "green"}
            else if (uvInfo.value >= 8) {
                current.uvColor = "red"
            } else {current.uvColor = "yellow"
        }
    
        //collecting info for the 5 day cards
        response.list.forEach((element, index) => {
            let {dt_txt, main: {temp, humidity}, weather} = element;

            let trueDate = dt_txt.split(" ");
            trueDate = trueDate[0];
            if (forecast[trueDate] == undefined){
                forecast.days.push(trueDate);
                forecast[trueDate] = {
                    date: trueDate,
                    icon: `http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`,
                    temp: [],
                    humidity: [],
                    get tempAvg() {
                        let x = 0;
                        this.temp.forEach(element => x += element);
                        return Math.round(x / this.temp.length);  
                    },
                    get humAvg() {
                        let x = 0;
                        this.humidity.forEach(element => x += element);
                        return Math.round(x / this.humidity.length);  
                    }
                };
            }
            forecast[trueDate].temp.push(temp);
            forecast[trueDate].humidity.push(humidity);
        })    
            //building main dashboard
            dd("#dashboard")
            .diver("#main")
            .diver("#innerMain")
            .imager(current.icon)
            .writer(`${current.city} (${current.date})`, "h1")
            .writer(`Temperature: ${current.temp}°F`, "p")
            .writer(`Humidity: ${current.humidity}%`, "p")
            .diver(`.uvi .${current.uvColor}`)
            .writer(`UV Index: ${current.uvIndex}`)

            //building cards
            dd("#dashboard")
            .diver("#cards")

            for (let i = 0; i < 5; i++) {
                tmpDate = forecast.days[i]
                dd("#cards")
                .diver(".card")
                .writer(tmpDate, "h1")
                .imager(forecast[tmpDate].icon)
                .writer(`Temp: ${forecast[tmpDate].tempAvg}°F`)
                .writer(`Humidity: ${forecast[tmpDate].humAvg}%`);
            }

}

function buildHistory(){
    $("#history").empty();
    history.forEach(element => {
        let newHistoryDiv = document.createElement("div");
        newHistoryDiv.classList.add("historyDiv");
        newHistoryDiv.setAttribute("data-value", element);
        newHistoryDiv.textContent = element;
        $("#history").append(newHistoryDiv)
    })
}

getData(city).catch(error => console.log(error));

