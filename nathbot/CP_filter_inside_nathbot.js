// Filter Inside plugin by Nathbot

VSSPlugin = {
	// ----- Plugin constant -----
	Name : 'Too close to filter zone',
	Description : 'Detect subtitles that are too close from a "Filter Inside Subtitle" zone.',
	Color : 0xFF99B3, 
	Message : 'Subtitle too close to filter zone',
	
	// ----- Plugin parameters available from VSS GUI (name must start with "Param") -----
	
	// ----- HasError method called for each subtitle during the error checking -----
	// If there is an error on CurrentSub return a string containing the error description.
	// Otherwise return an empty string.
	// Don't forget that PreviousSub and NextSub can be null
	HasError : function(CurrentSub, PreviousSub, NextSub) {
		var subtitleContainsSceneChange = SceneChange.Contains(
		  CurrentSub.Start - SceneChange.StartOffset,
		  CurrentSub.Stop + SceneChange.StopOffset);
		if (!subtitleContainsSceneChange) {
		  return '';
		}
	
		var durMS = 0;
	
		// Check for scene change around start time
		// Get the scene change next to the start time
		var scTiming1 = SceneChange.GetNext(CurrentSub.Start);//timing of the scene change
		var scStart1 = scTiming1 - SceneChange.StartOffset;// start of the "scene change zone"
		
		if(CurrentSub.Start < scStart1 && scTiming1 - CurrentSub.Start < SceneChange.FilterOffset){
			return 'on start - only '+ (scTiming1 - CurrentSub.Start) + 'ms';
		}
		  
		// Check for scene change around stop time	  
		// Get the scene change previous to the stop time
		var scTiming2 = SceneChange.GetPrevious(CurrentSub.Stop);
		var scEnd2 = scTiming2 + SceneChange.StopOffset;
	
		if(CurrentSub.Stop > scEnd2 && CurrentSub.Stop - scTiming2 < SceneChange.FilterOffset){
			return 'on stop - only '+ (CurrentSub.Stop - scTiming2) + 'ms'
		}
		
		return '';
	}, 

	FixError : function(CurrentSub, PreviousSub, NextSub) {
		var subtitleContainsSceneChange = SceneChange.Contains(
		  CurrentSub.Start - SceneChange.StartOffset,
		  CurrentSub.Stop + SceneChange.StopOffset);
		if (!subtitleContainsSceneChange) {
		  return;
		}

		var Message = "";

		var first_start = CurrentSub.Start;
		var first_stop= CurrentSub.Stop;

		// current length, duration
		var len = CurrentSub.StrippedText.length;
		var durMS = CurrentSub.Stop - CurrentSub.Start;     // in milliseconds
		var dur = Math.round(durMS/100) / 10; // in seconds, rounded to 1 decimal digit
		// compute Lavie duration
		var ParamIdealReadingSpeed = 20;
		var durLavie = 0.5 + len / ParamIdealReadingSpeed;
		durLavie = Math.round(durLavie*10) / 10;
		
		// Get the scene change next to the start time
		var scTiming1 = SceneChange.GetNext(CurrentSub.Start);//timing of the scene change
		var scStart1 = scTiming1 - SceneChange.StartOffset;// start of the "scene change zone"
		var scEnd1 = scTiming1 + SceneChange.StopOffset;// end of the "scene change zone"
		//if the problem is on start...
		if(CurrentSub.Start < scStart1 && scTiming1 - CurrentSub.Start < SceneChange.FilterOffset){
			//try to move the sub start after the scene change
			CurrentSub.Start = scEnd1;
			// reading speed
			durMS = CurrentSub.Stop - CurrentSub.Start;
			var rsMin = 5;
			var rsMax = 35;
			var rsX = len * 1000 / (durMS - 500);
			var rs = Math.round(rsX*10) / 10;
			//if the subtitle becomes TOO FAST!, cancel
			if (rs<0 || rs >= 35) {
				CurrentSub.Start = first_start;
			}
		}

		// Get the scene change previous to the stop time
		var scTiming2 = SceneChange.GetPrevious(CurrentSub.Stop);
		var scStart2 = scTiming2 - SceneChange.StartOffset;
		var scEnd2 = scTiming2 + SceneChange.StopOffset;
	
		//if the problem is on stop...
		if(CurrentSub.Stop > scEnd2 && CurrentSub.Stop - scTiming2 < SceneChange.FilterOffset){
			//try to move the sub end before the scene change
			CurrentSub.Stop = scStart2;
			// reading speed
			durMS = CurrentSub.Stop - CurrentSub.Start;
			var rsMin = 5;
			var rsMax = 35;
			var rsX = len * 1000 / (durMS - 500);
			var rs = Math.round(rsX*10) / 10;
			//if the subtitle becomes TOO FAST!, cancel
			if (rs<0 || rs >= 35) {
				CurrentSub.Stop = first_stop;
			}
		}
		return;

	}

};