const request = require('request');
const moment = require('moment');
const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting node helper for: " + this.name);
    },

    socketNotificationReceived: function(notification, payload) {
        if(notification === 'CONFIG'){
            this.config = payload;

            var efa_url = this.config.efaUrl;
                efa_url += '&name_dm=' + this.config.stopID;
                efa_url += '&type_dm=any';
                efa_url += '&line=' + this.config.lines.join('&line=');
                efa_url += '&outputFormat=json';
                efa_url += '&limit=' + this.config.maxDepartures;
                efa_url += '&itdTime=' + moment().format('HHmm');
                efa_url += '&itdDate=' + moment().format('YYYYMMDD');
            console.log(efa_url);
            this.getData(efa_url, this.config.stopID);
        }
    },

    getData: function(options, stopID) {
        request(options, (error, response, body) => {
            if (response.statusCode === 200) {
                this.sendSocketNotification("TRAMS" + stopID, JSON.parse(body));
            } else {
                console.log("Error getting tram connections " + response.statusCode);
            }
        });
    }
});