// Starting dots
// by Nathbot

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'Useless dots',
  Description : 'Detects and fixes subtitles useless suspension dots.',
  Color : 0x0099cc,
  Message : 'Starting dots',

  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----

HasError : function(CurrentSub, PreviousSub, NextSub) {
  	if (CurrentSub.StrippedText.substr(0, 4) == "... ")
  	{
  		if(PreviousSub != null){
        if(PreviousSub.StrippedText.substr(PreviousSub.StrippedText.length-3, PreviousSub.StrippedText.length-1) == "..."){
          return '.';
         } else {
         return '';
         }
  		} else {
        return '';
      }
    } else {
    	return '';
    }
  },

FixError : function(CurrentSub, PreviousSub, NextSub) {
	//only fix when there's no tag
	if (CurrentSub.Text.substr(0, 4) == "... ")
  {
    CurrentSub.Text = CurrentSub.Text.substr(4, CurrentSub.Text.length-4);
  }
  if(PreviousSub.Text.substr(PreviousSub.Text.length-3, PreviousSub.Text.length-1) == "..."){
    PreviousSub.Text = PreviousSub.Text.substr(0, PreviousSub.Text.length-3)+",";
  }
}
}