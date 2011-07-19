// Line length by Nathbot
//
// Combination of "Too long line" (christophe.paris <at> free.fr) v2 by nathbot (sept. 2008)
// and "No need for two lines" (Dapitch666 - updated by Nathbot)
//
// Limitation : ignore dialogs,
// tags are not ignored when splitting

var DebugMode = false;

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'Line length',
  Description : 'Detects and tries to fix:\n- 2-lines subtitles that could be on one line.'+
 '\n- Subtitles with a line that is too long. The "smart" line splitter will '+
  	'try to break the line in 2 according to the limitation.',
  Color : 0xFFFF37, 
  Message : 'Length ',

  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----
  ParamOneLineSubMax : { Value : 36, Unit : 'Characters', Description : "Maximum number of characters per line in a one line subtitle" },
  ParamTwoLinesSubMax : { Value : 40, Unit : 'Characters', Description : "Maximum number of characters per line in a two lines subtitle" },
  ParamDetectWithPunct : { Value : 0, Unit : '0/1', Description : 'Mode 0: if the first line ends with punctuation (.!?), no error is detected.\nMode 1: detects an error in any case.'},

  // ----- HasError method called for each subtitle during the error checking -----
  // If there is an error on CurrentSub return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    //no need for two lines?
    var result = this.CheckNoNeedForTwoLines(CurrentSub);
    
    if(result == ''){
		//too long line?
		result = this.CheckTooLongLine(CurrentSub);
	}
    return result;
  
  },

  FixError : function(CurrentSub, PreviousSub, NextSub) {
    //no need for two lines?
    var result = this.CheckNoNeedForTwoLines(CurrentSub);
    
    if(result != ''){
		this.FixNoNeedForTwoLines(CurrentSub);
    } else {
		//too long line?
		this.FixTooLongLine(CurrentSub);
	}
    return result;

    
  },

  CheckTooLongLine : function(CurrentSub) {
  	var SubText = CurrentSub.StrippedText;
  	var MaxLineLen = 0;
  	var LineArray = SubText.split('\r\n');
  	var LineArrayLen = LineArray.length;
  	var LineLen = 0;
	if(LineArrayLen == 1){
		var maxPerLine = this.ParamOneLineSubMax.Value;
	} else {
		var maxPerLine = this.ParamTwoLinesSubMax.Value;
	}

  	for(var i = 0; i < LineArrayLen; i++)
  	{
  		LineLen = LineArray[i].length;
  		if(LineLen > MaxLineLen)
  			MaxLineLen = LineLen;
  	}
    if (MaxLineLen  > maxPerLine) {
    	return ('Too long line' + ' ('+LineArrayLen+'): '+MaxLineLen + ' ' + this.ParamOneLineSubMax.Unit);
    }
    else {
    	return '';
    }
  },

	CheckNoNeedForTwoLines : function(CurrentSub) {
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
			if (TotalLen  <= this.ParamOneLineSubMax.Value)
			{
				if(this.ParamDetectWithPunct.Value == 0 && LineArray[0].match(punctuation)){
					return ('');
				} else {
					return ('No need for two lines: '+TotalLen + ' ' + this.ParamOneLineSubMax.Unit);
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
    
  FixTooLongLine : function(CurrentSub) {  	
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
  	
  	// -- Nathbot
  	// just a small improvement... if the plugin has cut at a relative pronoun, try to place it on the 2nd line.
  	SubText = CurrentSub.StrippedText;
  	LineArray = SubText.split('\r\n');
  	FirstLine = LineArray[0].split(' ');
  	// Feel free to add pronouns if you find others...
  	var pronouns = new Array("que", "qui", "qu'il", "qu'elle", "qu'ont", "qu'a", "that", "from which", "in which", "who", "which", "the", "le", "la", "les", "their", "my", "mon", "ma", "mes", "tes", "your", "our", "his", "its", "if", "when", "and", "or", "et", "si");
  	// First we check if it's cut at a pronoun
  	var isThat = false;
  	for(var i=0; i<pronouns.length; i++){
		if(FirstLine[FirstLine.length-1] == pronouns[i]){
			isThat = true;
			var pronoun = pronouns[i];
			break;
		}
	}
  	if (isThat) {
		//see if the pronoun fits in the 2nd line
		LineArray[1] = pronoun+" "+LineArray[1];
		var lengthOK = (LineArray[1].length < this.ParamTwoLinesSubMax.Value)?true:false;
		if(lengthOK){
			//remove the pronoun from the first line
			LineArray[0] = LineArray[0].substr(0, LineArray[0].length-pronoun.length-1);
			if(DebugMode){
				ScriptLog('Line 1 > '+LineArray[0]);
				ScriptLog('Line 2 > '+LineArray[1]);
			}
			CurrentSub.Text = LineArray[0]+'\r\n'+LineArray[1];
		}
  	}
  	//-- end Nathbot
  	  	
  	if(DebugMode)
			ScriptLog('<===== too_long_lines.js : Leaving FixError.');
  },
    
	FixNoNeedForTwoLines : function(CurrentSub) {
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
};