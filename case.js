// Case control
// thyresias <at> gmail.com   v1.0  26 Nov 2005   www.calorifix.net

var debugMode = false;

VSSPlugin = {
  // ----- Plugin constant -----
  Name : "Case errors",
  Description : "Check uppercase versus punctuation.",
  Color : 0x00FF00, // green
  Message : "Case",

  HasError : function(CurrentSub, PreviousSub, NextSub) {
    var fix = this.CheckIt(CurrentSub, PreviousSub);
    return fix==CurrentSub.Text ? "" : ">> " + fix.replace(/[\r\n]+/gm,"|");
  },

  FixError : function(CurrentSub, PreviousSub, NextSub) {
    CurrentSub.Text = this.CheckIt(CurrentSub, PreviousSub);
  },


  CheckIt : function(CurrentSub, PreviousSub) {

    var tagText = CurrentSub.Text;

    // --- prepare untagged version, remember tags

    // split at tags
    var chunks = tagText.split(/<\/?\w>/g);

    // get the tags
    // tags[i] is the tag between chunks[i-1] and chunks[i]
    var tags = new Array(chunks.length);
    var index = chunks[0].length;
    for (i=1; i<chunks.length; i++) {
      tags[i] = tagText.substr(index).replace(/(<\/?\w>)(.|[\r\n])*/m, "$1");
      index = index + tags[i].length + chunks[i].length;
    }

    // stripped version
    var text = tagText.replace(/<\/?\w>/g, "");

    // debug
    if (debugMode) {
      ScriptLog("");
      ScriptLog("tagText=[" + tagText.replace(/\r\n/mg, "|"));
      ScriptLog("   text=[" + text.replace(/\r\n/mg, "|") + "]");
      for (i=0; i<chunks.length; i++)
        ScriptLog("   " + i + " = " + (i>0 ? tags[i] : "") + "[" + chunks[i].replace(/\r\n/mg, "|") + "]");
    }

    // --- correct UPpercase errors like this

    var re = /([A-Z娎-重-轢)([A-Z娎-重-轢+)([a-z氞-鲽-⺌+)/mg;
    var match = re.exec(text);
    while (match!=null) {
      text =
        text.substr(0,match.index) // before the match
        + match[1]
        + match[2].toLowerCase()
        + match[3]
        + text.substr(match.index+match[0].length) // after the match
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
    while (match!=null) {
      text =
        text.substr(0,match.index) // before the match
        + match[1]
        + match[2].toUpperCase()
        + text.substr(match.index+match[0].length) // after the match
      ;
      match = re.exec();
    }

    // remove previous subtitle text
    text = text.substr(addText.length);

    // --- restore tags

    index = chunks[0].length;
    tagText = text.substr(0,index);
    for (i=1; i<chunks.length; i++) {
      tagText += tags[i] + text.substr(index, chunks[i].length);
      index = index + chunks[i].length;
    }

    if (debugMode)
      ScriptLog("   tagText=[" + tagText.replace(/\r\n/mg, "|") + "]");

    return tagText;

  }

  /*
  CheckIt : function(CurrentSub, PreviousSub) {

    var subText = CurrentSub.Text;

    // --- correct UPpercase errors like this

    var re = /([A-Z娎-重-轢)([A-Z娎-重-轢+)([a-z氞-鲽-⺌+)/mg;
    var match = re.exec(subText);
    while (match!=null) {
      subText =
        subText.substr(0,match.index) // before the match
        + match[1]
        + match[2].toLowerCase()
        + match[3]
        + subText.substr(match.index+match[0].length) // after the match
      ;
      match = re.exec();
    }

    // --- uppercase after . ? !, except after ... and acronyms, bypassing double quotes

    re = /([^.A-Z][.?!]"?\s+"?)([a-z氞-鲽-⺌)/mg;
    // check versus the last characters of previous subtitle
    if (PreviousSub == null || PreviousSub.Text.length==0)
      subText = "aaa. " + subText;
    else if (PreviousSub.Text.length<3)
      subText = ("aaaa").substr(PreviousSub.Text.length) + PreviousSub.Text + " " + subText;
    else
      subText = "a" + PreviousSub.Text.substr(PreviousSub.Text.length-3) + " " + subText;

    if (re.test(subText)) {
      ScriptLog("");
      ScriptLog("[" + subText + "]");
      ScriptLog("  >>> " + subText.replace(re, "$1[$2]"));
    }
    else
      ScriptLog("  >>> fail");

    match = re.exec(subText);
    while (match!=null) {
      subText =
        subText.substr(0,match.index) // before the match
        + match[1]
        + match[2].toUpperCase()
        + subText.substr(match.index+match[0].length) // after the match
      ;
      match = re.exec();
    }

    subText = subText.substr(5);

    // --- final result (may be unchanged)

    return subText;

  }
  */

}
