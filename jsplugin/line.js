// Line plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
// Nathbot <nathbot (at) gmail.com>
//
// Based on parts of:
// "Too many lines" (Toff)
// "Too long line" (Toff, Nathbot)
// "No need for two lines" (Dapitch666, Nathbot)
// "Pixel length" (Spirit)
//

LoadScript("common/common.js");

VSSPlugin = {
  // Plugin constants
  Name : "Line",
  Description : "Detects and fixes line problems: " +
    "too many lines, " +
    "no need for two (or more) lines, " +
    "too long line (in character and/or in pixel length), " +
    "and bad line splits.",
  Color : 0xffff37,
  Message : "Line",

  // Plugin parameters available from VSS GUI (name must start with "Param")
  ParamMode : { Value : 1, Unit : "(1/2/3)", Description :
    "Line length mode.\n" +
    "1 = Character line length (default)\n" +
    "2 = Pixel line length\n" +
    "3 = Character and pixel line length" },
  ParamMaxPerLine : { Value : 37, Unit : "characters", Description :
    "Maximum number of characters per line, " +
    "for one line subtitles (default: 37)." },
  ParamStrictMaxPerLine : { Value : 40, Unit : "characters", Description :
    "Strict maximum number of characters per line, " +
    "for subtitles of two or more lines (default: 40)." },
  ParamMaxPixelsPerLine : { Value : 454, Unit : "pixels", Description :
    "Maximum line width in pixels, " +
    "for one line subtitles (default: 454)." },
  ParamStrictMaxPixelsPerLine : { Value : 500, Unit : "pixels", Description :
    "Strict maximum line width in pixels, " +
    "for subtitles of two or more lines (default: 500)." },
  ParamMaxLines : { Value : 2, Unit : "lines", Description :
    "Maximum number of lines per subtitle (default: 2)." },
  ParamUnbalancedLinesRatio : { Value : 12.5, Unit : "%", Description :
    "Check for unbalanced lines, i.e. when the shorter line is below " +
    "the specified ratio compared to the longer one (default: 12.5%)" },
  ParamNoNeedForTwoLines : { Value : 1, Unit : "(0/1/2)", Description :
    "No need for two (or more) lines detection mode.\n" +
    "0 = Off\n" +
    "1 = Detect for incomplete sentences (default)\n" +
    "2 = Detect for all lines" },
  ParamTwoLinesException : {
    Value : "\\bsous-titres.eu\\b",
    Unit : "regular expression",
    Description :
    "Don't trigger a \"no need for two lines\" error " +
    "if the subtitle matches this expression." },
  ParamDetectBadSplits : { Value : 0, Unit : "(0/1)", Description :
    "Detect line splits that are possibly bad.\n" +
    "0 = Off (default)\n" +
    "1 = On" },
  ParamSafeSplit : { Value : 0, Unit : "(0/1)", Description :
    "When fixing too long line errors, only fix obvious cases.\n" +
    "0 = Off (default)\n" +
    "1 = On" },
  ParamLanguage : { Value : "auto", Unit : "(auto/en/fr/none)", Description :
    "Language used when looking for words " +
    "that should not end on the first line.\n" +
    "auto = Autodetect (default)\n" +
    "en = English\n" +
    "fr = French\n" +
    "none = Disable" },
  ParamFont : { Value : "Arial,18,1", Unit : "name,size,bold", Description :
    "Font used for pixel measurements (default: Arial,18,1)" },

  // Messages
  TooManyLinesMessage : "too many: {value} {unit}",
  NoNeedForNLinesMessage : "no need for {num} lines: {value} {unit}, ACCEPTABLE",
  TooLongLineMessage : "too long line: {value} {unit}",
  TooLongLineMessageAcceptable : "too long line: {value} {unit}, ACCEPTABLE",
  TooLongNthLineMessage : "too long {nth} line: {value} {unit}",
  UnbalancedLinesMessage : "unbalanced lines with ratio: {pct}% in {unit})",
  //SingleLineDialogMessage : "single-line dialog",
  BadSplitMessage : "possibly a bad split after: {word}",

  // HasError method called for each subtitle during the error checking
  // If there is an error on CurrentSub
  // return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null.
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    var lines = Common.getLines(CurrentSub.StrippedText);
    var numLines = lines.length;

    // Too many lines.
    if (numLines > this.ParamMaxLines.Value) {
        return Common.formatMessage(this.TooManyLinesMessage,
            {value: numLines, unit: this.ParamMaxLines.Unit});
    }

    var isDialog;
    this.CheckMode();

    // No need for two lines.
    if (this.ParamNoNeedForTwoLines.Value && numLines > 1 &&
        !(isDialog = Common.isDialog(CurrentSub.StrippedText)) &&
        (this.ParamNoNeedForTwoLines.Value > 1 ||
        !Common.isEndOfSentence(lines[0])))
    {
        var strippedOneLineText = lines.join(" ");
        var result = NoNeedForTwoLines[this.ParamMode.Value](
            strippedOneLineText);

        if (result && (!this.ParamTwoLinesException.Value.length ||
                CurrentSub.StrippedText.search(
                this.ParamTwoLinesException.Value) < 0)) {
            return Common.formatMessage(this.NoNeedForNLinesMessage,
                {num: Common.getNumberText(numLines),
                value: result.value, unit: result.unit});
        }
    }

    // Too long line.
    var result = TooLongLine[this.ParamMode.Value](lines);

    if (result) {
        return Common.formatMessage(numLines == 1 ?
            (result.value > result.strictMax ?
            this.TooLongLineMessage : this.TooLongLineMessageAcceptable) :
            this.TooLongNthLineMessage,
            {nth: Common.getNthText(result.lineIndex + 1),
            value: result.value, unit: result.unit});
    }

    // Unbalanced lines
    if (this.ParamUnbalancedLinesRatio.Value) {
        var result = UnbalancedLines[this.ParamMode.Value](lines);

        if (result) {
            return Common.formatMessage(this.UnbalancedLinesMessage,
                {pct: Math.round(result.ratio * 100),
                 unit: result.unit});
        }
    }

    // Single-line dialog.
    // if (numLines == 1) {
        // if (undefined === isDialog) {
            // isDialog = Common.isDialog(CurrentSub.StrippedText);
        // }

        // if (isDialog) {
            // return this.SingleLineDialogMessage;
        // }
    // }

    // Bad line split.
    if (this.ParamDetectBadSplits.Value && numLines > 1) {
        var result = this.DetectBadSplit(lines);

        if (result) {
            return Common.formatMessage(this.BadSplitMessage, {word: result});
        }
    }

    return "";
  },

  FixError : function(CurrentSub, PreviousSub, NextSub) {
    this.CheckMode();
    CurrentSub.Text = GetSplittedText[this.ParamMode.Value](CurrentSub.Text);
  },

  CheckMode : function() {
    // We can't afford an error when indexing the function arrays.
    if (!(this.ParamMode.Value >= 1 && this.ParamMode.Value <= 3)) {
        this.ParamMode.Value = 1;
    }
  },

  DetectBadSplit : function(lines) {
    var nonTerminatingWords =
        Common.NON_TERMINATING_WORDS[this.ParamLanguage.Value] ||
        Common.NON_TERMINATING_WORDS[Common.detectLanguage()];

    // Check the last word on each line except the last one.
    for (var i = 0, len = lines.length - 1; i < len; ++i) {
        var strippedWords = lines[i].split(" ");
        var strippedWord = strippedWords[strippedWords.length - 1];

        if (nonTerminatingWords.indexOf(strippedWord) >= 0) {
            return strippedWord;
        }
    }

    return null;
  }
};

