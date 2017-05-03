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
				stopID: "20018235",						//stopID offered by the provider
				stopName: "MMM-EFA is loading",			//initial module name
				lines: ['all'], 						//lines: ['RBG:72782: :H','RBG:72782: :R'] would only show the line 782, operated by "Rheinbahn" in Düsseldorf (both directions)
				reload: 60000,							//interval in ms (60000=60s)
				realDepTime: true,						//use real-time data
				relativeDepTime: true,					// When "toggle" is disabled change between absolute/relative Time,not implemented yet
				toggleDepTime: false,					//Toggle relative/absolute time
				toggleDepTimePerReload: 6,				//Every 10 seconds
				fade: true,								//fade brightness
				fadePoint: 0.25,						//Start on 1/4th of the list. (1/maxDepartures would be ideal)
				maxDepartures: 4						//maximum amount of departures displayed
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
