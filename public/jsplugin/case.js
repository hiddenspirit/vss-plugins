/*
  Case control
  thyresias at gmail dot com (www.calorifix.net)
  26 Nov 2005
  22 Dec 2008
    Added ErrorOnAcronymPlural (request from linwelin dot sg at gmail dot com)

  Tweaked by spirit <hiddenspirit (at) gmail.com>
*/

var debugMode = false;

VSSPlugin = {

  Name: "Case",
  Color: 0x00D900, // green
  Message: "Case",
  Description: "Check uppercase versus punctuation.",

  // --- parameters

  ParamErrorOnAcronymPlural: {
    Value: 0, Unit: "(0/1)", Description:
      "Consider trailing 's' on acronyms as case errors (e.g., PAs > Pas).\n" +
      "0 = Off (default)\n" +
      "1 = On"
  },

  // --- private parameters

  maxDistToPrev: 10000,

  // --- error detection/fix

  HasError: function(CurrentSub, PreviousSub, NextSub) {
    var fix = checkSub(CurrentSub, PreviousSub,
        this.ParamErrorOnAcronymPlural.Value != 0, this.maxDistToPrev);
    return fix == CurrentSub.Text ? "" : ">> " + fix.replace(/[\r\n]+/gm, "|");
  },

  FixError: function(CurrentSub, PreviousSub, NextSub) {
    CurrentSub.Text = checkSub(CurrentSub, PreviousSub,
        this.ParamErrorOnAcronymPlural.Value != 0, this.maxDistToPrev);
  }

}

function checkSub(CurrentSub, PreviousSub, errorOnAcronymPlural, maxDistToPrev) {

  var tagText = CurrentSub.Text;

  // --- prepare untagged version, remember tags

  // split at tags (and dialog markers)
  var chunks = tagText.split(/<\/?\w>|{.*?}|^[\-–—]\s/mg);

  // get the tags
  // tags[i] is the tag between chunks[i-1] and chunks[i]
  var tags = new Array(chunks.length);
  var index = chunks[0].length;
  for (i = 1; i < chunks.length; i++) {
    tags[i] = tagText.substr(index).replace(/(<\/?\w>|{.*?}|^[\-–—]\s)(.|[\r\n])*/m, "$1");
    index = index + tags[i].length + chunks[i].length;
  }

  // stripped version
  var text = tagText.replace(/<\/?\w>|{.*?}|^[\-–—]\s/mg, "");

  // debug
  if (debugMode) {
    ScriptLog("");
    ScriptLog("tagText=[" + tagText.replace(/\r\n/mg, "|") + "]");
    ScriptLog("   text=[" + text.replace(/\r\n/mg, "|") + "]");
    for (i=0; i<chunks.length; i++)
      ScriptLog("   " + i + " = " + (i>0 ? tags[i] : "") +
        "[" + chunks[i].replace(/\r\n/mg, "|") + "]");
  }

  // --- correct UPpercase errors like this

  var re = errorOnAcronymPlural
    ? /([A-ZŠÀ-ÖØ-ÞŒ])([A-ZŠÀ-ÖØ-ÞŒ]+)([a-zšà-öø-þœ]+)/mg
    : /([A-ZŠÀ-ÖØ-ÞŒ])([A-ZŠÀ-ÖØ-ÞŒ]+)([a-zšà-öø-þœ]{2,}|[a-rt-zšà-öø-þœ])/mg
  ;
  var match = re.exec(text);
  while (match) {
    // skip roman numerals with an ordinal suffix (French and English)
    // this prevents a false error, but arabic numerals should be preferred in most cases
    if (!/^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})(e|th|st|nd|rd)$/.test(match[0])) {
        text =
          text.substr(0, match.index) // before the match
          + match[1]
          + match[2].toLowerCase()
          + match[3]
          + text.substr(match.index + match[0].length) // after the match
        ;
    }
    match = re.exec();
  }

  // --- uppercase after . ? !,
  // except after ... and acronyms, bypassing double quotes

  re = /([^.A-Z][.?!]"?\s+"?)([a-zšà-öø-þœ])/mg;

  // prepend the last characters of previous subtitle
  var prevText = PreviousSub == null ||
    (CurrentSub.Start - PreviousSub.Stop > maxDistToPrev) ?
    "" : PreviousSub.StrippedText;
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
      ScriptLog("   >>> [" +
        text.replace(re, "$1{$2}").replace(/\r\n/mg, "|") + "]");
    }

  // correct uppercase
  match = re.exec(text);
  while (match) {
    var firstPart = text.substr(0, match.index) + match[1];
    var middlePart = match[2].toUpperCase();
    var lastPart = text.substr(match.index + match[0].length);

    if (/\b(Mr|Mrs|Ms|Dr)\.\s+$/.test(firstPart) &&
        /^(And|Or)\b/.test(middlePart + lastPart)
    ) {
        text = firstPart + match[2].toLowerCase() + lastPart;
    } else {
        text = firstPart + middlePart + lastPart;
    }
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