var NoNeedForTwoLines = new Array(
    undefined,

    // Character mode.
    function(strippedOneLineText) {
        var len = strippedOneLineText.length;

        return len <= VSSPlugin.ParamMaxPerLine.Value ?
            {value: len, unit: VSSPlugin.ParamMaxPerLine.Unit} : null;
    },

    // Pixel mode.
    function(strippedOneLineText) {
        var len = Common.getPixelWidth(strippedOneLineText,
            VSSPlugin.ParamFont.Value);

        return len <= VSSPlugin.ParamMaxPixelsPerLine.Value ?
            {value: len, unit: VSSPlugin.ParamMaxPixelsPerLine.Unit} : null;
    },

    // Character and pixel mode.
    function(strippedOneLineText) {
        var resultChar = this[1](strippedOneLineText);

        if (resultChar && this[2](strippedOneLineText)) {
            return resultChar;
        }

        return null;
    }
);

var TooLongLine = new Array(
    undefined,

    // Character mode.
    function(lines) {
        var maxLineLen = 0;
        var maxIndex = 0;
        var numLines = lines.length;
        var maxPerLine = numLines == 1 ?
            VSSPlugin.ParamMaxPerLine.Value :
            VSSPlugin.ParamStrictMaxPerLine.Value;

        for (var i = 0; i < numLines; ++i) {
            var lineLen = lines[i].length;

            if (lineLen > maxLineLen) {
                maxLineLen = lineLen;
                maxIndex = i;
            }
        }

        return maxLineLen > maxPerLine ?
            {lineIndex: maxIndex, value: maxLineLen,
            strictMax: VSSPlugin.ParamStrictMaxPerLine.Value,
            unit: VSSPlugin.ParamMaxPerLine.Unit} :
            null;
    },

    // Pixel mode.
    function(lines) {
        var maxPixelLineLen = 0;
        var maxIndex = 0;
        var numLines = lines.length;
        var maxPixelsPerLine = numLines == 1 ?
            VSSPlugin.ParamMaxPixelsPerLine.Value :
            VSSPlugin.ParamStrictMaxPixelsPerLine.Value;

        for (var i = 0; i < numLines; ++i) {
            var pixelLineLen = Common.getPixelWidth(lines[i],
                VSSPlugin.ParamFont.Value);

            if (pixelLineLen > maxPixelLineLen) {
                maxPixelLineLen = pixelLineLen;
                maxIndex = i;
            }
        }

        return maxPixelLineLen > maxPixelsPerLine ?
            {lineIndex: maxIndex, value: maxPixelLineLen,
            strictMax: VSSPlugin.ParamStrictMaxPixelsPerLine.Value,
            unit: VSSPlugin.ParamMaxPixelsPerLine.Unit} :
            null;
    },

    // Character and pixel mode.
    function(lines) {
        var maxLineLen = 0;
        var maxPixelLineLen = 0;
        var maxIndex = -1;
        var numLines = lines.length;
        var limits =  [
            VSSPlugin.ParamStrictMaxPerLine.Value,
            VSSPlugin.ParamStrictMaxPixelsPerLine.Value,
            VSSPlugin.ParamMaxPerLine.Value,
            VSSPlugin.ParamMaxPixelsPerLine.Value
            ];

        for (var j = 0; j < 4; j += 2) {
            var maxPerLine =  limits[j];
            var maxPixelsPerLine =  limits[j + 1];

            for (var i = 0; i < numLines; ++i) {
                var lineLen = lines[i].length;

                if (lineLen > maxPerLine || maxLineLen) {
                    if (lineLen > maxLineLen) {
                        maxLineLen = lineLen;
                        maxIndex = i;
                    }
                } else {
                    var pixelLineLen = Common.getPixelWidth(lines[i],
                        VSSPlugin.ParamFont.Value);

                    if (pixelLineLen > maxPixelsPerLine &&
                        pixelLineLen > maxPixelLineLen)
                    {
                        maxPixelLineLen = pixelLineLen;
                        maxIndex = i;
                    }
                }
            }
            if (maxIndex >= 0 || numLines > 1) {
                break;
            }
        }

        return maxLineLen ?
            {lineIndex: maxIndex, value: maxLineLen,
            strictMax: VSSPlugin.ParamStrictMaxPerLine.Value,
            unit: VSSPlugin.ParamMaxPerLine.Unit} :
            maxPixelLineLen ?
            {lineIndex: maxIndex, value: maxPixelLineLen,
            strictMax: VSSPlugin.ParamStrictMaxPixelsPerLine.Value,
            unit: VSSPlugin.ParamMaxPixelsPerLine.Unit} :
            null;
    }
);

