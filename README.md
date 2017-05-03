# MMM-EFA-departures
MagicMirror² module to show departures for public transport stations using the EFA system.

Station IDs can be found here for example:
http://www.eg-blog.de/?p=822

**Example Configuration for Düsseldorf HBF/Main Station:**
```
		{
			module: 'MMM-EFA-departures',
			position: 'top_right',
			config: {
				efaUrl: "http://efa.vrr.de/standard/XSLT_DM_REQUEST",
				stopID: "20018235",
				stopName: "MMM-EFA is loading",
				lines: ['all'],
				reload: 1 * 60 * 1000,
				realDepTime: true, //use real-time data
				relativeDepTime: true, // When "toggle" is disabled change between absolute/relative Time,not implemented yet
				toggleDepTime: false, //Toggle relative/absolute time
				toggleDepTimePerReload: 6, //Every 10 seconds
				fade: true,
				fadePoint: 0.25 // Start on 1/4th of the list.
				maxDepartures: 4,
			}
		},
```

**Some API-Endpoints (EfaUrl):**
```
VRR / Verkehrsverbund Rhein-Ruhr
http://efa.vrr.de/standard/XSLT_DM_REQUEST

VVS / Verkehrs- und Tarifverbund Stuttgart
http://www2.vvs.de/vvs/XSLT_DM_REQUEST

MVV / Münchner Verkehrs- und Tarifverbund
http://efa.mvv-muenchen.de/mobile/XSLT_DM_REQUEST

DING - Donau-Iller-Nahverkehrsverbund
http://www.ding.eu/mobile/ding2/XSLT_DM_REQUEST

traveline south east: Journey Planner
http://www.travelinesoutheast.org.uk/se/XSLT_DM_REQUEST
```
