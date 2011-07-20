// Overlapping
// (christophe.paris <at> free.fr)
// extended by Nathbot

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'Overlapping & minimum blank 2',
  Description : 'Détecte les overlaps et les blancs trop petits. Mode 1- décale équitablement le ST précédant et le ST suivant le blanc. 2- ne décale que le ST précédent le blanc. 3- ne décale que le ST suivant le blanc.',
  Color : 0xFF3737, 
  Message : 'Subtitle overlap on next subtitle :',
  
  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----
  //ParamFixableOverlap : { Value : 100, Unit : 'ms' },
  ParamMinBlank : { Value : 120, Unit : 'ms' },
  ParamMode : { Value : 2, Unit : '(1/2/3)' },
  ParamIgnoreCP : { Value : 1, Unit : '(0/1)' },
  ParamCPidentifier : { Value : '~', Unit : '' },

  // ----- HasError method called for each subtitle during the error checking -----
  // If there is an error on CurrentSub return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    if (NextSub == null) {
      return '';
    }
    // ignorer changements de plans...
    if(this.ParamIgnoreCP.Value == 1){
		if(CurrentSub.Text == this.ParamCPidentifier.Value
		|| NextSub.Text == this.ParamCPidentifier.Value) return '';
    }
    var OverlapInMs = NextSub.Start - CurrentSub.Stop;
    if ((OverlapInMs > 0) && (OverlapInMs >= this.ParamMinBlank.Value)) {
      return '';
    }
    if (OverlapInMs < 0) {
      return (-OverlapInMs) + 'ms overlap';
    }
    return 'blank is only ' + OverlapInMs + 'ms';
  },
  
  FixError : function(CurrentSub, PreviousSub, NextSub) {
    if (NextSub == null) {
      return '';
    }
    var OverlapInMs = NextSub.Start - CurrentSub.Stop;
    if (OverlapInMs > 0 && OverlapInMs > this.ParamMinBlank.Value) {
      return '';
    }
    switch(this.ParamMode.Value){
		case 1:
			// Fix the overlap by dividing it by 2
			var MiddlePoint = (CurrentSub.Stop + (OverlapInMs / 2))
			var HalfOffset = (this.ParamMinBlank.Value / 2);
			CurrentSub.Stop = MiddlePoint - HalfOffset;
			NextSub.Start = CurrentSub.Stop + this.ParamMinBlank.Value;
		break;
		
		case 2:
			// décaler uniquement le ST précédent le blanc
			var Required = this.ParamMinBlank.Value - OverlapInMs;
			CurrentSub.Stop -= Required;
		break;
		
		case 3:
			//décaler uniquement le ST suivant le blanc
			var Required = this.ParamMinBlank.Value - OverlapInMs;
			NextSub.Start += Required;
		break;
	}
  }
}
