// too fast
// by Nathbot

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'Sous-titres TOO FAST',
  Description : 'Détecte et corrige les sous-titres TOO FAST. \nLevel 1 = TOO FAST, 2 = TOO FAST + "Fast, acceptable", 3 = TOO FAST + "Fast, acceptable" + "A bit fast", 4 = de "good" à "TOO FAST"',
  Color : 0xFFA884,
  Message : 'Vitesse :',

  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----
  ParamIdealReadingSpeed: { Value : 20, Unit : 'Char/s' },
  ParamMinBlank : { Value : 120, Unit : 'ms' },
  ParamLevel : { Value : 1, Unit : '1/2/3/4' },
  ParamMaxStartMove : { Value : 250, Unit : 'ms', Description : 'Décalage maximum du début du sous-titre s\'il n\'y a pas assez de place pour décaler la fin' },
 
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
    var durLavie = 0.5 + len / this.ParamIdealReadingSpeed.Value;
    durLavie = Math.round(durLavie*10) / 10;

	//level
	switch(this.ParamLevel.Value){
		//4 = TOO FAST + "Fast, acceptable" + "A bit fast" + "good"
		case 4:
			if ((rs >= 23 && rs < 27) || (rs >= 27 && rs < 31) || (rs >= 31 && rs < 35) || (rs >= 35)) {
				return (rating+' - '+dur + ' s (ideal : ' + durLavie+')');
			}
			else {
				return '';
			}
		//3 = TOO FAST + "Fast, acceptable" + "A bit fast"
		case 3:
			if ((rs >= 27 && rs < 31) || (rs >= 31 && rs < 35) || (rs >= 35)) {
				return (rating+' - '+dur + ' s (ideal : ' + durLavie+')');
			}
			else {
				return '';
			}
		//2 = TOO FAST + "Fast, acceptable"
		case 2:
			if ((rs >= 31 && rs < 35) || (rs >= 35)) {
				return (rating+' - '+dur + ' s (ideal : ' + durLavie+')');
			}
			else {
				return '';
			}
		//1 = TOO FAST
		default:
			if (rs >= 35) {
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
		var durLavie = 0.5 + len / this.ParamIdealReadingSpeed.Value;
		durLavie = Math.round(durLavie*10) / 10;

		// not the last sub...
		if(NextSub != null){
			while(dur < durLavie 
				  && (NextSub.Start - CurrentSub.Stop) > this.ParamMinBlank.Value){
				CurrentSub.Stop ++; 	
				durMS = CurrentSub.Stop - CurrentSub.Start; // in milliseconds
				dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit
			}
			//move the sub start if necessary
			if(dur < durLavie){
				var totalMoved = 0;
				while(dur < durLavie 
				  && (CurrentSub.Start - PreviousSub.Stop) > this.ParamMinBlank.Value
				  && totalMoved <= this.ParamMaxStartMove.Value){
					CurrentSub.Start --;
					totalMoved ++;
					durMS = CurrentSub.Stop - CurrentSub.Start; // in milliseconds
					dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit					
				}
			}
		}
		// last sub...
		else {
			while(dur < durLavie){
				CurrentSub.Stop ++; 	
				durMS = CurrentSub.Stop - CurrentSub.Start; // in milliseconds
				dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit
			}
			//move the sub start if necessary
			if(dur < durLavie){
				var totalMoved = 0;
				while(dur < durLavie 
				  && (CurrentSub.Start - PreviousSub.Stop) > this.ParamMinBlank.Value
				  && totalMoved <= this.ParamMaxStartMove.Value){
					CurrentSub.Start --;
					totalMoved ++;
					durMS = CurrentSub.Stop - CurrentSub.Start; // in milliseconds
					dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit					
				}
			}
		}
	}
}