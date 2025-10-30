class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        if (this.text.startsWith("Just completed") || this.text.startsWith("Just posted")){
            return "completed_event";
        }else if (this.text.startsWith("Achieved")) {
            return "achievement"
        }else if (this.text.includes("live")) {
            return "live_event"
        } else {
            return "miscellaneous";
        }
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        //TODO: identify whether the tweet is written
        return !this.text.includes("with @Runkeeper");
    }

    get writtenText():string {
        if(!this.written) {
            return "";
        }
        //TODO: parse the written text from the tweet
        let index = this.text.indexOf(" http//t.co/");
        if (index !== -1){
            return this.text.substring(0, index);
        }
        return this.text;
    }

    getActivityType(): string {
        if (this.source !== 'completed_event') {
            return "unknown";
        }

        const pattern = /\d+\.?\d*\s+(?:km|mi)\s+([^\s]+)|Just posted a ([^\s]+)\s+(?:workout|practice)/i;
        const matches = this.text.match(pattern);

        if (matches) {
            const activity = matches[1] || matches[2];
            
            if (activity) {
                return activity;
            }
        }

        return "unknown";
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        const pattern = /(\d+\.?\d*)\s+(km|mi)/i;
        const matches = this.text.match(pattern);
        if (!matches) {
            return 0;
        }
        let distance = parseFloat(matches[1])
        const unit = matches[2].toLowerCase()
        if (unit == "km") {
            distance = distance / 1.609;
        }
        return distance;
    }

    getHTMLTableRow(rowNumber:number):string {
        const activityType = this.getActivityType();
        
        const urlRegex = /(https?:\/\/t\.co\/\w+)/gi;
        
        const tweetTextWithLink = this.text.replace(
            urlRegex, 
            '<a href="$1" target="_blank">$1</a>'
        );

        return `<tr>
            <th scope="row">${rowNumber}</th>
            <td>${activityType}</td>
            <td>${tweetTextWithLink}</td>
        </tr>`;
    }
}