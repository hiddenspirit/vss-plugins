// Pas besoin de deux lignes
// Dapitch666 - Lords of kobol
// updated by Nathbot

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'No need for two lines',
  Description : 'Detects and fixes 2-lines subtitles that could be on one line.',
  Color : 0x663399,
  Message : 'No need for two lines :',

  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----
  ParamMaxPerLine : { Value : 35, Unit : 'Characters', Description : 'Maximum number of characters if the subtitle was on one line'},
  ParamDetectWithPunct : { Value : 1, Unit : '(0/1)', Description : 'Mode 0: if the first line ends with punctuation (.!?), no error is detected.\nMode 1: detects an error in any case.'},

HasError : function(CurrentSub, PreviousSub, NextSub) {
  	var SubText = CurrentSub.StrippedText;
  	var LineArray = SubText.split('\r\n');
  	var LineArrayLen = LineArray.length;
  	//var LastChar = '';
  	var LineLen = 0;
  	var TotalLen = 0;
	var punctuation = /([\?\.\!]+)$/;
  	if (LineArrayLen > 1 && !CurrentSub.Text.match(/^\s*-/mg))
  	{
  		for(i=0; i < LineArrayLen; i++)
  		{
  			LineLen = LineArray[i].length;
  			TotalLen += LineLen+1;
  		}
  		TotalLen = TotalLen - 1;
    	if (TotalLen  <= this.ParamMaxPerLine.Value)
    	{
    		if(this.ParamDetectWithPunct.Value == 0 && LineArray[0].match(punctuation)){
				return ('');
    		} else {
				return (TotalLen + ' ' + this.ParamMaxPerLine.Unit);    		
			}
    	}
    	else
    	{
    		return '';
    	}
    } else {
    	return '';
    }
  },

FixError : function(CurrentSub, PreviousSub, NextSub) {
	var SubText = CurrentSub.Text;
  	var LineArray = SubText.split('\r\n');
  	var LineArrayLen = LineArray.length;
	var Texte = '';
	for(i=0; i < LineArrayLen; i++)
	{
  		Texte += LineArray[i] + ' ';
    }
    CurrentSub.Text = Texte.substr (0, Texte.length - 1);
}
}
