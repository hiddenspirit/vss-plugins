// Too long line
// (christophe.paris <at> free.fr)
// v2 by nathbot (sept. 2008)
//
// Limitation : ignore dialogs,
//   tags are not ignored when splitting

var DebugMode = false;

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'Too long line',
  Description : 'An error is detected when the line length in a subtitle is '+
  	'strictly superior to the specified value. The "smart" line splitter will '+
  	'try to break the line in 2 according to this limitation.',
  Color : 0xFFFF37, 
  Message : 'Subtitle has a too long line :',

  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----
  ParamOneLineSubMax : { Value : 36, Unit : 'Characters', Description : "Maximum number of characters per line in a one line subtitle" },
  ParamTwoLinesSubMax : { Value : 40, Unit : 'Characters', Description : "Maximum number of characters per line in a two lines subtitle" },

  // ----- HasError method called for each subtitle during the error checking -----
  // If there is an error on CurrentSub return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null
  HasError : function(CurrentSub, PreviousSub, NextSub) {
  	var SubText = CurrentSub.StrippedText;
  	var MaxLineLen = 0;
  	var LineArray = SubText.split('\r\n');
  	var LineArrayLen = LineArray.length;
  	var LineLen = 0;
  	for(var i = 0; i < LineArrayLen; i++)
  	{
  		LineLen = LineArray[i].length;
  		if(LineLen > MaxLineLen)
  			MaxLineLen = LineLen;
  	}
    if (LineArrayLen == 1 && MaxLineLen  > this.ParamOneLineSubMax.Value) {
    	return (MaxLineLen + ' ' + this.ParamOneLineSubMax.Unit + '(1)');
    } else if (LineArrayLen == 2 && MaxLineLen  > this.ParamTwoLinesSubMax.Value) {
    	return (MaxLineLen + ' ' + this.ParamTwoLinesSubMax.Unit + '(2)');
    } 
    else {
    	return '';
    }
  },
    
  FixError : function(CurrentSub, PreviousSub, NextSub) {  	
  	var SubText = CurrentSub.StrippedText;
  	var LineArray = SubText.split('\r\n');
  	var LineArrayLen = LineArray.length;
	if(LineArrayLen == 1){
		var maxPerLine = this.ParamOneLineSubMax.Value;
	} else {
		var maxPerLine = this.ParamTwoLinesSubMax.Value;
	}
    if(DebugMode){
    	ScriptLog('=====> too_long_lines.js : Entering FixError...');      	
    	ScriptLog('maxPerLine : '+maxPerLine);      	
  	}
    // Ignore dialogs
    if(CurrentSub.Text.match(/^\s*-/mg)) {
	    if(DebugMode)
      	ScriptLog('Dialog detected, exiting.');
    	return;
    }
  	
    // Put all text on 1 line
    var TextWOLF = CurrentSub.Text.replace(/\s*\r\n\s*/mg, ' ');
    var TextWOLFLen = TextWOLF.length;
    
    if(DebugMode)
      ScriptLog('TextWOLF = ' + TextWOLF);
    
    // Check if length is already ok
    if(TextWOLFLen <= maxPerLine) {
	    if(DebugMode)
      	ScriptLog('Length already ok, exiting.');
      return;
    }
    
    // We works only on 2 lines max
    if(TextWOLFLen > this.ParamTwoLinesSubMax.Value*2) {
	    if(DebugMode)
      	ScriptLog('Text exceed 2 lines, exiting.');
      return;
    } else if(TextWOLFLen > this.ParamTwoLinesSubMax.Value) {
		var maxPerLine = this.ParamTwoLinesSubMax.Value;
		if(DebugMode)
      	ScriptLog('maxPerLine changed to '+this.ParamTwoLinesSubMax.Value);
	}
        
    // Split text at every space
  	var WordArray = TextWOLF.split(' ');
  	var WordArrayLen = WordArray.length;
  	var SumFromStartArray = new Array(WordArrayLen);
  	var SumFromEndArray = new Array(WordArrayLen);
  	
  	// Abc de, fghij klm.
  	// 3   7   13    18   <- SumFromStartArray
  	// 14  10  4     0    <- SumFromEndArray  	
  	 	
  	var SumFromStart = 0;
  	var i;
  	for(i = 0; i < WordArrayLen; i++)
  	{
			if (i === 0) {
			  SumFromStart = WordArray[i].length;
			} else {
			  SumFromStart += (1 + WordArray[i].length);
			}
			SumFromStartArray[i] = SumFromStart;
			// We will get -1 for last item, but that's not important
			SumFromEndArray[i] = (TextWOLFLen - SumFromStart - 1);
  	}
  	
  	if(DebugMode) {
  		DebugMsg = '';
  		for(i=0; i < WordArrayLen; i++)
  			DebugMsg += SumFromStartArray[i] + ' ';  			
			ScriptLog(DebugMsg);
			DebugMsg = '';
  		for(i=0; i < WordArrayLen; i++)
  			DebugMsg += SumFromEndArray[i] + ' ';  			
			ScriptLog(DebugMsg);
  	}
  	
  	var CutList = new Array();
  	var j = 0;
  	
  	// 1st pass, try to break on ".", "?", or "!"
  	var RegExpEndWithL1 = /[.|?|!]$/;
  	for(i = 0; i < WordArrayLen; i++)
  	{
		if(SumFromStartArray[i] <= maxPerLine &&
			 SumFromEndArray[i] <= maxPerLine && 
			 RegExpEndWithL1.test(WordArray[i]))
		{
			if(DebugMode)  			
				ScriptLog('cut at i = ' + i + ', ' + WordArray[i] + ', ' + SumFromStartArray[i] + '-' + SumFromEndArray[i]);
			CutList[j++] = {idx : i, lvl : 1};
		}
  	}
  	  	
  	// 2nd pass, try to break on "..." or ";"
  	var RegExpEndWithL2 = /[...|;]$/;
  	for(i = 0; i < WordArrayLen; i++)
  	{
  		if(SumFromStartArray[i] <= maxPerLine &&
  			 SumFromEndArray[i] <= maxPerLine && 
  			 RegExpEndWithL2.test(WordArray[i]))
  		{
  			if(DebugMode)  			
  				ScriptLog('cut at i = ' + i + ', ' + WordArray[i] + ', ' + SumFromStartArray[i] + '-' + SumFromEndArray[i]);
  			CutList[j++] = {idx : i, lvl : 2};
  		}
  	}
  	
  	// 3rd pass, try to break on ","
  	var RegExpEndWithL3 = /[,]$/;
  	for(i = 0; i < WordArrayLen; i++)
  	{
  		if(SumFromStartArray[i] <= maxPerLine &&
  			 SumFromEndArray[i] <= maxPerLine && 
  			 RegExpEndWithL3.test(WordArray[i]))
  		{
  			if(DebugMode)  			
  				ScriptLog('cut at i = ' + i + ', ' + WordArray[i] + ', ' + SumFromStartArray[i] + '-' + SumFromEndArray[i]);
  			CutList[j++] = {idx : i, lvl : 3};
  		}
  	}
  	  	
  	// 4th pass, break on space
  	for(i = 0; i < WordArrayLen; i++)
  	{
  		if(SumFromStartArray[i] <= maxPerLine &&
  			 SumFromEndArray[i] <= maxPerLine)
  		{
  			if(DebugMode)  			
  				ScriptLog('cut at i = ' + i + ', ' + WordArray[i] + ', ' + SumFromStartArray[i] + '-' + SumFromEndArray[i]);
  			CutList[j++] = {idx : i, lvl : 4};
  		}
  	}
  	
  	var NewText = '';
  	var LineDiff = 0;
  	var DiffPercent = 0;
  	
  	// Find a "good" cut point
  	var found = false;
  	var fallBackPoint = 0;
  	var previousLineDiff = 0;
  	for(i = 0; i < j && !found; i++)
  	{
  		LineDiff = Math.abs(SumFromStartArray[CutList[i].idx] - SumFromEndArray[CutList[i].idx]);
      DiffPercent = (CutList[i].lvl == 4) ? 0.2 : 0.6;
  		if(LineDiff < (TextWOLFLen * DiffPercent))
  		{
  			// ok, build new text
  			for(k=0; k < WordArrayLen; k++)
  			{
  				if(k == WordArrayLen-1)
  				{
  					NewText += WordArray[k];
  				} else if(k == CutList[i].idx) {
  					NewText += (WordArray[k] + '\r\n');
  				} else {
  					NewText += (WordArray[k] + ' ');
  				}
  			}
  			if(DebugMode)
  				ScriptLog('<' + NewText + '>');
  			CurrentSub.Text = NewText;
  			found = true;
  		}
  		if(previousLineDiff > LineDiff)  		
  			fallBackPoint = i;  		
  		previousLineDiff = LineDiff;
  	}
  	
  	if(!found && (fallBackPoint > 0) && (fallBackPoint < j))
  	{
  		// Use fallBackPoint
	  	if(DebugMode)
				ScriptLog('Using fallBackPoint = ' + fallBackPoint);
  		
  		for(var k=0; k < WordArrayLen; k++)
  		{
  			if(k == WordArrayLen-1)
  			{
  				NewText += WordArray[k];
  			} else if(k == CutList[fallBackPoint].idx) {
  				NewText += (WordArray[k] + '\r\n');
  			} else {
  				NewText += (WordArray[k] + ' ');
  			}
  		}
  		if(DebugMode)
  			ScriptLog('<' + NewText + '>');
  		CurrentSub.Text = NewText;
  	} 	
  	  	
  	if(DebugMode)
			ScriptLog('<===== too_long_lines.js : Leaving FixError.');
  }
};