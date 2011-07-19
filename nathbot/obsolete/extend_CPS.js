// Extend CPS
// by Nathbot

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'Extend CPS 2',
  Description : 'An error is detected when the number of Char/s is strictly '+
  	'superior to the specified value. The fixer will extend the duration of the subtitle without overlapping the next one.',
  Color : 0xC91191,
  Message : 'Subtitle CPS is too fast:',

  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----
  ParamMaxCPS : { Value : 25, Unit : 'Char/s' },
  ParamMaxStartMove : { Value : 250, Unit : 'ms', Description : 'Maximum delay of the subtitle start if there is not enough space to delay the subtitle end'  },

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
	var scTiming = SceneChange.GetNext(CurrentSub.Stop);
	var totalCPStart = scTiming - SceneChange.StartOffset;
	var totalCPEnd = scTiming + SceneChange.StopOffset

		// not the last sub...
		if(NextSub != null){
			while(CharPerSec > VSSCore.CpsTarget 
				  && (NextSub.Start - CurrentSub.Stop) > VSSCore.MinimumBlank
				  && CurrentSub.Stop < (totalCPStart-1)){
				CurrentSub.Stop +=1;
				Duration = CurrentSub.Stop - CurrentSub.Start;
				CharPerSec = (CurrentSub.StrippedText.length * 1000) / Duration;
			}
			//move the sub start if necessary
			if(CharPerSec > VSSCore.CpsTarget){
				var scTiming2 = SceneChange.GetPrevious(CurrentSub.Start);
				var totalCPStart2 = scTiming2 - SceneChange.StartOffset;
				var totalCPEnd2 = scTiming2 + SceneChange.StopOffset
				var totalMoved = 0;
				while(CharPerSec > VSSCore.CpsTarget
				  && (CurrentSub.Start - PreviousSub.Stop) > VSSCore.MinimumBlank
				  && CurrentSub.Start > (totalCPEnd2+1)
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
			while(CharPerSec > VSSCore.CpsTarget){
				CurrentSub.Stop +=1; 	
				Duration = CurrentSub.Stop - CurrentSub.Start;
				CharPerSec = (CurrentSub.StrippedText.length * 1000) / Duration;
			}
			//move the sub start if necessary
			if(CharPerSec > VSSCore.CpsTarget){
				var scTiming2 = SceneChange.GetPrevious(CurrentSub.Start);
				var totalCPStart2 = scTiming2 - SceneChange.StartOffset;
				var totalCPEnd2 = scTiming2 + SceneChange.StopOffset
				var totalMoved = 0;
				while(CharPerSec > VSSCore.CpsTarget
				  && (CurrentSub.Start - PreviousSub.Stop) > VSSCore.MinimumBlank
				  && CurrentSub.Start > (totalCPEnd2+1)
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
