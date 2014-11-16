// Merge suggestion plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
//

LoadScript("common/common.js");

VSSPlugin = {
  // Plugin constants
  Name : "Merge suggestion",
  Description :
    "Detects what subtitles might need to be merged with the next ones.",
  Color : 0x805a99,
  Message : "Merge suggestion",

  // Plugin parameters available from VSS GUI (name must start with "Param")
  PrivateMode : { Value : 4, Unit : "(1/2/3)", Description :
    "Detection mode.\n" +
    "1 = Unfinished sentences (safe if punctuation is correct) (default)\n" +
    "2 = Manual dialogs (manually check for different speakers)\n" +
    "3 = Manual sentences (manually check for same speakers)" },
  ParamCheckSceneChange : { Value : 1, Unit : "(0/1)", Description :
    "Check for scene changes.\n" +
    "0 = Off\n" +
    "1 = On (default)" },
  ParamRsLevel : { Value : 3, Unit : "(1/2/3/4)", Description :
    "RS detection level.\n" +
    "1 = TOO FAST\n" +
    "2 = Fast, acceptable\n" +
    "3 = A bit fast (default)\n" +
    "4 = Good" },
  ParamMaxPerLine : { Value : 40, Unit : "Characters", Description :
    "Maximum number of characters per line after merging (default: 40)." },
  PrivateEnableFixError : { Value : 0, Unit : "(0/1)", Description :
    "Enable fix error (experimental).\n" +
    "0 = Off (default)\n" +
    "1 = On (One merge can be done at a time, " +
    "and you need to manually delete the last subtitle)" },

  // Private constants
  DialogPrefixes : new Array("- ", "- "),
  SuggestionMessage : "RS: {rs}, text: {text}",

  // HasError method called for each subtitle during the error checking
  // If there is an error on CurrentSub
  // return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null.
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    var result = this.CheckMerge(CurrentSub, NextSub);

    if (null !== result) {
        return Common.formatMessage(this.SuggestionMessage,
            {rs: Common.decimal1Round(result.rs),
            text: result.text.replace(Common.NEWLINE_PATTERN, "|")});
    }

    return "";
  },

  FixError : function(CurrentSub, PreviousSub, NextSub) {
    if (!this.PrivateEnableFixError.Value) {
        return;
    }

    var result = this.CheckMerge(CurrentSub, NextSub);

    if (null === result) {
        return;
    }

    CurrentSub.Stop = NextSub.Stop;
    CurrentSub.Text = result.text;

    DeleteSubtitle(NextSub);
  },

  CheckMerge : function(CurrentSub, NextSub) {
    if (null === NextSub) {
        return null;
    }

    var mergedDuration = NextSub.Stop - CurrentSub.Start;

    // Don't merge if the resulting subtitle would exceed the maximum duration.
    if (mergedDuration > VSSCore.MaximumDuration) {
        return null;
    }

    if (undefined === this.Interval) {
        this.Interval = 2 * Math.max(SceneChange.FilterOffset,
            SceneChange.StartOffset + SceneChange.StopOffset,
            VSSCore.MinimumBlank);
    }

    // Check interval.
    if (NextSub.Start - CurrentSub.Stop > this.Interval) {
        return null;
    }

    var maxRs = Common.getRsFromHighLevel(this.ParamRsLevel.Value);

    // Check RS.
    if (Common.getReadingSpeed(CurrentSub) < maxRs &&
        Common.getReadingSpeed(NextSub) < maxRs)
    {
        return null;
    }

    // Never merge pre-existing dialogs.
    if (Common.isDialog(CurrentSub.StrippedText) ||
        Common.isDialog(NextSub.StrippedText))
    {
        return null;
    }

    // Check scene change.
    if (this.ParamCheckSceneChange.Value &&
        SceneChange.Contains(CurrentSub.Stop, NextSub.Start))
    {
        return null;
    }

    switch (this.PrivateMode.Value) {
    case 4: // New mode
        if (Common.getOneLineText(CurrentSub.StrippedText).length >
            this.ParamMaxPerLine.Value) {
            return null;
        }
        if (Common.getOneLineText(NextSub.StrippedText).length >
            this.ParamMaxPerLine.Value) {
            return null;
        }

        var lines = Common.getLines(CurrentSub.StrippedText);
        var num_sentences = 0
        for (var i = 0; i < lines.length; ++i) {
            if (Common.isEndOfSentence(lines[i])) {
                ++num_sentences;
            }
        }
        if (num_sentences > 1) {
            return null;
        }
        var lines = Common.getLines(NextSub.StrippedText);
        var num_sentences = 0
        for (var i = 0; i < lines.length; ++i) {
            if (Common.isEndOfSentence(lines[i])) {
                ++num_sentences;
            }
        }
        if (num_sentences > 1) {
            return null;
        }
        
        if (!Common.isStartOfSentence(CurrentSub.StrippedText) &&
                Common.isEndOfSentence(CurrentSub.StrippedText) &&
                !Common.isEndOfSentence(NextSub.StrippedText)) {
            return null;
        }
        
        if (!Common.isStartOfSentence(CurrentSub.StrippedText) &&
                Common.isEndOfSentence(CurrentSub.StrippedText)) {
            return null;
        }

        var mergedText = Common.getOneLineText(CurrentSub.Text) +
            Common.NEWLINE +
            Common.getOneLineText(NextSub.Text);
        var strippedMergedText = Common.getStrippedText(mergedText);
        break;

    case 1: // Sentences.
        if (Common.isEndOfSentence(CurrentSub.StrippedText)) {
            return null;
        }

        // Fall through next case.
    case 3: // Manual sentences.
        var mergedText = Common.getSplittedText(
            (CurrentSub.Text + " " + NextSub.Text).
            replace(/<\/i>(\s*)<i>/g, "$1"),
            this.ParamMaxPerLine.Value, this.ParamMaxPerLine.Value);
        var strippedMergedText = Common.getStrippedText(mergedText);

        var lines = Common.getLines(strippedMergedText);

        for (var i = 0, len = lines.length; i < len; ++i) {
            if (lines[i].length > this.ParamMaxPerLine.Value) {
                return null;
            }
        }

        break;
    case 2: // Manual dialogs.
        if (!Common.isEndOfSentence(CurrentSub.StrippedText)) {
            return null;
        }

        if (Common.getOneLineText(CurrentSub.StrippedText).length +
            this.DialogPrefixes[0].length > this.ParamMaxPerLine.Value ||
            Common.getOneLineText(NextSub.StrippedText).length +
            this.DialogPrefixes[1].length > this.ParamMaxPerLine.Value)
        {
            return null;
        }

        var mergedText =
            this.DialogPrefixes[0] + Common.getOneLineText(CurrentSub.Text) +
            Common.NEWLINE +
            this.DialogPrefixes[1] + Common.getOneLineText(NextSub.Text);
        var strippedMergedText = Common.getStrippedText(mergedText);
    }

    var mergedRs = Common.getRsFromLengthDuration(strippedMergedText.length,
        mergedDuration);

    return {rs: mergedRs, text: mergedText};
  }
};

// This is experimental (you need to manually delete the last subtitle).
function DeleteSubtitle(subtitle) {
    var deleteStart = 360000000;
    var deleteDuration = 1000;
    var nextSubtitle;

    while (null !== (nextSubtitle = VSSCore.GetNext(subtitle))) {
        subtitle.Start = nextSubtitle.Start;
        subtitle.Stop = nextSubtitle.Stop;
        subtitle.Text = nextSubtitle.Text;
        subtitle = nextSubtitle;
    }

    subtitle.Text = "DELETE ME";
    subtitle.Start = subtitle.Start < deleteStart ?
        deleteStart : subtitle.Stop + deleteDuration;
    subtitle.Stop = subtitle.Start + deleteDuration;
}
