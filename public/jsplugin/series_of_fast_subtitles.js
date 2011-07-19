// Enchaînement sous-titres
// by Nathbot

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'Series of fast subtitles',
  Description : 'Detects if two fast subtitles follow on from each other.',
  Color : 0xFFA884,
  Message : 'Series of fast subtitles',

  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----
  ParamMode : { Value : 1, Unit : '', Description: 'Mode 1: checks only "TOO FAST" subtitles\nMode 2: includes "Fast, acceptable" subtitles\nMode 3: includes "A bit fast" subtitles'},
  ParamIntervalMax : { Value : 1000, Unit : 'ms', Description: 'The plugin doesn\'t detect any error if the interval between two subtitles is strictly superior to this duration'},

  // ----- HasError method called for each subtitle during the error checking -----
  // If there is an error on CurrentSub return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    if(NextSub == null) return '';
    // CURRENT SUB
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
    var currentRS = Math.round(rsX*10) / 10;

    //NEXT SUB
    // length, duration
    len = NextSub.StrippedText.length;
    durMS = NextSub.Stop - NextSub.Start;     // in milliseconds
    dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit
    // display speed
    dsMin = 4;
    dsMax = 22;
    dsX = len * 1000 / durMS;       // exact
    ds = Math.round(dsX*10) / 10;   // rounded to 1 decimal digit
    // reading speed
    rsX = len * 1000 / (durMS - 500);
    var nextRS = Math.round(rsX*10) / 10;

   //interval between the two subs
   var intervalMS = NextSub.Start - CurrentSub.Stop;

    // rating
    var currentRating;
    var nextRating;
    if(currentRS >=27){
        if (currentRS < 31) 		currentRating = "A bit fast.";
        else if (currentRS < 35) 	currentRating = "Fast, acceptable.";
        else              			currentRating = "TOO FAST!";
    }
    if(nextRS >=27){
        if (nextRS < 31) 		nextRating = "A bit fast.";
        else if (nextRS < 35) 	nextRating = "Fast, acceptable.";
        else              		nextRating = "TOO FAST!";
    }
    //level
    switch(this.ParamMode.Value){
        //3 = top synchro
        /*	too fast -- too fast
            too fast -- fast acceptable
            fast acceptable -- too fast
            too fast -- a bit fast
            a bit fast -- too fast
            fast acceptable -- a bit fast
            a bit fast -- fast acceptable
        */
        case 3:
            if (
                (currentRating == "TOO FAST!" || currentRating == "Fast, acceptable." || currentRating == "A bit fast.")
                && (nextRating == "TOO FAST!" || nextRating == "Fast, acceptable." || nextRating == "A bit fast.")
                && intervalMS <= this.ParamIntervalMax.Value
            ) {
                return (currentRating+'+'+nextRating);
            }
            else {
                return '';
            }
        //2 = super synchro
        /*	too fast -- too fast
            too fast -- fast acceptable
            fast acceptable -- too fast
        */
        case 2:
            if (
                (currentRating == "TOO FAST!" || currentRating == "Fast, acceptable.")
                && (nextRating == "TOO FAST!" || nextRating == "Fast, acceptable.")
                && intervalMS <= this.ParamIntervalMax.Value
            ) {
                return (currentRating+'+'+nextRating);
            }
            else {
                return '';
            }
        //1 = bonne synchro
        // too fast -- too fast
        default:
            if (currentRating == "TOO FAST!" && nextRating == "TOO FAST!"
                && intervalMS <= this.ParamIntervalMax.Value) {
                return (currentRating+'+'+nextRating);
            } else {
                return '';
            }
        break;
    }

  }
}
