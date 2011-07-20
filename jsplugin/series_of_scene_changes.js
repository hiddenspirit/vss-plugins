// Series of scene changes plugin by Nathbot

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'Series of scene changes',
  Description : 'Detect subtitles that go over ' +
    'more than the specified number of scene changes.',
  Color : 0xffe4db,
  Message : 'Too many overlapped scene changes',
  ParamMaxSceneChanges : { Value : 2, Unit : 'scene changes', Description :
    'Maximum number of overlapped scene changes (default: 2).'},

  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----

  // ----- HasError method called for each subtitle during the error checking -----
  // If there is an error on CurrentSub return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    // Exit if there is no scene changes.
    var startSearch = CurrentSub.Start + 1;
    var stopSearch = CurrentSub.Stop - 1;
    if (!SceneChange.Contains(startSearch, stopSearch)) {
        return '';
    }

    // Get the scene change next to the start time.
    var scTiming = SceneChange.GetNext(startSearch);

    for (var scCount = 1; scCount <= this.ParamMaxSceneChanges.Value;
        ++scCount)
    {
        scTiming = SceneChange.GetNext(scTiming + 1);

        if (scTiming < 0 || scTiming > stopSearch) {
            return '';
        }
    }

    return 'more than ' + this.ParamMaxSceneChanges.Value;
  }
};
