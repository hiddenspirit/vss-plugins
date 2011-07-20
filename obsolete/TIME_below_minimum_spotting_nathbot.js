// below minimum spotting
// by Nathbot

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'Sous-titres trop courts',
  Description : 'Une erreur est détectée quand la durée du st est strictement inférieure à ParamMinDuration.',
  Color : 0x00C437,
  Message : 'Les sous-titres sont trop courts :',

  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----
  ParamMinDuration : { Value : 1000, Unit : 'ms' },
  ParamNbCarSmall : { Value : 7, Unit : 'car' },
  ParamMinDurationSmall : { Value : 800, Unit : 'ms' },
  ParamMinBlank : { Value : 120, Unit : 'ms' },

  // ----- HasError method called for each subtitle during the error checking -----
  // If there is an error on CurrentSub return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    Duration = CurrentSub.Stop - CurrentSub.Start;
    CharPerSec = (CurrentSub.StrippedText.length * 1000) / Duration;
    if(CurrentSub.StrippedText.length > this.ParamNbCarSmall.Value){
		if (Duration < this.ParamMinDuration.Value) {
			return (Duration + ' ' + this.ParamMinDuration.Unit);
		} else {
			return '';
		}
	} else {
		if (Duration < this.ParamMinDurationSmall.Value) {
			return (Duration + ' ' + this.ParamMinDurationSmall.Unit+ ' - small');
		} else {
			return '';
		}
	}
  },



  FixError : function(CurrentSub, PreviousSub, NextSub) {
	Duration = CurrentSub.Stop - CurrentSub.Start;
    if(CurrentSub.StrippedText.length > this.ParamNbCarSmall.Value){
		CurrentSub.Stop = CurrentSub.Stop + (this.ParamMinDuration.Value - Duration); 
    } else {
		CurrentSub.Stop = CurrentSub.Stop + (this.ParamMinDurationSmall.Value - Duration); 
    }
    if (NextSub == null) {
      return '';
    }
    if(NextSub.Start < CurrentSub.Stop){
		CurrentSub.Stop = NextSub.Start - this.ParamMinBlank.Value;
    }		
  }
}