// too fast
// by Nathbot

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'TOO FAST subtitle',
  Description : 'Detects and fixes fast subtitles so they reach the "perfect" speed',
  Color : 0xFFA884,
  Message : 'Speed :',

  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----
  //ParamIdealReadingSpeed: { Value : 20, Unit : 'Char/s' },
  ParamLevel : { Value : 1, Unit : '(1/2/3/4)', Description: 'Level 1 = "TOO FAST" only, 2 = "TOO FAST" + "Fast, acceptable", 3 = from "TOO FAST" to "A bit fast", 4 = from "good" to "TOO FAST"'},
  ParamMaxStartMove : { Value : 250, Unit : 'ms', Description : 'Maximum delay of the subtitle start if there is not enough space to delay the subtitle end' },
  ParamTryOverSC : { Value : 0, Unit : '0/1', Description : 'When set to 1: if the reading speed is still not perfect, try to move the sub end after the scene change. If it\'s still not enough, cancel' },
 
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
    if (rs < rsMin && rs>0)   rating = "TOO SLOW!";
    else if (rs < 10 && rs>0) rating = "Slow, acceptable.";
    else if (rs < 13 && rs>0) rating = "A bit slow.";
    else if (rs < 15 && rs>0) rating = "Good.";
    else if (rs < 23 && rs>0) rating = "Perfect.";
    else if (rs < 27 && rs>0) rating = "Good.";
    else if (rs < 31 && rs>0) rating = "A bit fast.";
    else if (rs < 35 && rs>0) rating = "Fast, acceptable.";
    else              rating = "TOO FAST!";

	// compute Lavie duration
    var ParamIdealReadingSpeed = 20;
    var durLavie = 0.5 + len / ParamIdealReadingSpeed;
    durLavie = Math.round(durLavie*10) / 10;

	//level
	switch(this.ParamLevel.Value){
		//4 = TOO FAST + "Fast, acceptable" + "A bit fast" + "good"
		case 4:
			if (rs<0 || (rs >= 23 && rs < 27) || (rs >= 27 && rs < 31) || (rs >= 31 && rs < 35) || (rs >= 35)) {
				return (rating+' - '+dur + ' s (ideal : ' + durLavie+')');
			}
			else {
				return '';
			}
		//3 = TOO FAST + "Fast, acceptable" + "A bit fast"
		case 3:
			if (rs<0 || (rs >= 27 && rs < 31) || (rs >= 31 && rs < 35) || (rs >= 35)) {
				return (rating+' - '+dur + ' s (ideal : ' + durLavie+')');
			}
			else {
				return '';
			}
		//2 = TOO FAST + "Fast, acceptable"
		case 2:
			if (rs<0 || (rs >= 31 && rs < 35) || (rs >= 35)) {
				return (rating+' - '+dur + ' s (ideal : ' + durLavie+')');
			}
			else {
				return '';
			}
		//1 = TOO FAST
		default:
			if (rs<0 || rs >= 35) {
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

		var scTiming = SceneChange.GetNext(CurrentSub.Stop);
		var totalCPStart = scTiming - SceneChange.StartOffset;
		var totalCPEnd = scTiming + SceneChange.StopOffset
		// not the last sub...
		if(NextSub != null){
			while(dur < durLavie 
				  && (NextSub.Start - CurrentSub.Stop) > VSSCore.MinimumBlank
				  && CurrentSub.Stop < (totalCPStart-1)){
				CurrentSub.Stop ++; 	
				durMS = CurrentSub.Stop - CurrentSub.Start; // in milliseconds
				dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit
			}
			
			if(PreviousSub != null){
				//move the sub start if necessary
				if(dur < durLavie){
					var scTiming2 = SceneChange.GetPrevious(CurrentSub.Start);
					var totalCPStart2 = scTiming2 - SceneChange.StartOffset;
					var totalCPEnd2 = scTiming2 + SceneChange.StopOffset
					var totalMoved = 0;
					while(dur < durLavie 
					  && (CurrentSub.Start - PreviousSub.Stop) > VSSCore.MinimumBlank
					  && CurrentSub.Start > (totalCPEnd2+1)
					  && totalMoved <= this.ParamMaxStartMove.Value){
						CurrentSub.Start --;
						totalMoved ++;
						durMS = CurrentSub.Stop - CurrentSub.Start; // in milliseconds
						dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit					
					}
					//if the reading speed is still not perfect, we check if it's possible to move the sub end after a scene change
					if(this.ParamTryOverSC.Value == 1){
						if(dur < durLavie
							&& (NextSub.Start-CurrentSub.Stop) > VSSCore.MinimumBlank
							&& (NextSub.Start-CurrentSub.Stop) > (SceneChange.StartOffset+SceneChange.StopOffset+SceneChange.FilterOffset)){
							var _backupStop = CurrentSub.Stop;
							CurrentSub.Stop += (SceneChange.StartOffset+SceneChange.StopOffset+SceneChange.FilterOffset);
							dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit		
							while(dur < durLavie 
								  && (NextSub.Start - CurrentSub.Stop) > VSSCore.MinimumBlank){
								CurrentSub.Stop ++; 	
								durMS = CurrentSub.Stop - CurrentSub.Start; // in milliseconds
								dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit
							}
							dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit	
							//if it's still not enough, we cancel this
							if(dur < durLavie){
								CurrentSub.Stop = _backupStop;
							}	
						}
					}
				}
			} else {
			//first sub...
			//move the sub start if necessary
			if(dur < durLavie){
				var scTiming2 = SceneChange.GetPrevious(CurrentSub.Start);
				var totalCPStart2 = scTiming2 - SceneChange.StartOffset;
				var totalCPEnd2 = scTiming2 + SceneChange.StopOffset
				var totalMoved = 0;
				while(dur < durLavie 
				  && CurrentSub.Start > (totalCPEnd2+1)
				  && totalMoved <= this.ParamMaxStartMove.Value){
					CurrentSub.Start --;
					totalMoved ++;
					durMS = CurrentSub.Stop - CurrentSub.Start; // in milliseconds
					dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit					
				}
			}
			//if the reading speed is still not perfect, we check if it's possible to move the sub end after a scene change
			if(this.ParamTryOverSC.Value == 1){
				if(dur < durLavie
					&& (NextSub.Start-CurrentSub.Stop) > VSSCore.MinimumBlank
					&& (NextSub.Start-CurrentSub.Stop) > (SceneChange.StartOffset+SceneChange.StopOffset+SceneChange.FilterOffset)){
					var _backupStop = CurrentSub.Stop;
					CurrentSub.Stop += (SceneChange.StartOffset+SceneChange.StopOffset+SceneChange.FilterOffset);
					dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit		
					while(dur < durLavie 
						  && (NextSub.Start - CurrentSub.Stop) > VSSCore.MinimumBlank){
						CurrentSub.Stop ++; 	
						durMS = CurrentSub.Stop - CurrentSub.Start; // in milliseconds
						dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit
					}
					dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit	
					//if it's still not enough, we cancel this
					if(dur < durLavie){
						CurrentSub.Stop = _backupStop;
					}	
				}
			}
		}
		}
		// last sub...
		else {
			while(dur < durLavie && CurrentSub.Stop < (totalCPStart-1)){
				CurrentSub.Stop ++; 	
				durMS = CurrentSub.Stop - CurrentSub.Start; // in milliseconds
				dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit
			}
			//move the sub start if necessary
			if(dur < durLavie){
				var scTiming2 = SceneChange.GetPrevious(CurrentSub.Start);
				var totalCPStart2 = scTiming2 - SceneChange.StartOffset;
				var totalCPEnd2 = scTiming2 + SceneChange.StopOffset
				var totalMoved = 0;
				while(dur < durLavie 
				  && (CurrentSub.Start - PreviousSub.Stop) > VSSCore.MinimumBlank
				  && CurrentSub.Start > (totalCPEnd2+1)
				  && totalMoved <= this.ParamMaxStartMove.Value){
					CurrentSub.Start --;
					totalMoved ++;
					durMS = CurrentSub.Stop - CurrentSub.Start; // in milliseconds
					dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit					
				}
			}
			
			//if the reading speed is still not perfect, we check if it's possible to move the sub end after a scene change
			if(this.ParamTryOverSC.Value == 1){
				if(dur < durLavie){
					var _backupStop = CurrentSub.Stop;
					CurrentSub.Stop += (SceneChange.StartOffset+SceneChange.StopOffset+SceneChange.FilterOffset);
					dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit		
					while(dur < durLavie){
						CurrentSub.Stop ++; 	
						durMS = CurrentSub.Stop - CurrentSub.Start; // in milliseconds
						dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit
					}
					dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit	
					//if it's still not enough, we cancel this
					if(dur < durLavie){
						CurrentSub.Stop = _backupStop;
					}	
				}
			}
		}
	}
}