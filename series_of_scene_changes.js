// Series of scene changes plugin by Nathbot

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'Series of scene changes',
  Description : 'Detect subtitles that go over more than two scene changes.',
  Color : 0xffe4db, 
  Message : 'More than 2 scene changes overlapped',
  
  debug : false,
  
  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----

  // ----- HasError method called for each subtitle during the error checking -----
  // If there is an error on CurrentSub return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    
    // TODO : use SceneChange.FilterOffset
    
    var subtitleContainsSceneChange = SceneChange.Contains(
      CurrentSub.Start - SceneChange.StartOffset,
      CurrentSub.Stop + SceneChange.StopOffset);
    if (!subtitleContainsSceneChange) {
      return '';
    }
    
	  // Get the scene change next to the start time
    var scTimingStart = SceneChange.GetNext(CurrentSub.Start);
	  // Get the scene change previous to the stop time
    var scTimingStop = SceneChange.GetPrevious(CurrentSub.Stop);
	
    // Check if there is at least one scene change between the two (e.g. more than two scene changes)
    var scAfterStart = SceneChange.GetNext(scTimingStart+1);
    
    if(scAfterStart < scTimingStop){
      if(this.debug){
        ScriptLog('scTimingStart='+scTimingStart);
        ScriptLog('scAfterStart='+scAfterStart);
        ScriptLog('scTimingStop='+scTimingStop);
        ScriptLog('==============');
      }
      return 'try to fix';
     }
    else
      return '';
  }
};