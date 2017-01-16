/* Magic Mirror
 * Module: MMM-EFA-departures
 *
 * By yo-less / https://github.com/yo-less
 * MIT Licensed.
 * 
 * v1.0.3
 */

Module.register("MMM-EFA-departures", {

    defaults: {
        efaUrl: "http://www.efa-bw.de/nvbw/XSLT_DM_REQUEST",
        stopID: "7210149",
        stopName: "Loading station name …",
        lines: ['all'],
        maxDepartures: 7,
        reload: 1 * 60 * 1000,
        toggleDepTime: true,
        toggleDepTimePerReload: 6, //Every 10 seconds
        fade: true,
        fadePoint: 0.25 // Start on 1/4th of the list.
    },

    start: function () {
        var self = this;
        Log.info("Starting module: " + this.name);
        this.sendSocketNotification("CONFIG", this.config);
        setInterval(function() {
            self.sendSocketNotification("CONFIG", self.config);
        }, this.config.reload);
    },

    getStyles: function () {
        return ["MMM-EFA-departures.css"];
    },

    getScripts: function() {
        return ["moment.js", "classie.js"];
    },
   
    socketNotificationReceived: function (notification, payload) {
        if (notification === "TRAMS" + this.config.stopID) {
            this.efa_data = payload;
            this.config.stopName = payload.departureList[0].stopName;
            this.updateDom();           
        }
    },
                    
    getDom: function () {
        var wrapper = document.createElement("div");
        var header = document.createElement("header");
        header.innerHTML = this.config.stopName;
        wrapper.appendChild(header);

        if(!this.efa_data) {
            var text = document.createElement("div");
            //text.innerHTML = this.translate("LOADING");
            text.innerHTML = "LOADING";
            wrapper.appendChild(text);
        } else {
            var departuresUL = document.createElement("ul");
            departuresUL.className = 'small';
            var departures = this.efa_data.departureList;

            if (this.config.toggleDepTime){
                window.clearInterval(this.toggleTimeInt);
                this.toggleTimeInt = window.setInterval(function(){
                    classie.toggle(departuresUL, 'departures__departure--show-time');
                }, (this.config.reload / this.config.toggleDepTimePerReload));
            }

            for (var d in departures) {
                var departuresLI = document.createElement("li");
                departuresLI.className = 'departures__departure';
                var departureTime = new Date(departures[d].dateTime.year, departures[d].dateTime.month-1, departures[d].dateTime.day, departures[d].dateTime.hour, departures[d].dateTime.minute, 0);
                departuresLI.innerHTML = '<span class="departures__departure__line xsmall">'+ departures[d].servingLine.number +'</span><span class="departures__departure__direction small">' + departures[d].servingLine.direction + '</span><span class="departures__departure__time-relative small bright">' + moment(departureTime).fromNow() + '</span><span class="departures__departure__time-clock small bright">' + moment(departureTime).format('HH:mm') + '</span>';

                if (this.config.fade && this.config.fadePoint < 1) {
                    if (this.config.fadePoint < 0) {
                        this.config.fadePoint = 0;
                    }
                    var startingPoint = departures.length * this.config.fadePoint;
                    var steps = departures.length - startingPoint;
                    if (d >= startingPoint) {
                        var currentStep = d - startingPoint;
                        departuresLI.style.opacity = 1 - (1 / steps * currentStep);
                    }
                }

                departuresUL.appendChild(departuresLI);
            }
            wrapper.appendChild(departuresUL);
        }

        return wrapper;
    }





    // var departure = document.createElement("td");
    //     departure.className = "departure";
    //     if (data.time == "0"){
    //     departure.innerHTML = this.translate("NOW");
    //     } else if (data.time.charAt(2)==":"){   // Append "Uhr" to data given in "hh:mm" format if config language is German
    //     departure.innerHTML = data.time + this.translate("TIME");
    //     } else if (data.time.substr(data.time.length - 5) == "1 min") {
    //     departure.innerHTML = 'In ' + data.time.slice(0, -4) + ' ' + this.translate("MINUTE"); // Give remaining time as 'In 1 minute' rather than as '1 min'
    //     } else if (data.time.substr(data.time.length - 3) == "min") {
    //     departure.innerHTML = 'In ' + data.time.slice(0, -4) + ' ' + this.translate("MINUTES"); // Give remaining time as 'in d minutes' rather than as '\d min'
    //     } else {
    //     departure.innerHTML = data.time;
    //     }
    //     row.appendChild(departure);

//     dateTime
// day
// :
// "16"
// hour
// :
// "7"
// minute
// :
// "37"
// month
// :
// "1"
// weekday
// :
// "2"
// year
// :
// "2017"
});