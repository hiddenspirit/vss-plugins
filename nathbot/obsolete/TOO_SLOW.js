// too slow
// by Nathbot

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'TOO SLOW subtitles',
  Description : 'Detects and fixes slow subtitles',
  Color : 0xE7B8FF,
  Message : 'Speed :',

  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----
  ParamLevel : { Value : 1, Unit : '1/2/3', Description: 'Level 1 = TOO SLOW\nLevel 2 = TOO SLOW + "Slow, acceptable"\nLevel 3 = TOO SLOW + "Slow, acceptable" + "A bit slow"' },
 
  // ----- HasError method called for each subtitle during the error checking -----
  // If there is an error on CurrentSub return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null
  HasError : function(CurrentSub, PreviousSub, NextSub) {
	// current length, duration
    var len = CurrentSub.StrippedText.length;
    var durMS = CurrentSub.Stop - CurrentSub.Start;     // in milliseconds
    var dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit
    // display speed
    var dsMin = 4;
    var dsMax = 22;
    var dsX = len * 1000 / durMS;       // exact
    var ds = Math.round(dsX*10) / 10;   // rounded to 1 decimal digit
    // reading speed
    var rsMin = 5;
    var rsMax = 35;
    var rsX = len * 1000 / (durMS - 500);
    var rs = Math.round(rsX*10) / 10;
    // rating
    var rating;
    if (rs < rsMin)   rating = "TOO SLOW!";
    else if (rs < 10) rating = "Slow, acceptable.";
    else if (rs < 13) rating = "A bit slow.";
    else if (rs < 15) rating = "Good.";
    else if (rs < 23) rating = "Perfect.";
    else if (rs < 27) rating = "Good.";
    else if (rs < 31) rating = "A bit fast.";
    else if (rs < 35) rating = "Fast, acceptable.";
    else              rating = "TOO FAST!";

	// compute Lavie duration
    var ParamIdealReadingSpeed = 20;
    var durLavie = 0.5 + len / ParamIdealReadingSpeed;
    durLavie = Math.round(durLavie*10) / 10;

	//level
	switch(this.ParamLevel.Value){
		//3 = TOO SLOW + "Slow, acceptable" + "A bit slow"
		case 3:
			if (rs < 13) {
				return (rating+' - '+dur + ' s (ideal : ' + durLavie+')');
			}
			else {
				return '';
			}
		//2 = TOO SLOW + "Slow, acceptable"
		case 2:
			if (rs < 10) {
				return (rating+' - '+dur + ' s (ideal : ' + durLavie+')');
			}
			else {
				return '';
			}
		//1 = TOO SLOW
		default:
			if (rs < rsMin) {
				return (rating+' - '+dur + ' s (ideal : ' + durLavie+')');
			} else {
				return '';
			}
		break;
	}

  },



  FixError : function(CurrentSub, PreviousSub, NextSub) {
		// current length, duration
		var len = CurrentSub.StrippedText.length;
		var durMS = CurrentSub.Stop - CurrentSub.Start;     // in milliseconds
		var dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit
		// display speed
		var dsMin = 4;
		var dsMax = 22;
		var dsX = len * 1000 / durMS;       // exact
		var ds = Math.round(dsX*10) / 10;   // rounded to 1 decimal digit
		// reading speed
		var rsMin = 5;
		var rsMax = 35;
		var rsX = len * 1000 / (durMS - 500);
		var rs = Math.round(rsX*10) / 10;
		// compute Lavie duration
		var ParamIdealReadingSpeed = 20;
		var durLavie = 0.5 + len / ParamIdealReadingSpeed;
		durLavie = Math.round(durLavie*10) / 10;

		while(dur > durLavie && durMS > VSSCore.MinimumDuration){
			CurrentSub.Stop --; 	
			durMS = CurrentSub.Stop - CurrentSub.Start; // in milliseconds
			dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit
		}
	}
}