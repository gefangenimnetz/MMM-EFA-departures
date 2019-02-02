/* Magic Mirror
 * Module: MMM-EFA-departures
 *
 * By gefangenimnetz, Dom1n1c / https://github.com/Dom1n1c/MMM-EFA-departures
 * MIT Licensed.
 * 
 * v0.0.1
 */


Module.register("MMM-EFA-departures", {

    defaults: {
        efaUrl: "http://efa.vrr.de/standard/XSLT_DM_REQUEST",
        stopID: "20018235",                     //stopID offered by the provider
        stopName: "MMM-EFA is loading",         //initial module name
        lines: ['all'],                         //lines: ['RBG:72782: :H','RBG:72782: :R'] would only show the line 782, operated by "Rheinbahn" in Düsseldorf (both directions)
        reload: 60000,                          //interval in ms (60000=60s)
        realDepTime: true,                      //use real-time data
        relativeDepTime: true,                  //when "toggle" is disabled change between absolute/relative Time
        toggleDepTime: false,                   //Toggle relative/absolute time
        toggleDepTimePerReload: 6,              //Every 10 seconds
        fade: true,                             //fade brightness
        fadePoint: 0.25,                        //Start on 1/4th of the list. (1/maxDepartures would be ideal)
        maxDepartures: 4                        //maximum amount of departures displayed
    },

    start: function () {
        var self = this;
        Log.info("Starting module: " + this.name);
        this.sendSocketNotification("CONFIG", this.config);
        setInterval(function () {
            self.sendSocketNotification("CONFIG", self.config);
        }, this.config.reload);

        // define new EFA locale
        moment.defineLocale('de-efa', {
            parentLocale: 'de',
            relativeTime: {
                future: 'in %s',
                past: 'Sofort',
                s: 'ein paar Sek.',
                m: '1 Min.',
                mm: '%d Min.',
                h: '1 Std.',
                hh: '%d Std.',
                d: '1 Tag',
                dd: '%d Tagen',
                M: '1 Mon.',
                MM: '%s Mon.',
                y: '1 Jahr',
                yy: '%s Jahren'
            }
        });
    },

    getStyles: function () {
        return ["MMM-EFA-departures.css"];
    },

    getScripts: function () {
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

        // switch to EFA locale
        moment.locale('de-efa');

        var wrapper = document.createElement("div");
        var header = document.createElement("header");
        header.innerHTML = this.config.stopName;
        wrapper.appendChild(header);

        if (!this.efa_data) {
            var text = document.createElement("div");
            //text.innerHTML = this.translate("LOADING");
            text.innerHTML = "LOADING";
            wrapper.appendChild(text);
        } else {
            var departuresTable = document.createElement("table");
            departuresTable.classList.add("small", "table");
            departuresTable.border = '0';
            var departures = this.efa_data.departureList;

            if (this.config.toggleDepTime) {
                window.clearInterval(this.toggleTimeInt);
                this.toggleTimeInt = window.setInterval(function () {
                    classie.toggle(departuresTable, 'departures__departure--show-time');
                }, (this.config.reload / this.config.toggleDepTimePerReload));
            } else if (!this.config.relativeDepTime) {
                classie.toggle(departuresTable, 'departures__departure--show-time');
            }

            departures.sort(function (a, b) {
                return parseFloat(a.countdown) - parseFloat(b.countdown);
            });

            for (var d in departures) {

                var departureRow = this.createDataRow(departures[d]);

                if (this.config.fade && this.config.fadePoint < 1) {
                    if (this.config.fadePoint < 0) {
                        this.config.fadePoint = 0;
                    }
                    var startingPoint = departures.length * this.config.fadePoint;
                    var steps = departures.length - startingPoint;
                    if (d >= startingPoint) {
                        var currentStep = d - startingPoint;
                        departureRow.style.opacity = 1 - (1 / steps * currentStep);
                    }
                }

                departuresTable.appendChild(departureRow);

            }
            wrapper.appendChild(departuresTable);
        }

        // reset locale to the one in the config
        moment.locale(config.language);

        return wrapper;
    },

    createDataRow: function (data) {

        var row = document.createElement("tr");

        var line = document.createElement("td");
        line.className = "departures__departure__line";
        line.innerHTML = '<span class="departures__departure__line__number xsmall">' + data.servingLine.number + '</span>';
        row.appendChild(line);

        var destination = document.createElement("td");
        destination.innerHTML = '<span class="departures__departure__direction small">' + data.servingLine.direction + '</span>';
        row.appendChild(destination);

        var departureTime = new Date;
        var originalDepartureTime = new Date(data.dateTime.year, data.dateTime.month - 1, data.dateTime.day, data.dateTime.hour, data.dateTime.minute, 0);
        if (this.config.realDepTime && data.realDateTime) {
            departureTime = new Date(data.realDateTime.year, data.realDateTime.month - 1, data.realDateTime.day, data.realDateTime.hour, data.realDateTime.minute, 0);
        } else {
            departureTime = originalDepartureTime;
        }

        var departure = document.createElement("td");
        departure.className = "departures__departure";
        departure.innerHTML = '<span class="departures__departure__time-relative small bright">' + moment(departureTime).fromNow() + '</span><span class="departures__departure__time-clock small bright">' + moment(originalDepartureTime).format('HH:mm') + '</span>';
        row.appendChild(departure);

        var delay = document.createElement("td");
        delay.className = "departures__delay";
        if (data.servingLine.delay > 0) {
            delay.innerHTML = '<span class="departures__delay__time xsmall">+ ' + data.servingLine.delay + '</span>';
        }
        row.appendChild(delay);

        return row;
    }
});
