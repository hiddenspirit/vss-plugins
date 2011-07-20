// Punctuation plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
//

VSSPlugin = {
  // Plugin constants
  Name : "Punctuation",
  Description : "Detects possible punctuation errors.",
  Color : 0xbf9090,
  Message : "Punctuation",

  // Plugin parameters available from VSS GUI (name must start with "Param")

  reIgnore : /[\(\)"]/g,
  reNotEnded : /[^.!?]$/,
  reNewSentence : /^[A-Z]/,
  reContinuedSentence : /^[a-z]/,

  // HasError method called for each subtitle during the error checking
  // If there is an error on CurrentSub
  // return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null.
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    if (NextSub == null || PreviousSub == null ) {
        return "";
    }

    var currentStrippedSubText = CurrentSub.StrippedText.
        replace(this.reIgnore, "");
    var nextStrippedSubText = NextSub.StrippedText.
        replace(this.reIgnore, "");

    if (this.reNotEnded.test(currentStrippedSubText)) {
        var gap = NextSub.Start - CurrentSub.Stop;
        if (this.reNewSentence.test(nextStrippedSubText) || gap > 2000) {
            return "Check sentence end.";
        }
    } else if (this.reContinuedSentence.test(nextStrippedSubText)) {
        return "Check continued sentence.";
    }

    return "";
  },

//   FixError : function(CurrentSub, PreviousSub, NextSub) {
//   },
}
