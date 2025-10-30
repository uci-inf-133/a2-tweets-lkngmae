function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	num_tweets = tweet_array.length;
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;	

	if(tweet_array.length == 0) {
		document.getElementById('firstDate').innerText = "N/A";
		document.getElementById("lastDate").innerText = "N/A";
		return;
	}

	const allTime = tweet_array.map(tweet => tweet.time);
	const minDate = new Date(Math.min(...allTime))
	const maxDate = new Date(Math.max(...allTime))
	const options = {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
        timeZone: 'UTC'		
	};

	const minDateString = minDate.toLocaleDateString('en-US', options);
	const maxDateString = maxDate.toLocaleDateString('en-US', options);
	
	document.getElementById('firstDate').innerText = minDateString;
	document.getElementById('lastDate').innerText = maxDateString;

    // These were good
    let liveEventCount = 0;
    let completedEventCount = 0;
    let achievementCount = 0;
    let miscCount = 0;
    let completedWrittenCount = 0;

    for (const tweet of tweet_array){
        const eventRecord = tweet.source;

        if (eventRecord == "completed_event") {
            completedEventCount++;
            eventIsWritten = tweet.written;
            if(eventIsWritten) {
                completedWrittenCount++;
            }
        } else if (eventRecord == "live_event") {
            liveEventCount++;
        } else if (eventRecord == "achievement") {
            achievementCount++;
        } else {
            miscCount++;
        }
    }

    for (const element of document.querySelectorAll('.completedEvents')) {
        element.innerText = completedEventCount;
    }

    document.querySelector('.liveEvents').innerText = liveEventCount;
    document.querySelector('.achievements').innerText = achievementCount;
    document.querySelector('.miscellaneous').innerText = miscCount;

    const completedPct = ((completedEventCount / num_tweets) * 100).toFixed(2);
    const livePct = ((liveEventCount / num_tweets) * 100).toFixed(2);
    const achievementPct = ((achievementCount / num_tweets) * 100).toFixed(2);
    const miscPct = ((miscCount / num_tweets) * 100).toFixed(2);

    document.querySelector('.completedEventsPct').innerText = completedPct + '%';
    document.querySelector('.liveEventsPct').innerText = livePct + '%';
    document.querySelector('.achievementsPct').innerText = achievementPct + '%';
    document.querySelector('.miscellaneousPct').innerText = miscPct + '%';

    const writtenPct = ((completedWrittenCount / completedEventCount) * 100).toFixed(2);

    document.querySelector('.written').innerText = completedWrittenCount;
    document.querySelector('.writtenPct').innerText = writtenPct + '%';
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});