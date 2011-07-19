// Very close to scene change by Nathbot

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'Very close to scene change',
  Description : 'Test.',
  Color : 0xffe4db, 
  Message : 'Very close to scene change',
  
  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----
  ParamMS : { Value : 10, Unit : 'ms'},

  // ----- HasError method called for each subtitle during the error checking -----
  // If there is an error on CurrentSub return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    // Get the scene change previous to the start time
    var scTiming1 = SceneChange.GetPrevious(CurrentSub.Start);
    var scEnd1 = scTiming1 + SceneChange.StopOffset;
    if (CurrentSub.Start-scEnd1 < this.ParamMS.Value && CurrentSub.Start-scEnd1 > 0) {
      return 'on start : ' + (CurrentSub.Start-scEnd1) + 'ms';
    }
	  
	  // Get the scene change next to the stop time
    var scTiming3 = SceneChange.GetNext(CurrentSub.Stop);
    var scStart3 = scTiming3 - SceneChange.StartOffset;
    if (scStart3 - CurrentSub.Stop < this.ParamMS.Value && scStart3 - CurrentSub.Stop>0) {
      return 'on stop : ' + (scStart3 - CurrentSub.Stop) + 'ms';
    }
    return '';
  },
  
  FixError : function(CurrentSub, PreviousSub, NextSub) {
    var backupStart = CurrentSub.Start;
    var backupStop = CurrentSub.Stop;
    
    // Get the scene change previous to the start time
    var scTiming1 = SceneChange.GetPrevious(CurrentSub.Start);
    var scEnd1 = scTiming1 + SceneChange.StopOffset;
    if (CurrentSub.Start-scEnd1 < this.ParamMS.Value && CurrentSub.Start-scEnd1 > 0) {
		if(PreviousSub == null || (CurrentSub.Start - (CurrentSub.Start-scEnd1)) - PreviousSub.Stop >= VSSCore.MinimumBlank){
			CurrentSub.Start -= (CurrentSub.Start-scEnd1);
		}
    }
	  
	  // Get the scene change next to the stop time
    var scTiming3 = SceneChange.GetNext(CurrentSub.Stop);
    var scStart3 = scTiming3 - SceneChange.StartOffset;
    if (scStart3 - CurrentSub.Stop < this.ParamMS.Value && scStart3 - CurrentSub.Stop>0) {
		if(NextSub == null || NextSub.Start - (CurrentSub.Stop + (scStart3 - CurrentSub.Stop)) >= VSSCore.MinimumBlank){
			CurrentSub.Stop += (scStart3 - CurrentSub.Stop);
		}
    }
  }
};