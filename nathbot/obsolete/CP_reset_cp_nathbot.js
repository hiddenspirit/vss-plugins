// Reset CP
// by Nathbot

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'CP - Suppression de tous les changements de plan.',
  Color : 0xb9a492, 
  Description : 'Donne à tous les changements de plan le timing 00:00,000 --> 00:00,001. Après avoir utilisé ce plugin, sauvegarder-fermer-relancer, pour voir le résultat.',
  Message : 'Changement de plan',
  
  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----
  ParamKeyFrameIdentifier : { Value : '~', Unit : '' },

  // ----- HasError method called for each subtitle during the error checking -----
  // If there is an error on CurrentSub return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    if (CurrentSub.Text == this.ParamKeyFrameIdentifier.Value) {
    	return '"Fix error" to set timing to zero';
    } else {
    	return '';
    }
  },
  
  FixError : function(CurrentSub, PreviousSub, NextSub) {
		CurrentSub.Start = 0;
		CurrentSub.Stop = 1;
  }
}
