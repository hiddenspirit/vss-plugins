// Trop de lignes
// Dapitch666 - Lords of kobol

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'Too many lines',
  Description : 'Detects and fixes subtitless which contain more than X lines.',
  Color : 0x009933,
  Message : 'Too many lines:',

  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----
  ParamMaxNbLines : { Value : 2, Unit : 'Lines' },

HasError : function(CurrentSub, PreviousSub, NextSub) {
  	var SubText = CurrentSub.StrippedText;
  	var LineArray = SubText.split('\r\n');
  	var LineArrayLen = LineArray.length;
  	if (LineArrayLen > this.ParamMaxNbLines.Value)
  	{
  		return (LineArrayLen + ' ' + this.ParamMaxNbLines.Unit);
    } else {
    	return '';
    }
  },

FixError : function(CurrentSub, PreviousSub, NextSub) {
	var SubText = CurrentSub.StrippedText;
  	var LineArray = SubText.split('\r\n');
  	var LineArrayLen = LineArray.length;
	var Texte = '';
	for(i=0; i < LineArrayLen; i++)
	{
  		Texte += LineArray[i] + ' ';
    }
    CurrentSub.StrippedText = Texte.substr (0, Texte.length - 1);
}
}
