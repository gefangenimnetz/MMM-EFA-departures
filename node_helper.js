const request = require('request');
const moment = require('moment');
const NodeHelper = require("node_helper");
const parser = require('simple-xml2json');

module.exports = NodeHelper.create({
    outputFormat: "json",

    start: function () {
        console.log("Starting node helper for: " + this.name);
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === 'CONFIG') {
            this.config = payload;
            if (this.config.efaUrl.toLowerCase().endsWith("xml_dm_request")) this.outputFormat = "XML";

            var efa_url = this.config.efaUrl;
            efa_url += '?name_dm=' + this.config.stopID;
            efa_url += '&type_dm=any';
            efa_url += '&useRealtime=' + 1 * (this.config.realDepTime);
            efa_url += '&line=' + this.config.lines.join('&line=');
            efa_url += '&outputFormat=' + this.outputFormat;
            efa_url += '&mode=direct'
            efa_url += '&limit=' + this.config.maxDepartures;
            efa_url += '&itdTime=' + moment().format('HHmm');
            efa_url += '&itdDate=' + moment().format('YYYYMMDD');
            
            this.getData(efa_url, this.config.stopID);
        }
    },

    getData: function (options, stopID) {
        request(options, (error, response, body) => {
            if (error) {
                return console.error("ERROR - MMM-EFA-departures: " + error);
            }
            if (response && response.statusCode === 200) {
                if (this.outputFormat === "XML") {
                    if(this.config.efaUrl.includes("/beg/")){
                        result = this.convertToDefaultFormat(body);
                    }else{
                        result = this.convertFullToDefaultFormat(body);
                    }
                } else {
                    result = JSON.parse(body);
                }
                this.sendSocketNotification("TRAMS" + stopID, result);
            } else {
                console.error("Error getting tram connections " + response.statusCode);
            }
        });
    },

    convertToDefaultFormat: function (body) {
        const departures = parser.parser(body)["efa"]["dps"]["dp"];
        const list = [];
        for (const d in departures) {
            // noinspection JSUnfilteredForInLoop
            const currentDeparture = departures[d];
            let realDt = null;
            let delay = 0;

            const depTime = currentDeparture["dt"];
            const origDepDay = depTime["da"]; // e.g. 9.7.2018
            const origDepTime = depTime["t"]; // e.g. 06:20
            const realDepDay = depTime["rda"];
            const realDepTime = depTime["rt"];
            
            const dt = this.getDepTime(origDepDay, origDepTime)
            if (typeof realDepDay !== "undefined" && typeof realDepTime !== "undefined") {
                realDt = this.getDepTime(realDepDay, realDepTime)
                delay = this.getDiffInMinutes(this.parseToDate(realDt), this.parseToDate(dt))
            }

            const cDt = realDt == null ? dt : realDt;

            list.push({
                stopName: currentDeparture.n,
                countdown: this.getDiffInMinutes(this.parseToDate(cDt), new Date()),
                servingLine: {
                    number: currentDeparture["m"]["n"] + " " + currentDeparture["m"]["nu"],
                    direction: currentDeparture["m"]["des"],
                    delay: delay
                },
                realDateTime: realDt,
                dateTime: dt
            })
        }
        return {departureList: list};
    },
    
    convertFullToDefaultFormat: function (body) {
        const departures = parser.parser(body)["itdrequest"]["itddeparturemonitorrequest"]["itddeparturelist"]["itddeparture"];
        const list = [];
        for (const d in departures) {
            const currentDeparture = departures[d];
            let realDt = null;
            let delay = currentDeparture["itdservingline"]["itdnotrain"]["delay"];

            const depDateTime = currentDeparture["itddatetime"];
            const dt = {
                year: depDateTime["itddate"]["year"],
                month: depDateTime["itddate"]["month"],
                day: depDateTime["itddate"]["day"],
                hour: depDateTime["itdtime"]["hour"],
                minute: depDateTime["itdtime"]["minute"],
                seconds: 0
            };
            
            const realDepDateTime = currentDeparture["itdrtdatetime"];
            if (typeof realDepDateTime !== "undefined") {
                const realDt = {
                    year: realDepDateTime["itddate"]["year"],
                    month: realDepDateTime["itddate"]["month"],
                    day: realDepDateTime["itddate"]["day"],
                    hour: realDepDateTime["itdtime"]["hour"],
                    minute: realDepDateTime["itdtime"]["minute"],
                    seconds: 0
                };
            }

            const cDt = (realDt === null) ? dt : realDt;
            list.push({
                stopName: currentDeparture["stopname"],
                countdown: this.getDiffInMinutes(this.parseToDate(cDt), new Date()),
                servingLine: {
                    number: currentDeparture["itdservingline"]["number"],
                    direction: currentDeparture["itdservingline"]["direction"],
                    delay: delay
                },
                realDateTime: realDt,
                dateTime: dt
            });
        }
        return {departureList: list};
    },

    getDepTime: function (depDay, depTime) {
        return {
            year: parseInt(depDay.toString().split(".")[2]),
            month: parseInt(depDay.toString().split(".")[1]),
            day: parseInt(depDay.toString().split(".")[0]),
            hour: parseInt(depTime.toString().split(":")[0]),
            minute: parseInt(depTime.toString().split(":")[1]),
            seconds: 0
        };
    },

    parseToDate: function (o) {
        return new Date(o.year, o.month - 1, o.day, o.hour, o.minute, o.seconds);
    },

    getDiffInMinutes: function (date1, date2) {
        const diffMs = (date1 - date2);
        return diffMs / 60000;
    }
});
