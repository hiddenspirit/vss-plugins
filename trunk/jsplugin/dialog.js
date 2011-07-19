// Dialog plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
//

LoadScript("common/common.js");
LoadScript("common/difflib.js");

VSSPlugin = {
  // Plugin constants
  Name : "Dialog",
  Description : "Detects and fixes dialog problems.",
  Color : 0x37ffff,
  Message : "Dialog",

  Messages : [
    "single-line",
    "multi-line",
    "malformed",
  ],

  // HasError method called for each subtitle during the error checking
  // If there is an error on CurrentSub
  // return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null.
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    var error = this.CheckDialog(CurrentSub);

    if (error) {
        return this.Messages[error - 1];
    }

    return "";
  },

  FixError : function(CurrentSub, PreviousSub, NextSub) {
    var error = this.CheckDialog(CurrentSub);

    switch (error) {
        case 1: // Single-line
            var newText = Common.getSplittedText(CurrentSub.Text);

            if (CurrentSub.Text != newText) {
                CurrentSub.Text = newText;
                break;
            }

        case 2: // Multi-line
            CurrentSub.Text = difflib.updateText(
                CurrentSub.Text,
                CurrentSub.StrippedText,
                CurrentSub.StrippedText.replace(/^\s*[\-–—]\s*/, ""));
            break;

        case 3: // Malformed
            CurrentSub.Text = difflib.updateText(
                CurrentSub.Text,
                CurrentSub.StrippedText,
                "- " + CurrentSub.StrippedText);
    }
  },

  CheckDialog : function(CurrentSub) {
    var lines = Common.getLines(CurrentSub.StrippedText);
    var numLines = lines.length;
    var isDialog1 = Common.isDialog(lines[0]);

    if (numLines == 1) {
        if (isDialog1) {
            return 1;       // Single-line
        }
    } else if (numLines == 2) {
        var isDialog2 = Common.isDialog(lines[1]);

        if (isDialog1) {
            if (!isDialog2) {
                return 2;   // Multi-line
            }
        } else if (isDialog2) {
            return 3;       // Malformed
        }
    }

    return 0
  }
}
