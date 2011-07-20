// Single-quoted italics
// by Nathbot

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'Single-quoted italics',
  Description : 'Detects single-quoted subtitles that should be in italic instead',
  Color : 0x00FF00,
  Message : 'Single-quoted italic:',

  // ----- HasError method called for each subtitle during the error checking -----
  // If there is an error on CurrentSub return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    if(CurrentSub.Text.substr(0,1)=="'" && CurrentSub.Text.substr(CurrentSub.Text.length-1,CurrentSub.Text.length)=="'"){
		return ' yeah baby';
    } else {
		return '';
    }
  },



  FixError : function(CurrentSub, PreviousSub, NextSub) {
	var oldText = CurrentSub.Text;
	var tmpText = oldText.substr(1, oldText.length-2);
	tmpText = '<i>'+tmpText+'</i>';
	CurrentSub.Text = tmpText;
  }
}