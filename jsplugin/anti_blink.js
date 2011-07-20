// Anti-Blink version 2
// by Nathbot

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'Anti-Blink',
  Description : 'Detects if there are two or three subtitles inside the specified corresponding interval.\nIf there are, it means there might be a "blinking" effect that you should try to avoid.',
  Color : 0xE5E5E5,
  Message : 'Anti-blink alert!',

  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----
  //ParamName : { Value : 0, Unit : 'ms', Description : 'Some description' },
  ParamInterval2Subs : { Value : 2200, Unit : 'ms', Description : 'Interval for two subtitles' },
  ParamInterval3Subs : { Value : 5000, Unit : 'ms', Description : 'Interval for three subtitles' },

  // ----- HasError method called for each subtitle during the error checking -----
  // If there is an error on CurrentSub return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    if(PreviousSub != null && NextSub != null){
            var startFirst = PreviousSub.Start;
            var startCurrent = CurrentSub.Start;
            var endFinal = NextSub.Stop;
            var total3Subs = endFinal - startFirst;
            var total2Subs = endFinal - startCurrent;

            if(total2Subs < this.ParamInterval2Subs.Value)
            {
                // two subs inside the interval
                //ScriptLog("total2Subs duration: "+total2Subs);
                return '2 subs in '+this.ParamInterval2Subs.Value+' '+this.ParamInterval2Subs.Unit+' is too much.';
            }
            else if(total3Subs < this.ParamInterval3Subs.Value)
            {
                // three subs inside the interval
                //ScriptLog("total3Subs duration: "+total3Subs);
                return '3 subs in '+this.ParamInterval3Subs.Value+' '+this.ParamInterval3Subs.Unit+' is too much.';
            } else return '';
        } else return '';
  }
  /*,

  FixError : function(CurrentSub, PreviousSub, NextSub) {

  }*/
}
