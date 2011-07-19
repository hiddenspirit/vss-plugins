// Filler plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
//

VSSPlugin = {
  // Plugin constants
  Name : "Filler",
  Description : "Fills empty subtitles.",
  Color : 0xa4af08,
  Message : "Filler",

  // Plugin parameters available from VSS GUI (name must start with "Param")
  ParamFillText : { Value : "*", Unit : "Text", Description :
    "Fill empty subtitles with this text (default: '*')." },

  // HasError method called for each subtitle during the error checking
  // If there is an error on CurrentSub
  // return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null.
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    if (CurrentSub.Text == "") {
        return "Empty subtitle.";
    }
    return "";
  },

  FixError : function(CurrentSub, PreviousSub, NextSub) {
    if (this.HasError(CurrentSub, PreviousSub, NextSub) == "") {
        return;
    }

    CurrentSub.Text = this.ParamFillText.Value
  }
}
