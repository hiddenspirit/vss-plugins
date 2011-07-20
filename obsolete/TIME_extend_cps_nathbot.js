// Extend CPS
// by Nathbot

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'Extend CPS',
  Description : 'An error is detected when the number of Char/s is strictly '+
  	'superior to the specified value. The fixer will extend the duration of the subtitle without overlapping the next one.',
  Color : 0xC91191,
  Message : 'Subtitle CPS is too fast:',

  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----
  ParamMaxCPS : { Value : 25, Unit : 'Char/s' },
  ParamExtendToCPS : { Value : 20, Unit : 'Char/s' },
  ParamMinBlank : { Value : 120, Unit : 'ms' },
  ParamMaxStartMove : { Value : 250, Unit : 'ms', Description : 'Décalage maximum du début du sous-titre s\'il n\'y a pas assez de place pour décaler la fin'  },

  // ----- HasError method called for each subtitle during the error checking -----
  // If there is an error on CurrentSub return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    Duration = CurrentSub.Stop - CurrentSub.Start;
    CharPerSec = (CurrentSub.StrippedText.length * 1000) / Duration;
    if (CharPerSec > this.ParamMaxCPS.Value) {
    	return (Math.round(CharPerSec) + ' ' + this.ParamMaxCPS.Unit);
    } else {
    	return '';
    }
  },



  FixError : function(CurrentSub, PreviousSub, NextSub) {
    Duration = CurrentSub.Stop - CurrentSub.Start;
    CharPerSec = (CurrentSub.StrippedText.length * 1000) / Duration;
		// not the last sub...
		if(NextSub != null){
			while(CharPerSec > this.ParamExtendToCPS.Value 
				  && (NextSub.Start - CurrentSub.Stop) > this.ParamMinBlank.Value){
				CurrentSub.Stop +=1; 	
				Duration = CurrentSub.Stop - CurrentSub.Start;
				CharPerSec = (CurrentSub.StrippedText.length * 1000) / Duration;
			}
			//move the sub start if necessary
			if(CharPerSec > this.ParamExtendToCPS.Value){
				var totalMoved = 0;
				while(CharPerSec > this.ParamExtendToCPS.Value
				  && (CurrentSub.Start - PreviousSub.Stop) > this.ParamMinBlank.Value
				  && totalMoved <= this.ParamMaxStartMove.Value){
					CurrentSub.Start --;
					totalMoved ++;
					Duration = CurrentSub.Stop - CurrentSub.Start;
					CharPerSec = (CurrentSub.StrippedText.length * 1000) / Duration;
				}
			}
		}
		// last sub...
		else {
			while(CharPerSec > this.ParamExtendToCPS.Value){
				CurrentSub.Stop +=1; 	
				Duration = CurrentSub.Stop - CurrentSub.Start;
				CharPerSec = (CurrentSub.StrippedText.length * 1000) / Duration;
			}
			//move the sub start if necessary
			if(CharPerSec > this.ParamExtendToCPS.Value){
				var totalMoved = 0;
				while(CharPerSec > this.ParamExtendToCPS.Value
				  && (CurrentSub.Start - PreviousSub.Stop) > this.ParamMinBlank.Value
				  && totalMoved <= this.ParamMaxStartMove.Value){
					CurrentSub.Start --;
					totalMoved ++;
					Duration = CurrentSub.Stop - CurrentSub.Start;
					CharPerSec = (CurrentSub.StrippedText.length * 1000) / Duration;
				}
			}
		}
    if (NextSub == null) {
      return '';
    }
  }
}
