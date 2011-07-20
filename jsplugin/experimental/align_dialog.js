// Align dialog plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
//

LoadScript("common/common.js");

VSSPlugin = {
  // Plugin constants
  Name : "Align dialog",
  Description : "Align dialogs.",
  Color : 0x379090,
  Message : "Align dialog",
  
  // Plugin parameters available from VSS GUI (name must start with "Param")
  ParamFont : { Value : "Verdana,18,1", Unit : "name,size,bold", Description :
    "Must be the same as the font used for your ASS subtitles." },

  // HasError method called for each subtitle during the error checking
  // If there is an error on CurrentSub
  // return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null.
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    if (Common.isDialog(CurrentSub.StrippedText)) {
        var text = this.GetFixedError(CurrentSub);
        if (CurrentSub.Text != text) {
            return text;
        }
    }

    return "";
  },

  FixError : function(CurrentSub, PreviousSub, NextSub) {
    CurrentSub.Text = this.GetFixedError(CurrentSub);
  },
  
  GetFixedError : function(CurrentSub) {
    var r = /^\{\\an1\\pos\((\d+),\d+\)\}/;
    var pixel_width = this.MaxPixelWidth(CurrentSub);
    var x = Math.round((1 - pixel_width / 830) * 192);

    if (r.test(CurrentSub.Text)) {
        return CurrentSub.Text.replace(r, "{\\an1\\pos(" + x + ",273)}");
    } else {
        return "{\\an1\\pos(" + x + ",273)}" + CurrentSub.Text;
    }
  },
  
  MaxPixelWidth : function(CurrentSub) {
        var lines = Common.getLines(CurrentSub.StrippedText);
        var numLines = lines.length;
        var max = 0;

        for (var i = 0; i < numLines; ++i) {
            var len = Common.getPixelWidth(lines[i], this.ParamFont.Value);

            if (len > max) {
                max = len;
            }
        }
        
        return max;
    }
}
