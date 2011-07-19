/*
  Missing punctuation
  thyresias at gmail dot com (www.calorifix.net)
  3 Dec 2005
*/

var debugMode = false;

function checkSub(CurrentSub, NextSub) {

  var tagText = CurrentSub.Text;

  // get lines
  var tagLines = tagText.split(/[\r\n]+/gm);
  var nLines = tagLines.length;

  // append the first line of the next subtitle
  if (NextSub==null)
    tagLines[nLines] = "New sentence.";
  else {
    var nextLines = NextSub.Text.split(/[\r\n]+/gm);
    tagLines[nLines] = nextLines[0];
  }

  // strip leading & training tags
  var lines = new Array(tagLines.length);
  var begTags = new Array(lines.length);
  var endTags = new Array(lines.length);
  for (i=0; i<tagLines.length; i++) {
    begTags[i] = getMatch(tagLines[i], /^(<\/?\w>)+/);
    endTags[i] = getMatch(tagLines[i], /(<\/?\w>)+$/);
    lines[i] = tagLines[i].substring(begTags[i].length, tagLines[i].length - endTags[i].length);
    if (debugMode) ScriptLog(
      i + ". =[" + tagLines[i] + "] => [" + begTags[i] + "|" + lines[i] + "|" + endTags[i] + "]"
    );
  }

  // add missing punctuation
  var finalText = "";
  for (i=0; i<nLines; i++) {
    finalText += (i>0 ? "\r\n" : "") + begTags[i] + lines[i];
    if (
      /[a-zšà-öø-þ0-9]"?$/.test(lines[i]) &&
      /^(-|"?[A-ZŠÀ-ÖØ-Þ])/.test(lines[i+1])
    ) finalText += ".";
    finalText += endTags[i];
  }

  if (debugMode) ScriptLog("finalText=[" + finalText.replace(/\r\n/mg, "|") + "]");

  return finalText;

}

function getMatch(text, re) {
  var match = text.match(re);
  return match ? match[0] : "";
}

VSSPlugin = {

  Name: " Missing Punctuation", // space: after French punctuation
  Color: 0x4F9D00, // dark yellowish green
  Message: "Missing punctuation",
  Description: "Checks lines that seem to miss a trailing punctuation.",

  // --- error detection/fix

  HasError: function(CurrentSub, PreviousSub, NextSub) {
    var fix = checkSub(CurrentSub, NextSub);
    return fix==CurrentSub.Text ? "" : ">> " + fix.replace(/[\r\n]+/gm,"|");
  },

  FixError: function(CurrentSub, PreviousSub, NextSub) {
    CurrentSub.Text = checkSub(CurrentSub, NextSub);
  },

}
