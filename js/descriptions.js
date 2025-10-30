let writtenTweets = [];

function parseTweets(runkeeper_tweets) {
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	const tweet_array = runkeeper_tweets.map(function(tweet) {
        return new Tweet(tweet.text, tweet.created_at);
    });

    writtenTweets = tweet_array.filter(tweet => tweet.written);
}

function addEventHandlerForSearch() {
	const searchInput = document.getElementById('textFilter');
    
    searchInput.addEventListener('input', (event) => {
        const searchText = event.target.value.toLowerCase();
        
        const searchCountSpan = document.getElementById('searchCount');
        const searchTextSpan = document.getElementById('searchText');
        const tableBody = document.getElementById('tweetTable');

        if (searchText === "") {
            tableBody.innerHTML = "";
            searchCountSpan.innerText = "0";
            searchTextSpan.innerText = "";
            return;
        }

        const filteredTweets = writtenTweets.filter(tweet => 
            tweet.writtenText.toLowerCase().includes(searchText)
        );

        searchCountSpan.innerText = filteredTweets.length;
        searchTextSpan.innerText = searchText;

        let tableHTML = "";
        filteredTweets.forEach((tweet, index) => {
            tableHTML += tweet.getHTMLTableRow(index + 1);
        });

        tableBody.innerHTML = tableHTML;
    });
}


document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});