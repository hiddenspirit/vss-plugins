/*
  Too many lines, too long line
  original version by christophe dot paris at free dot fr
  all changes below by thyresias at gmail dot com (www.calorifix.net)
  26 Nov 2005  refactoring, added autofix with tags
  11 Mar 2006  added joining subtitles that fit on one line
  27 Apr 2006  added switch for "fits on 1 line"
  14 Nov 2008  renamed to line_count_length
*/

var debugMode = false;

VSSPlugin = {

  Name: "Line count and line length",
  Color: 0x16C9B7, // turquoise
  Message: "Line count/length",
  Description:
    "At most 2 lines, of length less than or equal to MaxLineLength (pro: 36).\r\n" +
    "The autofix will first reduce the number of lines, " +
    "then limit the number of characters per line (if possible). " +
    "Dialogs are not processed.",

  // --- parameters

  Param_MaxLineLength: { Value: 40, Unit: "Characters", Description: "Maximum line length (36 pro, 40 max)." },
  Param_CheckOneLine: { Value: 1, Unit: "1=Yes 0=No", Description: "Report/fix subtitles on several lines that can fit on one?" },

  // --- error detection/fix

  HasError: function(CurrentSub, PreviousSub, NextSub) {
    var lines = CurrentSub.StrippedText.split("\r\n");
    var nLines = lines.length;
    var maxChars = 0;
    var oneLineChars = 0;
    for (i = 0; i < nLines; i++) {
      nChars = lines[i].length;
      oneLineChars = oneLineChars + (oneLineChars > 0 ? 1 : 0) + nChars;
      if (nChars > maxChars)
        maxChars = nChars;
    }
    var msg = nLines > 2 ? nLines + " lines" : "";
    if (maxChars > this.Param_MaxLineLength.Value)
      msg += (msg == "" ? "" : ", ") + maxChars + " characters";
    else if (this.Param_CheckOneLine.Value != 0 && nLines > 1 && msg == "" && oneLineChars <= this.Param_MaxLineLength.Value && !CurrentSub.StrippedText.match(/^-/m))
      msg = "fits on one line, " + oneLineChars + " characters";
    return msg;
  },

  FixError: function(CurrentSub, PreviousSub, NextSub) {

    if (debugMode) {
      ScriptLog("");
      ScriptLog("CurrentSub.Text=[" + CurrentSub.Text + "]");
    }

    // ignore dialogs
    if (CurrentSub.StrippedText.match(/^-/m)) {
      if (debugMode) ScriptLog("Dialog detected, exiting.");
      return;
    }

    // remove CR, LF, multiple spaces
    var tagText = CurrentSub.Text.replace(/\s+/mg, " ");
    tagText = tagText.replace(/(^\s)|(\s$)/g, "");

    if (debugMode) ScriptLog("tagText=[" + tagText + "]");

    // if the text is now ok, exit
    var text = tagText.replace(/<\/?\w>/g, "");
    if (text.length <= this.Param_MaxLineLength.Value) {
      if (this.Param_CheckOneLine.Value != 0) {
        CurrentSub.Text = tagText;
        if (debugMode) ScriptLog("Text fits on 1 line.");
      }
      return;
    }
    if (debugMode) ScriptLog("text=[" + text + "]");

    // mark non-breaking spaces
    tagText = tagText.replace(/\s([!?:;])/g, "\u00A0$1");
    text = text.replace(/\s([!?:;])/g, "\u00A0$1");

    // split at spaces
    var tagWords = tagText.split(" ");
    var words = text.split(" ");
    if (debugMode)
      for (var i = 0; i < words.length; i++)
        ScriptLog("(tag)words[" + i + "]=[" + tagWords[i] + "] / [" + words[i] + "]");

    // mid and max line length
    var textLen = text.length;
    var midLen = textLen / 2;
    var maxLen = midLen;
    if (maxLen < this.Param_MaxLineLength.Value) maxLen = this.Param_MaxLineLength.Value;

    // compute break index
    // 1. prefer cut
    //    1. after ! ? .
    //    2. after ... ;
    //    3. after ,
    //    4. after ) or before (
    //    5. after other punctuation
    //    6. before other punctuation
    //    7. after letter
    //    8. after digit
    // 2. prefer to cut near the middle of the text
    // 3. prefer a shorter first line
    // 4. prefer both lines <= maxLen

    var lenSoFar = words[0].length;
    var fact = textLen > 10 ? textLen : 10;
    var iCut = 0;
    var maxBreakValue = 0;
    for (var i = 1; i < words.length; i++) {
      var prevWord = words[i-1];
      var nextWord = words[i];
      // criterion 1
      var punct;
      if (prevWord.match(/(\.\.\.$)|(;$)/))                     punct = 2;
      else if (prevWord.match(/[!?.]$/))                        punct = 1;
      else if (prevWord.match(/,$/))                            punct = 3;
      else if (prevWord.match(/\)$/) || nextWord.match(/^\(/))  punct = 4;
      else if (prevWord.match(/[^A-ZŠÀ-ÖØ-Þ0-9a-zšà-öø-þ]$/))   punct = 5;
      else if (nextWord.match(/^[^A-ZŠÀ-ÖØ-Þ0-9a-zšà-öø-þ]/))   punct = 6;
      else if (prevWord.match(/[0-9]$/))                        punct = 8;
      else                                                      punct = 7;
      // criterion 2
      var distMid = Math.abs(midLen - lenSoFar);
      // criterion 3
      var firstShorter = lenSoFar < midLen ? 1 : 0;
      // criterion 4
      var lessMax = lenSoFar > maxLen || (textLen-lenSoFar-1) > maxLen ? 0 : 1;
      // 4 > 1 > 2 > 3
      breakValue = lessMax*fact*fact + (10-punct)*fact + firstShorter + (textLen-distMid)/fact;
      if (debugMode) ScriptLog(
        " lessMax=" + lessMax +
        " punct=" + punct +
        " firstShorter=" + firstShorter +
        " distMid=" + distMid +
        " breakValue=" + breakValue + " [" + words[i] + "]"
      );
      if (breakValue > maxBreakValue) {
        maxBreakValue = breakValue;
        iCut = i;
      }
      lenSoFar += 1 + words[i].length;
    }

    if (debugMode) ScriptLog("iCut=" + iCut);

    var finalText = tagWords[0];
    for (var i = 1; i < words.length; i++)
      finalText += (i == iCut ? "\r\n" : " ") + tagWords[i];
    finalText = finalText.replace(/\u00A0/g, " ");

    if (debugMode) ScriptLog("finalText=[" + finalText + "]");

    CurrentSub.Text = finalText;

  }

}