var UnbalancedLines = new Array(
    undefined,

    // Character mode.
    function(lines) {
        var minLineLen = Infinity;
        var maxLineLen = 0;
        var numLines = lines.length;
        var minRatio = VSSPlugin.ParamUnbalancedLinesRatio.Value / 100;

        for (var i = 0; i < numLines; ++i) {
            var lineLen = lines[i].length;

            if (lineLen > maxLineLen) {
                maxLineLen = lineLen;
            }
            if (lineLen < minLineLen) {
                minLineLen = lineLen;
            }
        }

        var ratio = minLineLen / maxLineLen || 1;
        return ratio < minRatio ? {ratio : ratio, unit : "characters"} : null;
    },

    // Pixel mode.
    function(lines) {
        var minPixelLineLen = Infinity;
        var maxPixelLineLen = 0;
        var numLines = lines.length;
        var minRatio = VSSPlugin.ParamUnbalancedLinesRatio.Value / 100;

        for (var i = 0; i < numLines; ++i) {
            var pixelLineLen = Common.getPixelWidth(lines[i],
                VSSPlugin.ParamFont.Value);

            if (pixelLineLen > maxPixelLineLen) {
                maxPixelLineLen = pixelLineLen;
            }
            if (pixelLineLen < minPixelLineLen) {
                minPixelLineLen = pixelLineLen;
            }
        }

        var ratio = minPixelLineLen / maxPixelLineLen || 1;
        return ratio < minRatio ? {ratio : ratio, unit : "pixels"} : null;
    },

    // Character and pixel mode.
    function(lines) {
        var numLines = lines.length;
        var minRatio = VSSPlugin.ParamUnbalancedLinesRatio.Value / 100;

        var minPixelLineLen = Infinity;
        var maxPixelLineLen = 0;

        for (var i = 0; i < numLines; ++i) {
            var pixelLineLen = Common.getPixelWidth(lines[i],
                VSSPlugin.ParamFont.Value);

            if (pixelLineLen > maxPixelLineLen) {
                maxPixelLineLen = pixelLineLen;
            }
            if (pixelLineLen < minPixelLineLen) {
                minPixelLineLen = pixelLineLen;
            }
        }

        var ratio = minPixelLineLen / maxPixelLineLen || 1;

        if (ratio < minRatio) {
            return {ratio : ratio, unit : "pixels"};
        }

        var minLineLen = Infinity;
        var maxLineLen = 0;

        for (var i = 0; i < numLines; ++i) {
            var lineLen = lines[i].length;

            if (lineLen > maxLineLen) {
                maxLineLen = lineLen;
            }
            if (lineLen < minLineLen) {
                minLineLen = lineLen;
            }
        }

        var ratio = minLineLen / maxLineLen || 1;
        return ratio < minRatio ? {ratio : ratio, unit : "characters"} : null;
    }
);

