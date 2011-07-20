// TOO FAST
// by Nathbot

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'TOO FAST subtitles',
  Description : 'Detects and fixes fast subtitles so they reach the "perfect" speed',
  Color : 0xFFA884,
  Message : 'Speed :',

  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----
  //ParamIdealReadingSpeed: { Value : 20, Unit : 'Char/s' },
  ParamLevel : { Value : 1, Unit : '(1/2/3/4)', Description: 'Level 1 = "TOO FAST" only, 2 = "TOO FAST" + "Fast, acceptable", 3 = from "TOO FAST" to "A bit fast", 4 = from "good" to "TOO FAST"'},
  ParamMaxStartMove : { Value : 0, Unit : 'ms', Description : 'Maximum delay of the subtitle start if there is not enough space to delay the subtitle end' },
  ParamMaxDuration : { Value : 3999, Unit : 'ms', Description : 'Maximum duration of the subtitle' },
 
  // ----- HasError method called for each subtitle during the error checking -----
  // If there is an error on CurrentSub return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null
  HasError : function(CurrentSub, PreviousSub, NextSub) {
	// current duration
    var durMS = CurrentSub.Stop - CurrentSub.Start;     // in milliseconds
    var dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit
    // display speed
    var ds = this.CalculateDisplaySpeed(CurrentSub);
    // reading speed
    var rs = this.CalculateRS(CurrentSub);
    // rating
    var rating = this.getLabel(rs);

	// compute Lavie duration
	var durLavie = this.CalculateDurLavie(CurrentSub);

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
		// reading speed
		var rs = this.CalculateRS(CurrentSub);
		var startingRS = rs;
		var startingLabel = this.getLabel(startingRS);
		// compute Lavie duration
		var durLavie = this.CalculateDurLavie(CurrentSub);

		var scTiming = SceneChange.GetNext(CurrentSub.Stop);
		var totalCPStart = scTiming - SceneChange.StartOffset;
		var totalCPEnd = scTiming + SceneChange.StopOffset
		
		var _backupStart = CurrentSub.Start;
		var _backupStop = CurrentSub.Stop;
		
		var nextNull = 0;
		if(NextSub == null){
			nextNull = 1;
		}	
		var previousNull = 0;
		if(PreviousSub == null){
			previousNull = 1;
		}		
		// STEP 1, try to extend to perfect
		
			
		// try to extend the subtitle until Perfect - only the END
		while(dur < durLavie 
			  && (nextNull==1 || (NextSub.Start - CurrentSub.Stop) > VSSCore.MinimumBlank)
			  && CurrentSub.Stop < (totalCPStart-1)
			  && durMS < this.ParamMaxDuration.Value){
			CurrentSub.Stop ++; 	
			durMS = CurrentSub.Stop - CurrentSub.Start; // in milliseconds
			dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit
		}
		
			
			// now, the point is to get rid of the TOO FAST (not necessarily to get Perfect).
			// so, if we're still in TOO FAST,
			// try to move the subtitle START using the MaxStartMove value.
			// if it respects scene changes and removes the TOO FAST, we keep this change.
			// else, we cancel the change.
			
			// if we're still in TOO FAST, and if there is a scene change after the end of the subtitle,
			// we calculate the duration with which we can extend the subtitle END.
			// if this duration is greater than the "Filter Inside Subtitle" value,
			// we extend the subtitle.
			// if not, we don't do anything and the subtitler will have to improve the subtitle text.
			
			if(dur < durLavie){
				// STEP 2: try to move the sub START...
				var scTiming2 = SceneChange.GetPrevious(CurrentSub.Start);
				var totalCPStart2 = scTiming2 - SceneChange.StartOffset;
				var totalCPEnd2 = scTiming2 + SceneChange.StopOffset;
				var totalMoved = 0;
				
				while(dur < durLavie 
				  && (previousNull == 1 || (CurrentSub.Start - PreviousSub.Stop) > VSSCore.MinimumBlank)
				  && CurrentSub.Start > (totalCPEnd2+1)
				  && totalMoved <= this.ParamMaxStartMove.Value
				  && durMS < this.ParamMaxDuration.Value){
					CurrentSub.Start --;
					totalMoved ++;
					durMS = CurrentSub.Stop - CurrentSub.Start; // in milliseconds
					dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit					
				}	
				rs = this.CalculateRS(CurrentSub);
				var rating = this.getLabel(rs);
				//ScriptLog('rating='+rating+' rs='+rs);

				
					
				//if the reading speed is not improved, cancel the change
					if(startingLabel==rating){
						CurrentSub.Start = _backupStart;
						
						if(this.ParamLevel.Value == 1)
						{
						
							// STEP 3
							var _backupStop2 = CurrentSub.Stop;
					
							// now, let's calculate the duration with which we can extend the subtitle END.
							var isThereSC = 0;
							var isThereSub = 0;
							
							var scTimingB = SceneChange.GetNext(CurrentSub.Stop);
							var totalCPStartB = scTimingB - SceneChange.StartOffset;
							var totalCPEndB = scTimingB + SceneChange.StopOffset;
							
							if(totalCPStartB == CurrentSub.Stop || totalCPStartB == CurrentSub.Stop+1){
								// this is a scene change right next to the subtitle.
								isThereSC = 1;
							} else if (!nextNull && NextSub.Start - CurrentSub.Stop == VSSCore.MinimumBlank){
								// there's a subtitle right after
								isThereSub = 1;
							}
							
							if(isThereSC == 1){
								minimumTiming = scTimingB + SceneChange.FilterOffset + 1;
								//if the minimum duration doesn't overlap the next minimum blank/subtitle...
								if(nextNull == 1 || (minimumTiming < (NextSub.Start-VSSCore.MinimumBlank))){
									CurrentSub.Stop = minimumTiming;
									var rs = this.CalculateRS(CurrentSub);
									
									var scTimingC = SceneChange.GetNext(CurrentSub.Stop);
									var totalCPStartC = scTimingC - SceneChange.StartOffset;
									var totalCPEndC = scTimingC + SceneChange.StopOffset;
									// now try to extend to perfect
									while(dur < durLavie 
										  && (nextNull==1 || (NextSub.Start - CurrentSub.Stop) > VSSCore.MinimumBlank)
										  && CurrentSub.Stop < (totalCPStartC-1)
										  && durMS < this.ParamMaxDuration.Value){
										CurrentSub.Stop ++;
										durMS = CurrentSub.Stop - CurrentSub.Start;
										dur = Math.round(durMS/100) / 10;	
									}
									//if the reading speed is still TOO FAST, cancel the change
									rs = this.CalculateRS(CurrentSub);
									if(rs < 0 || rs >= 35){
										CurrentSub.Stop = _backupStop2;
									}
								}
							//ScriptLog('isThereSC='+isThereSC+' totalCPStartB='+totalCPStartB+' CurrentSub.Stop='+CurrentSub.Stop+' minimumTiming='+minimumTiming);
							}
						}
					}
				
			}
		},

	CalculateRS : function (Subtitle){
		var durMS = Subtitle.Stop - Subtitle.Start;
		var rsX = Subtitle.StrippedText.length * 1000 / (Subtitle.Stop - Subtitle.Start - 500);
		var rs = Math.round(rsX*10) / 10;
		return rs;	
	},
	
	getLabel : function (rs){
		var rsMin = 5;
		var rsMax = 35;
		var rating;
		if (rs < rsMin && rs>0)   rating = "TOO SLOW!";
		else if (rs < 10 && rs>0) rating = "Slow, acceptable.";
		else if (rs < 13 && rs>0) rating = "A bit slow.";
		else if (rs < 15 && rs>0) rating = "Good.";
		else if (rs < 23 && rs>0) rating = "Perfect.";
		else if (rs < 27 && rs>0) rating = "Good.";
		else if (rs < 31 && rs>0) rating = "A bit fast.";
		else if (rs < rsMax && rs>0) rating = "Fast, acceptable.";
		else              rating = "TOO FAST!";
		return rating;
	},
	CalculateDurLavie : function(CurrentSub){
		var ParamIdealReadingSpeed = 20;
		var durLavie = 0.5 + CurrentSub.StrippedText.length / ParamIdealReadingSpeed;
		durLavie = Math.round(durLavie*10) / 10;
		return durLavie;
	
	},
	CalculateDisplaySpeed : function(CurrentSub){
		var len = CurrentSub.StrippedText.length;
		var durMS = CurrentSub.Stop - CurrentSub.Start;     // in milliseconds
		var dsMin = 4;
		var dsMax = 22;
		var dsX = len * 1000 / durMS;       // exact
		var ds = Math.round(dsX*10) / 10;   // rounded to 1 decimal digit
		return ds;
	}
}