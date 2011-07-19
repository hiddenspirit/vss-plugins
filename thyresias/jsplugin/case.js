/*
  Case control
  thyresias at gmail dot com (www.calorifix.net)
  26 Nov 2005
  22 Dec 2008   Added ErrorOnAcronymPlural (request from linwelin dot sg at gmail dot com)
*/

var debugMode = false;

function checkSub(CurrentSub, PreviousSub, errorOnAcronymPlural) {

  var tagText = CurrentSub.Text;

  // --- prepare untagged version, remember tags

  // split at tags
  var chunks = tagText.split(/<\/?\w>/g);

  // get the tags
  // tags[i] is the tag between chunks[i-1] and chunks[i]
  var tags = new Array(chunks.length);
  var index = chunks[0].length;
  for (i = 1; i < chunks.length; i++) {
    tags[i] = tagText.substr(index).replace(/(<\/?\w>)(.|[\r\n])*/m, "$1");
    index = index + tags[i].length + chunks[i].length;
  }

  // stripped version
  var text = tagText.replace(/<\/?\w>/g, "");

  // debug
  if (debugMode) {
    ScriptLog("");
    ScriptLog("tagText=[" + tagText.replace(/\r\n/mg, "|") + "]");
    ScriptLog("   text=[" + text.replace(/\r\n/mg, "|") + "]");
    for (i=0; i<chunks.length; i++)
      ScriptLog("   " + i + " = " + (i>0 ? tags[i] : "") + "[" + chunks[i].replace(/\r\n/mg, "|") + "]");
  }

  // --- correct UPpercase errors like this

  var re = errorOnAcronymPlural
    ? /([A-Z娎-重-轢)([A-Z娎-重-轢+)([a-z氞-鲽-⺌+)/mg
    : /([A-Z娎-重-轢)([A-Z娎-重-轢+)([a-rt-z氞-鲽-⺌|[a-z氞-鲽-⺌{2,})/mg
  ;
  var match = re.exec(text);
  while (match) {
    text =
      text.substr(0, match.index) // before the match
      + match[1]
      + match[2].toLowerCase()
      + match[3]
      + text.substr(match.index + match[0].length) // after the match
    ;
    match = re.exec();
  }

  // --- uppercase after . ? !, except after ... and acronyms, bypassing double quotes

  re = /([^.A-Z][.?!]"?\s+"?)([a-z氞-鲽-⺌)/mg;

  // prepend the last characters of previous subtitle
  var prevText = PreviousSub == null ? "" : PreviousSub.StrippedText;
  var prevLen = prevText.length;
  var addText = "";
  if (prevLen==0)     addText = "aaa. ";
  else if (prevLen<3) addText = ("aaaa").substr(prevLen) + prevText + " ";
  else                addText = "a" + prevText.substr(prevLen-3) + " ";
  text = addText + text;

  // debug: display matches
  if (debugMode)
    if (re.test(text)) {
      ScriptLog("   text=[" + text.replace(/\r\n/mg, "|") + "]");
      ScriptLog("   >>> [" + text.replace(re, "$1{$2}").replace(/\r\n/mg, "|") + "]");
    }

  // correct uppercase
  match = re.exec(text);
  while (match) {
    text =
      text.substr(0, match.index) // before the match
      + match[1]
      + match[2].toUpperCase()
      + text.substr(match.index + match[0].length) // after the match
    ;
    match = re.exec();
  }

  // remove previous subtitle text
  text = text.substr(addText.length);

  // --- restore tags

  index = chunks[0].length;
  tagText = text.substr(0,index);
  for (i = 1; i < chunks.length; i++) {
    tagText += tags[i] + text.substr(index, chunks[i].length);
    index = index + chunks[i].length;
  }

  if (debugMode)
    ScriptLog("   tagText=[" + tagText.replace(/\r\n/mg, "|") + "]");

  return tagText;

}

VSSPlugin = {

  Name: "Case errors",
  Color: 0x00D900, // green
  Message: "Case",
  Description: "Check uppercase versus punctuation.",

  // --- parameters

  Param_ErrorOnAcronymPlural: {
    Value: 1, Unit: "1=Yes 0=No", Description:
      "Consider trailing 's' on acronyms as case errors? (e.g., PAs > Pas)\r\n" +
      "1: Yes (recommended).\r\n" +
      "0: No (English only, tolerance)."
  },

  // --- error detection/fix

  HasError: function(CurrentSub, PreviousSub, NextSub) {
    var fix = checkSub(CurrentSub, PreviousSub, this.Param_ErrorOnAcronymPlural.Value != 0);
    return fix == CurrentSub.Text ? "" : ">> " + fix.replace(/[\r\n]+/gm,"|");
  },

  FixError: function(CurrentSub, PreviousSub, NextSub) {
    CurrentSub.Text = checkSub(CurrentSub, PreviousSub, this.Param_ErrorOnAcronymPlural.Value != 0);
  }

}
