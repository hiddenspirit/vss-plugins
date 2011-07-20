// CP pertinents
// par Nathbot

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'CP - Correction cp pertinents',
  Description : 'Correction des changements de plan entrainant un overlap inférieur à la durée standard d\'un overlap.',
  Color : 0xffe4db, 
  Message : 'Overlap avec un CP pertinent',
  
  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----
  ParamMaxOverlapCP : { Value : 250, Unit : 'ms' },
  ParamKeyFrameIdentifier : { Value : '~', Unit : '' },

  // ----- HasError method called for each subtitle during the error checking -----
  // If there is an error on CurrentSub return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    if (NextSub == null) {
      return '';
    }
    var OverlapInMs = NextSub.Start - CurrentSub.Stop;
    if (OverlapInMs > 0) {
      return '';
    }
    if (OverlapInMs > (0 - this.ParamMaxOverlapCP.Value) && 
		(CurrentSub.Text == this.ParamKeyFrameIdentifier.Value || NextSub.Text == this.ParamKeyFrameIdentifier.Value)) {
		return (-OverlapInMs) + 'ms overlap';
    } else {
      return '';
    }
  },
  
  FixError : function(CurrentSub, PreviousSub, NextSub) {
    if (NextSub == null) {
      return '';
    }
    var OverlapInMs = NextSub.Start - CurrentSub.Stop;
    if (OverlapInMs > 0) {
      return '';
    }
    
    //check which sub is the CP: left one or right one?
    //if it is the left one...
    if (CurrentSub.Text == this.ParamKeyFrameIdentifier.Value){
		//if the overlap is too big, set the CP timing to zero
		if (OverlapInMs > (0 - this.ParamMaxOverlapCP.Value)) {
			// the "left sub" is a keyframe, we only modify the "right sub"
			NextSub.Start = CurrentSub.Stop + 1;
		} else {
			return '';
		}
	} else if (NextSub.Text == this.ParamKeyFrameIdentifier.Value){
		//if the overlap is too big, set the CP timing to zero
		if (OverlapInMs > (0 - this.ParamMaxOverlapCP.Value)) {
			// the "right sub" is a keyframe, we only modify the "left sub"
			CurrentSub.Stop = NextSub.Start - 1;
		} else return '';
	} else return '';
  }
}
