// Original plugin = Too long display time
// (christophe.paris <at> free.fr)
//
// extended by Nathbot and renamed "CPS too low"

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'CPS too low',
  Description : 'Detects and fixes subtitles when the CPS is strictly inferior to the specified value.',
  Color : 0xAF6DFF, 
  Message : 'CPS is too low:',

  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----
  ParamMinCPS : { Value : 4, Unit : 'Char/s', Description: 'Minimum CPS allowed' },
  ParamIgnoreLinesOf : { Value : 0, Unit : 'Characters', Description: 'Ignore the subtitles that have lines with less than ## characters' },

  // ----- HasError method called for each subtitle during the error checking -----
  // If there is an error on CurrentSub return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    // Ignore lines with length < to this.ParamIgnoreLinesOf.Value
    if(CurrentSub.StrippedText.length < this.ParamIgnoreLinesOf.Value)
    {
        return '';
    }
    
    Duration = CurrentSub.Stop - CurrentSub.Start;
    CharPerSec = (CurrentSub.StrippedText.length * 1000) / Duration;
    if (CharPerSec < this.ParamMinCPS.Value) {
    	return (Math.round(CharPerSec) + ' ' + this.ParamMinCPS.Unit);
    } else {
    	return '';
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
		var durLavie = 0.5 + len / VSSCore.CpsTarget;
		durLavie = Math.round(durLavie*10) / 10;

		while(dur > durLavie 
			  && (durMS) > VSSCore.MinimumDuration){
			CurrentSub.Stop -=1; 	
			durMS = CurrentSub.Stop - CurrentSub.Start; // in milliseconds
			dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit
		}
  }
}
