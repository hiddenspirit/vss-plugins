// Two short subtitles
// by Nathbot (nathbot <at> gmail.com)

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'Too short subtitles',
  Description : 'Detects subtitles whose duration is strictly inferior to the minimum duration.',
  Color : 0x00C437,
  Message : 'Subtitles are too short:',

  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----
  ParamMaxStartMove : { Value : 0, Unit : 'ms', Description : 'Maximum delay of the subtitle start if there is not enough space to delay the subtitle end' },
  ParamStrictMinimum : { Value : 800, Unit : 'ms', Description : 'Strict minimum limit underwhich a subtitle is considered as definitely too short.' },
  ParamDetectAcceptable : { Value : 1, Unit : '0/1', Description : '1 = Detects Unacceptable AND Acceptable. 2 = Detects only Unacceptable' },

  // ----- HasError method called for each subtitle during the error checking -----
  // If there is an error on CurrentSub return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    Duration = CurrentSub.Stop - CurrentSub.Start;
    CharPerSec = (CurrentSub.StrippedText.length * 1000) / Duration;
    if (Duration < this.ParamStrictMinimum.Value) {
		return (Duration + ' ms --> Unacceptable');
	} else if(Duration < VSSCore.MinimumDuration && this.ParamDetectAcceptable.Value == 1){
		return (Duration + ' ms --> Acceptable, but try to fix');
	} 
	else {
		return '';
	}
	
  },



  FixError : function(CurrentSub, PreviousSub, NextSub) {
	var Duration = CurrentSub.Stop - CurrentSub.Start;
	
	//scene changes
	var scTiming = SceneChange.GetNext(CurrentSub.Stop);
	var totalCPStart = scTiming - SceneChange.StartOffset;
	var totalCPEnd = scTiming + SceneChange.StopOffset

	var scTiming2 = SceneChange.GetPrevious(CurrentSub.Start);
	var totalCPStart2 = scTiming2 - SceneChange.StartOffset;
	var totalCPEnd2 = scTiming2 + SceneChange.StopOffset

	// not the last sub...
	if(NextSub != null){
		while(Duration < VSSCore.MinimumDuration 
			  && (NextSub.Start - CurrentSub.Stop) > VSSCore.MinimumBlank
			  && CurrentSub.Stop < (totalCPStart-1)){
			CurrentSub.Stop ++; 	
			Duration = CurrentSub.Stop - CurrentSub.Start; // in milliseconds
		}
		
		//move the sub start if necessary
		if(Duration < VSSCore.MinimumDuration){
			var scTiming2 = SceneChange.GetPrevious(CurrentSub.Start);
			var totalCPStart2 = scTiming2 - SceneChange.StartOffset;
			var totalCPEnd2 = scTiming2 + SceneChange.StopOffset
			var totalMoved = 0;
			var previousNull = 0;
			if(PreviousSub == null){
				previousNull = 1;
			}
			while(Duration < VSSCore.MinimumDuration 
			  && (previousNull == 1 || (CurrentSub.Start - PreviousSub.Stop) > VSSCore.MinimumBlank)
			  && CurrentSub.Start > (totalCPEnd2)
			  && totalMoved <= this.ParamMaxStartMove.Value){
				CurrentSub.Start --;
				totalMoved ++;
				Duration = CurrentSub.Stop - CurrentSub.Start; // in milliseconds
			}
		}
	}
	// last sub...
	else {
		while(Duration < VSSCore.MinimumDuration && CurrentSub.Stop < (totalCPStart)){
			CurrentSub.Stop ++; 	
			Duration = CurrentSub.Stop - CurrentSub.Start; // in milliseconds
		}
		//move the sub start if necessary
		if(Duration < VSSCore.MinimumDuration){
			var scTiming2 = SceneChange.GetPrevious(CurrentSub.Start);
			var totalCPStart2 = scTiming2 - SceneChange.StartOffset;
			var totalCPEnd2 = scTiming2 + SceneChange.StopOffset
			var totalMoved = 0;
			while(Duration < VSSCore.MinimumDuration 
			  && (CurrentSub.Start - PreviousSub.Stop) > VSSCore.MinimumBlank
			  && CurrentSub.Start > (totalCPEnd2)
			  && totalMoved <= this.ParamMaxStartMove.Value){
				CurrentSub.Start --;
				totalMoved ++;
				Duration = CurrentSub.Stop - CurrentSub.Start; // in milliseconds
			}
		}
	}
  }
}