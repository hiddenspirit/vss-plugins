// CP non pertinents
// par Nathbot

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'CP - Correction cp non pertinents',
  Description : 'Les changements de plan entrainant un overlap supérieur à la durée standard d\'un overlap (ou la durée indiquée) se voient attribuée le timing 00:00,000 --> 00:00,001. Après avoir utilisé ce plugin, sauvegarder-fermer-relancer, pour voir le résultat.',
  Color : 0x633E4B, 
  Message : 'CP non pertinent',
  
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
    if (OverlapInMs < (0 - this.ParamMaxOverlapCP.Value) && 
		(CurrentSub.Text == this.ParamKeyFrameIdentifier.Value || NextSub.Text == this.ParamKeyFrameIdentifier.Value)) {
		return (-OverlapInMs) + 'ms overlap';
    } else {
      return '';
    }
  },
  
  FixError : function(CurrentSub, PreviousSub, NextSub) {
    var OverlapInMs = NextSub.Start - CurrentSub.Stop;
    if (OverlapInMs > 0 && OverlapInMs > this.ParamMinBlank.Value) {
      return '';
    }
    //check which sub is the CP: left one or right one?
    //if it is the left one...
	if (CurrentSub.Text == this.ParamKeyFrameIdentifier.Value){
		//if the overlap is too big, set the CP timing to zero
		if (OverlapInMs < (0 - this.ParamMaxOverlapCP.Value)) {
			CurrentSub.Start = 0;
			CurrentSub.Stop = 1;
		} else return '';
	} else if (NextSub.Text == this.ParamKeyFrameIdentifier.Value){
		//if the overlap is too big, set the CP timing to zero
		if (OverlapInMs < (0 - this.ParamMaxOverlapCP.Value)) {
			NextSub.Start = 0;
			NextSub.Stop = 1;
		} else return '';
	} else return '';
  }
}
