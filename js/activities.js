function parseTweets(runkeeper_tweets) {
    //Do not proceed if no tweets loaded
    if(runkeeper_tweets === undefined) {
        window.alert('No tweets returned');
        return;
    }
    
    tweet_array = runkeeper_tweets.map(function(tweet) {
        return new Tweet(tweet.text, tweet.created_at);
    });

    const completed_tweets = tweet_array.filter(tweet => 
        tweet.source == 'completed_event' &&
        tweet.distance > 0
    );
	console.log(completed_tweets.length);

    let activity_stats = {}; // { activity: { total_dist: 0, count: 0 } }
    let weekday_total_dist = 0;
    let weekday_count = 0;
    let weekend_total_dist = 0;
    let weekend_count = 0;

    for (const tweet of completed_tweets) {
        const activity_type = tweet.getActivityType();
        const distance = tweet.distance;
        const day = tweet.time.getDay(); // 0=Sun, 6=Sat

        if (!activity_stats[activity_type]) {
            activity_stats[activity_type] = { total_dist: 0, count: 0 };
        }
        activity_stats[activity_type].total_dist += distance;
        activity_stats[activity_type].count++;

        if (day === 0 || day === 6) {
            weekend_total_dist += distance;
            weekend_count++;
        } else {
            weekday_total_dist += distance;
            weekday_count++;
        }
    }

	console.log(Object.keys(activity_stats).length)
    const totalActivityTypes = Object.keys(activity_stats).length;

    const activity_counts = Object.entries(activity_stats).map(([activity, stats]) => {
        return { "activity": activity, "count": stats.count };
    });
    activity_counts.sort((a, b) => b.count - a.count); // Sort descending by count

    const firstMost = activity_counts.length > 0 ? activity_counts[0].activity : 'N/A';
    const secondMost = activity_counts.length > 1 ? activity_counts[1].activity : 'N/A';
    const thirdMost = activity_counts.length > 2 ? activity_counts[2].activity : 'N/A';
    const top3ActivityNames = [firstMost, secondMost, thirdMost];

    const activity_averages = [];
    for (const [activity, stats] of Object.entries(activity_stats)) {
        const avg = (stats.count > 0) ? stats.total_dist / stats.count : 0;
        activity_averages.push({ activity, avg });
    }

    const top3_averages = activity_averages
        .filter(item => top3ActivityNames.includes(item.activity));
    
    top3_averages.sort((a, b) => b.avg - a.avg); // Descending by distance

    const longestActivityType = top3_averages.length > 0 ? top3_averages[0].activity : 'N/A';
    const shortestActivityType = top3_averages.length > 0 ? top3_averages[top3_averages.length - 1].activity : 'N/A';
    
    const avg_weekday = (weekday_count > 0) ? weekday_total_dist / weekday_count : 0;
    const avg_weekend = (weekend_count > 0) ? weekend_total_dist / weekend_count : 0;
    const longer_dist_days = (avg_weekend > avg_weekday) ? 'weekends' : 'weekdays';

    document.querySelector('#numberActivities').innerText = totalActivityTypes;
    document.querySelector('#firstMost').innerText = firstMost;
    document.querySelector('#secondMost').innerText = secondMost;
    document.querySelector('#thirdMost').innerText = thirdMost;
    document.querySelector('#longestActivityType').innerText = longestActivityType;
    document.querySelector('#shortestActivityType').innerText = shortestActivityType;
    document.querySelector('#weekdayOrWeekendLonger').innerText = longer_dist_days;

    activity_vis_spec = {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "description": "A graph of the number of Tweets containing each type of activity.",
      "data": { "values": activity_counts }, // Use our sorted counts
      "mark": "bar",
      "encoding": {
        "x": {"field": "activity", "type": "nominal", "title": "Activity Type", "sort": "-y"},
        "y": {"field": "count", "type": "quantitative", "title": "Number of Tweets"}
      }
    };
    vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const distance_vis_data = completed_tweets
        .filter(tweet => top3ActivityNames.includes(tweet.getActivityType()))
        .map(tweet => {
            return {
                "activity": tweet.getActivityType(),
                "day": dayNames[tweet.time.getDay()],
                "distance": tweet.distance
            };
        });

    let vegaView; 

    const distance_vis_spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Distances of top 3 activities by day of the week (point or mean).",
        "data": { "values": distance_vis_data },
        "params": [{
            "name": "isAggregated",
            "value": false
        }],
        
        "resolve": {"scale": {"y": "independent"}},

       "layer": [
        {
            "transform": [{"filter": "!isAggregated"}], 
            "mark": "point",
            "encoding": { 
                "x": {
					"field": "day", 
					"type": "ordinal", 
					"sort": dayNames, 
					"title": "Day of the Week",
					"axis": {"grid": true}
				},
                "y": {
                    "field": "distance", 
                    "type": "quantitative", 
                    "scale": {"zero": true},
                    "title": {
						"condition": {"param": "isAggregated", "value": null},
                        "value":"Distance (miles)"
					},
					"axis": {
						"condition": {"param": "isAggregated", "value": null},
                        "value": {"grid": true, "orient": "left"}
					}
                },
                "color": {"field": "activity", "title": "Activity"},
                "tooltip": [
                    {"field": "activity"},
                    {"field": "day"},
                    {"field": "distance", "type": "quantitative", "format": ".2f", "title": "Distance"}
                ]
            }
        },
        {
            "transform": [{"filter": "isAggregated"}],
            "mark": "point",
            "encoding": {
                "x": {
					"field": "day",
					"type": "ordinal",
					"sort": dayNames,
					"title": "Day of the Week",
					"axis": {"grid": true}
				},
                "y": {
                    "aggregate": "mean", 
                    "field": "distance",
                    "type": "quantitative",
                    "scale": {"zero": true},
                    "title": {
						"condition": {"param": "isAggregated", "value":"Mean of Distance"},
                        "value": null
					},
					"axis": {
						"condition": {"param": "isAggregated", "value": {"grid": true, "orient": "left"}},
                        "value": null
					}
                },
                "color": {"field": "activity", "title": "Activity"},
                "tooltip": [
                    {"field": "activity"},
                    {"field": "day"},
                    {"aggregate": "mean", "field": "distance", "type": "quantitative", "format": ".2f", "title": "Avg. Distance"}
                ]
            }
        }
       ]
    };
    
    // Embed the single chart and store its view object
    vegaEmbed('#distanceVis', distance_vis_spec, {actions:false})
        .then(result => {
            // Save the 'view' object so we can interact with it
            vegaView = result.view; 
            
            // --- THIS IS THE FIX ---
            // Attach the event listener *inside* the .then() block.
            // This ensures vegaView is defined.
            document.querySelector('#aggregate').addEventListener('click', () => {
                // The 'if (vegaView)' check isn't strictly needed anymore 
                // since we're in the .then(), but it's safe to keep.
                
                // Get the current state of our parameter
                const isAggregated = vegaView.signal("isAggregated");
                
                // Get the button element
                const button = document.querySelector('#aggregate');

                // Set the parameter to the *opposite* of its current state
                vegaView.signal("isAggregated", !isAggregated).run();
                
                // Update the button text accordingly
                if (!isAggregated) { // We just turned aggregation ON
                    button.innerText = 'Show all activities';
                } else { // We just turned aggregation OFF
                    button.innerText = 'Show means';
                }
            });
        })
        .catch(console.error);

}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
    loadSavedRunkeeperTweets().then(parseTweets);
});