var GetSplittedText = new Array(
    undefined,

    // Character mode.
    function(text) {
        return Common.getSplittedText(text,
            VSSPlugin.ParamMaxPerLine.Value,
            VSSPlugin.ParamStrictMaxPerLine.Value,
            VSSPlugin.ParamLanguage.Value,
            VSSPlugin.ParamSafeSplit.Value);
    },

    // Pixel mode.
    function(text) {
        return Common.getSplittedTextPixel(text,
            VSSPlugin.ParamMaxPixelsPerLine.Value,
            VSSPlugin.ParamStrictMaxPixelsPerLine.Value,
            VSSPlugin.ParamFont.Value,
            VSSPlugin.ParamLanguage.Value,
            VSSPlugin.ParamSafeSplit.Value);
    },

    // Character and pixel mode.
    function(text) {
        return Common.getSplittedTextCharPixel(text,
            VSSPlugin.ParamMaxPerLine.Value,
            VSSPlugin.ParamStrictMaxPerLine.Value,
            VSSPlugin.ParamMaxPixelsPerLine.Value,
            VSSPlugin.ParamStrictMaxPixelsPerLine.Value,
            VSSPlugin.ParamFont.Value,
            VSSPlugin.ParamLanguage.Value,
            VSSPlugin.ParamSafeSplit.Value);
    }
);
