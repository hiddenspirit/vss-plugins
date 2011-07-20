// All to 25
// by Nathbot

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'All to 25',
  Description : 'Sets all subs that are under 25 cps to 25',
  Color : 0x000000,
  Message : '"All to 25!" Current CPS is: ',

  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----
  ParamCPS : { Value : 25, Unit : 'Char/s', Description: 'If you want to change the CPS target'},

  // ----- HasError method called for each subtitle during the error checking -----
  // If there is an error on CurrentSub return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    Duration = CurrentSub.Stop - CurrentSub.Start;
    CharPerSec = (CurrentSub.StrippedText.length * 1000) / Duration;
    if (CharPerSec < this.ParamCPS.Value) {
    	return (Math.round(CharPerSec) + ' ' + this.ParamCPS.Unit);
    } else {
    	return '';
    }
  },



  FixError : function(CurrentSub, PreviousSub, NextSub) {
    Duration = CurrentSub.Stop - CurrentSub.Start;
    CharPerSec = (CurrentSub.StrippedText.length * 1000) / Duration;
	while(CharPerSec < this.ParamCPS.Value 
		  && Duration > VSSCore.MinimumDuration){
		CurrentSub.Stop -=1;
		Duration = CurrentSub.Stop - CurrentSub.Start;
		CharPerSec = (CurrentSub.StrippedText.length * 1000) / Duration;
	}
  }
}
