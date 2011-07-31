// Common variables and functions for VisualSubSync plugins
// Spirit <hiddenspirit (at) gmail.com>
// Nathbot <nathbot (at) gmail.com>
//

if (undefined === Common) {

var Common = {

// Debug level.
DEBUG_LEVEL : 0,

// Strict minimum reading speed.
STRICT_MIN_RS : 5,

// Strict maximum reading speed.
STRICT_MAX_RS : 35,

// Strict minimum characters per second.
STRICT_MIN_CPS : 4,

// Strict maximum characters per second.
STRICT_MAX_CPS : 25,

// Default font
DEFAULT_FONTNAME : "Arial",
DEFAULT_FONTSIZE : 18,
DEFAULT_FONTBOLD : true,

// Newline string.
NEWLINE : "\r\n",

// Newline pattern.
NEWLINE_PATTERN : /\r\n/g,

// Pattern for matching tags.
TAGS_PATTERN : /<[^>]*>|{[^}]*}/g,

// Number texts.
NUMBER_TEXTS : new Array("one", "two", "three", "{n}"),

// Nth texts.
NTH_TEXTS : new Array("first", "second", "third", "{n}th"),

// Words that are never supposed to end on the first line of a subtitle.
NON_TERMINATING_WORDS : {
    "fr" : new Array(
        "que", "qui", "qu'il", "qu'ils", "qu'elle", "qu'elles", "qu'on",
        "je", "tu", "il", "ils", "on", "j'en", "j'y", "en", "y",
        "mais", "ou", "et", "donc", "ni", "car",
        "dont", "où", "quand", "lorsque", "puisque",
        "le", "la", "les", "de", "du", "des",
        "à", "au", "aux", "ce", "cet", "cette", "ces",
        "mon", "notre", "votre", "me", "te", "se",
        "ma", "ta", "sa", "mes", "tes", "ses", "nos", "vos",
        "chez", "sur", "sous", "dans", "par", "dès", "entre", "pendant",
        "ne", "n'en", "n'y", "d'en", "d'y",
        "m'en", "m'y", "t'en", "t'y", "s'en", "s'y",
        "très", "parce", "s'il", "s'ils",
        "M.", "Mme", "Mlle", "Dr",
        "qu'a", "qu'ont", "qu'en", "qu'à", "qu'au", "qu'aux",
        "jusqu'à", "jusqu'au", "jusqu'aux"
    ),

    "fr_dot" : new Array(
        "M."
    ),

    "en" : new Array(
        "that", "who", "which",
        "I", "I'd", "I'll", "I'm", "I've",
        "he", "she", "we", "they",
        "and", "but", "or", "nor", "so",
        "a", "an", "the",
        "my", "your", "its", "our", "your", "their",
        "as", "than", "till", "until", "unless",
        "every", "very", "let's",
        "Mr.", "Mrs.", "Ms.", "Dr."
    ),

    "en_dot" : new Array(
        "Mr.", "Mrs.", "Ms.", "Dr."
    ),

    "none" : new Array(),
    "none_dot" : new Array(),

    // Words that can't be on the lists
    // because they might be found on the end of the first line.
    /*"fr_" : new Array(
        "un", "une", "elle", "elles", "nous", "vous", "leur", "leurs",
        "ton", "son", "or"
    ),*/

    /*"en_" : new Array(
        "you", "it", "his", "her", "yet"
    ),*/
},

MEASUREMENT_UNITS : new Array(
    "$", "€", "£", "¥", "%",
    "mm", "cm", "m", "km",
    "mm²", "cm²", "m²", "km²",
    "mm³", "cm³", "m³", "km³",
    "ms", "s", "min", "h",
    "mg", "g", "kg", "t", "lb",
    "m/s", "km/h", "mph",
    "l", "L", "cc",
    "KB", "MB", "GB", "TB",
    "Ko", "Mo", "Go", "To",
    "W", "A", "mol", "cd",
    "°C", "°F", "K"
),

// Get higher reading speed from level. 1: 35, 2: 31, 3: 27, 4: 23.
getRsFromHighLevel : function(level) {
    var result = [Infinity, 35, 31, 27, 23, 20.05][level];

    if (undefined === result) {
        return Common.STRICT_MAX_RS;
    }

    return result;
},

// Get lower reading speed from level. 1: 5, 2: 10, 3: 13, 4: 15.
getRsFromLowLevel : function(level) {
    var result = [0, 5, 10, 13, 15, 20][level];

    if (undefined === result) {
        return Common.STRICT_MIN_RS;
    }

    return result;
},

// Check duration against minimum and maximun.
checkMinMaxDuration : function(duration) {
    if (duration < VSSCore.MinimumDuration) {
        return VSSCore.MinimumDuration;
    } else if (duration > VSSCore.MaximumDuration) {
        return VSSCore.MaximumDuration;
    }

    return duration;
},

// Get ideal duration.
getIdealDuration : function(len) {
    return len * 50 + 500;
},

// Get duration from text length and reading speed.
getDurationFromLengthRs : function(len, rs) {
    return len * 1000 / rs + 500;
},

// Get reading speed from text length and duration.
getRsFromLengthDuration : function(len, duration) {
    if (duration < 500) {
        return Infinity;
    }

    return len * 1000 / (duration - 500);
},

// Get duration from text length and characters per second.
getDurationFromLengthCps : function(len, cps) {
    return len * 1000 / cps;
},

// Get characters per second from text length and duration.
getCpsFromLengthDuration : function(len, duration) {
    return len * 1000 / duration;
},

// Get text stripped from tags.
getStrippedText : function(text) {
    return text.replace(Common.TAGS_PATTERN, "");
},

// Get text as one line.
getOneLineText : function(text) {
    return Common.getLines(text).join(" ");
},

// Get an array of lines from text.
getLines : function(text) {
    return text.split(Common.NEWLINE);
},

// Check whether a text is a dialog.
isDialog : function(strippedText) {
    return (/^[\-–—]\s/m).test(strippedText);
},

// Check whether a text is an end of a sentence.
isEndOfSentence : function(strippedText) {
    return ".?!…".indexOf(strippedText.charAt(strippedText.length - 1)) >= 0;
},

// Get character length.
getCharLength : function(strippedText) {
    return strippedText.length;
},

// Get pixel width.
getPixelWidth : function(strippedText, font) {
    if (font) {
        var fontAttributes = font.split(",");
        var fontName = fontAttributes[0];
        var fontSize = parseInt(fontAttributes[1]);
        var bold = fontAttributes[2] != "0";

        return VSSCore.MeasureStringWidth(fontName, fontSize, bold,
            strippedText);
    } else {
        return VSSCore.MeasureStringWidth(Common.DEFAULT_FONTNAME,
            Common.DEFAULT_FONTSIZE, Common.DEFAULT_FONTBOLD, strippedText);
    }
},

// Get a text splitted into two lines (in character length).
getSplittedText : function(text, maxPerLine, strictMaxPerLine, lang, safe) {
    return Common.getSplittedTextGeneric(text, maxPerLine, strictMaxPerLine,
        Common.getCharLength, undefined, lang, safe);
},

// Get a text splitted into two lines (in pixel length).
getSplittedTextPixel : function(text, maxPixelsPerLine, strictMaxPixelsPerLine,
    font, lang, safe)
{
    return Common.getSplittedTextGeneric(text, maxPixelsPerLine,
        strictMaxPixelsPerLine, Common.getPixelWidth, font, lang, safe);
},

// Get a text splitted into two lines (in both character and pixel length).
getSplittedTextCharPixel : function(text, maxPerLine, strictMaxPerLine,
    maxPixelsPerLine, strictMaxPixelsPerLine, font, lang, safe)
{
    var newText = Common.getSplittedTextPixel(text, maxPixelsPerLine,
        strictMaxPixelsPerLine, font, lang, safe);
    var lines = Common.getLines(Common.getStrippedText(newText));
    var numLines = lines.length;
    var max = numLines == 1 ? maxPerLine : strictMaxPerLine;

    for (var i = 0; i < numLines; ++i) {
        if (lines[i].length > max) {
            return Common.getSplittedText(newText, maxPerLine,
                strictMaxPerLine, lang, safe);
        }
    }

    return newText;
},

// Get a text splitted into two lines (generic function).
// Based on FixError() from too_long_lines.js.
getSplittedTextGeneric : function(text, maxLen, strictMaxLen, getLen,
    font, lang, safe)
{
    var oneLineText = Common.getOneLineText(text);
    var strippedOneLineText = Common.getStrippedText(oneLineText);

    if (Common.isDialog(strippedOneLineText)) {
        return oneLineText.replace(/\s+([\-–—])(\s+)/g, Common.NEWLINE + "$1$2");
    }

    var strippedOneLineTextLen = getLen(strippedOneLineText, font);

    // Length as one line text is good?
    if (strippedOneLineTextLen <= maxLen) {
        return oneLineText;
    }

    var max = strippedOneLineTextLen > strictMaxLen ? strictMaxLen : maxLen;

    // Split text at every space that is not inclosed by tags.
    var words = oneLineText.replace(Common.TAGS_PATTERN,
        function(str) { return str.replace(/ /g, "\0"); }).split(" ");
    var numWords = words.length;

    if (numWords <= 1) {
        return oneLineText;
    }

    var strippedWords = strippedOneLineText.split(" ");

    if (Common.DEBUG_LEVEL > 1) {
        ScriptLog("words | strippedWords:");

        for (var i = 0, len = numWords; i < len; ++i) {
            ScriptLog(words[i].replace(/\0/g, " ") + " | " + strippedWords[i]);
        }
    }

    // Abc de, fghij klm.  oneLineText
    // 0   1   2     3     cutList[].wordIndex
    // 3   7   13    18    cutList[].first (characters)
    // 14  10  4     0     cutList[].second (characters)
    // 45  87  146   194   cutList[].first (pixels)
    // 149 107 48    0     cutList[].second (pixels)

    var cutListLen = numWords - 1;
    var cutList = new Array(numWords);
    var spaceLen = getLen(" ", font);
    var sumFromStart = getLen(strippedWords[0], font);
    var sumFromEnd = strippedOneLineTextLen - sumFromStart - spaceLen;
    var getRatio = function(first, second) {
        return first < second ? first / second : second / first;
    }

    // Build cut list.
    cutList[0] = {
        wordIndex: 0,
        first: sumFromStart,
        second: sumFromEnd,
        ratio: getRatio(sumFromStart, sumFromEnd)
    };

    for (var i = 1; i < cutListLen; ++i) {
        sumFromStart += spaceLen + getLen(strippedWords[i], font);
        sumFromEnd = strippedOneLineTextLen - sumFromStart - spaceLen;
        cutList[i] = {
            wordIndex: i,
            first: sumFromStart,
            second: sumFromEnd,
            ratio: getRatio(sumFromStart, sumFromEnd)
        };
    }

    cutList[i] = {
        wordIndex: i,
        first: strippedOneLineTextLen,
        second: 0,
        ratio: 0.
    };

    // Sort cut list from most to least balanced line lengths.
    cutList.sort(function(a, b) {
        return b.ratio > a.ratio ? 1 :
            b.ratio < a.ratio ? -1 :
            b.wordIndex < a.wordIndex ? 1 : -1;
    });

    if (Common.DEBUG_LEVEL > 1) {
        ScriptLog("cutList:");

        for (var i = 0; i < numWords; ++i) {
            ScriptLog([cutList[i].wordIndex, cutList[i].first,
                cutList[i].second, cutList[i].ratio].join(", "));
        }
    }

    var endWithList = new Array("?!", ":;", ",");
    var found = false;
    var minRatio = 0.2;
    var cutIndex;

    var nonTerminatingWords = Common.NON_TERMINATING_WORDS[lang];

    if (undefined === nonTerminatingWords) {
        lang = Common.detectLanguage();
        nonTerminatingWords =  Common.NON_TERMINATING_WORDS[lang];
    }

    var nonTerminatingWordsDot = Common.NON_TERMINATING_WORDS[lang + "_dot"];

    // Find the best cut point after a dot, taking word list into account.
    for (cutIndex = 0;
        cutIndex < cutListLen &&
        cutList[cutIndex].first <= max &&
        cutList[cutIndex].second <= max &&
        cutList[cutIndex].ratio >= minRatio;
        ++cutIndex)
    {
        var strippedWord = strippedWords[cutList[cutIndex].wordIndex];

        if (strippedWord.charAt(strippedWord.length - 1) == "." &&
            nonTerminatingWordsDot.indexOf(strippedWord) < 0) {
            found = true;
            break;
        }
    }

    // Find the best cut point after a punctuation mark.
    if (!found) {
        for (var i = 0, len = endWithList.length; i < len && !found; ++i) {
            for (cutIndex = 0;
                cutIndex < cutListLen &&
                cutList[cutIndex].first <= max &&
                cutList[cutIndex].second <= max &&
                cutList[cutIndex].ratio >= minRatio;
                ++cutIndex)
            {
                var strippedWord = strippedWords[cutList[cutIndex].wordIndex];

                if (endWithList[i].indexOf(
                    strippedWord.charAt(strippedWord.length - 1)) >= 0)
                {
                    found = true;
                    break;
                }
            }
        }
    }

    // Find another cut point if a good one at a punctuation mark wasn't found.
    if (!found) {
        if (safe) {
            return oneLineText;
        }

        var strippedWord = strippedWords[cutList[0].wordIndex];

        // If needed, try to find another cut point than the most balanced one.
        if (nonTerminatingWords.indexOf(strippedWord) >= 0) {
            var found = false;
            var goodFallback = 0;
            var badFallback = 0;

            for (cutIndex = 1;
                cutIndex < cutListLen &&
                cutList[cutIndex].ratio >= minRatio;
                ++cutIndex)
            {
                var wordIndex = cutList[cutIndex].wordIndex;
                var firstWord = strippedWords[wordIndex];

                if (nonTerminatingWords.indexOf(firstWord) < 0) {
                    if (cutList[cutIndex].first <= max &&
                        cutList[cutIndex].second <= max)
                    {
                        var secondWord = strippedWords[wordIndex + 1];

                        if (nonTerminatingWords.indexOf(secondWord) >= 0) {
                            found = true;
                            break;
                        } else if (!goodFallback) {
                            goodFallback = cutIndex;
                        }
                    } else if (!badFallback) {
                        badFallback = cutIndex;
                    } else {
                        break;
                    }
                }
            }

            // Fallback to most balanced cut point.
            if (!found) {
                cutIndex = goodFallback ? goodFallback :
                    cutList[badFallback].ratio < cutList[0].ratio ?
                    0 : badFallback;
            }
        } else {
            cutIndex = 0;
        }

        // Prevent a bad cut before some punctuation marks,
        // between two numbers, or between a number and a unit of measurement.
        if (cutIndex == 0) {
            while (true) {
                var firstWord = strippedWords[cutList[cutIndex].wordIndex];
                var secondWord = strippedWords[cutList[cutIndex].wordIndex + 1];

                if ("?!;:".indexOf(secondWord.charAt(0)) >= 0 ||
                    (!isNaN(firstWord) &&
                    (!isNaN(secondWord) ||
                    Common.MEASUREMENT_UNITS.indexOf(secondWord) >= 0)))
                {
                    cutIndex += (cutIndex + 3 > cutListLen ||
                        cutList[cutIndex + 1].ratio >
                        cutList[cutIndex + 2].ratio) ? 1 : 2;

                    if (cutIndex >= cutListLen) {
                        break;
                    }
                } else {
                    break;
                }
            }
        }
    }

    // Build new text.
    var splitPos = cutList[cutIndex].wordIndex + 1;
    var newText = splitPos < numWords ?
        (words.slice(0, splitPos).join(" ") + Common.NEWLINE +
        words.slice(splitPos).join(" ")).replace(/\0/g, " ") : oneLineText;

    if (Common.DEBUG_LEVEL) {
        ScriptLog("Return from Common.getSplittedTextGeneric():");
        ScriptLog(newText);
        ScriptLog("");
    }

    return newText;
},

// Get non overlapped start.
getNonOverlappedStart : function(start, previousSub, previousSceneChange) {
    // No overlap on previous subtitle.
    // null or undefined: no previous subtitle or ignore overlap
    if (previousSub) {
        var afterPreviousSub = previousSub.Stop + VSSCore.MinimumBlank;

        if (start < afterPreviousSub) {
            start = afterPreviousSub;
        }
    }

    // No ovelap on previous scene change.
    // -1: no previous scene change or ignore overlap
    // null or undefined: unoverlap any scene change
    if (previousSceneChange) {
        if (previousSceneChange >= 0) {
            var previousSceneChangeStop = previousSceneChange +
                SceneChange.StopOffset;

            if (start < previousSceneChangeStop) {
                start = previousSceneChangeStop;
            }
        }
    } else {
        // Get the scene change previous to the start timing.
        var previousSceneChange = SceneChange.GetPrevious(start);

        if (previousSceneChange >= 0) {
            var previousSceneChangeStop = previousSceneChange +
                SceneChange.StopOffset;

            if (start < previousSceneChangeStop) {
                start = previousSceneChangeStop;
            }
        }

        // Get the scene change next to the start timing.
        var nextSceneChange = SceneChange.GetNext(start);

        if (nextSceneChange >= 0) {
            var nextSceneChangeStart = nextSceneChange -
                SceneChange.FilterOffset;

            if (nextSceneChangeStart < start) {
                start = nextSceneChange + SceneChange.StopOffset;
            }
        }
    }

    return start;
},

// Get non overlapped stop.
getNonOverlappedStop : function(stop, nextSub, nextSceneChange) {
    // No overlap on next subtitle.
    // null or undefined: no next subtitle or ignore overlap
    if (nextSub) {
        var beforeNextSub = nextSub.Start - VSSCore.MinimumBlank;

        if (stop > beforeNextSub) {
            stop = beforeNextSub;
        }
    }

    // No overlap on next scene change.
    // -1: no next scene change or ignore overlap
    // null or undefined: unoverlap any scene change
    if (nextSceneChange) {
        if (nextSceneChange >= 0) {
            var nextSceneChangeStart = nextSceneChange -
                SceneChange.StartOffset;

            if (stop > nextSceneChangeStart) {
                stop = nextSceneChangeStart;
            }
        }
    } else {
        // Get the scene change next to the stop timing.
        var nextSceneChange = SceneChange.GetNext(stop);

        if (nextSceneChange >= 0) {
            var nextSceneChangeStart = nextSceneChange -
                SceneChange.StartOffset;

            if (nextSceneChangeStart < stop) {
                stop = nextSceneChangeStart;
            }
        }

        // Get the scene change previous to the stop timing.
        var previousSceneChange = SceneChange.GetPrevious(stop);

        if (previousSceneChange >= 0) {
            var previousSceneChangeStop = previousSceneChange +
                SceneChange.FilterOffset;

            if (stop < previousSceneChangeStop) {
                stop = previousSceneChange - SceneChange.StartOffset;
            }
        }
    }

    return stop;
},

// Perform a formatting operation on a message.
formatMessage : function(message, values) {
    return message.replace(/{(\w+)}/g, function(s, p) { return values[p]; });
},

// Get number as text.
getNumberText : function(number) {
    if (number < Common.NUMBER_TEXTS.length) {
        return Common.NUMBER_TEXTS[number - 1];
    } else {
        return Common.formatMessage(
            Common.NUMBER_TEXTS[Common.NUMBER_TEXTS.length - 1], {n: number});
    }
},

// Get nth as text.
getNthText : function(number) {
    if (number < Common.NTH_TEXTS.length) {
        return Common.NTH_TEXTS[number - 1];
    } else {
        return Common.formatMessage(
            Common.NTH_TEXTS[Common.NTH_TEXTS.length - 1], {n: number});
    }
},

// Detect the language.
detectLanguage : function(nocache) {
    // Cached result for "Check errors".
    if (!nocache && this.DetectedLanguage) {
        return this.DetectedLanguage;
    }

    var numSamples = 8;
    var weights = {
        "en": 1,
        "fr": 2,
    };
    var subCount = VSSCore.GetSubCount();
    var step = Math.round(subCount / numSamples) || 1;
    var counts = {};

    for (var i = 0; i < subCount; i += step) {
        var lang = (/[àéèêëîïôöùç]|[\s\u202f]+[?!:;%]|\b(les?|la|des?|une?|es?t|je|tu|ils?|ne|pas|que|qui)\b/i).
            test(VSSCore.GetSubAt(i).Text) ? "fr" : "en";

        if (counts[lang]) {
            counts[lang] += weights[lang];
        } else {
            counts[lang] = weights[lang];
        }

        if (Common.DEBUG_LEVEL > 1) {
            ScriptLog("text: " + VSSCore.GetSubAt(i).Text);
            ScriptLog("lang: " + lang);
            ScriptLog();
        }
    }

    var max = 0;

    for (var lang in counts) {
        var count = counts[lang];

        if (count > max) {
            max = count;
            this.DetectedLanguage = lang;
        }
    }

    if (Common.DEBUG_LEVEL) {
        ScriptLog("Detected language: " + this.DetectedLanguage +
            " (" + (max * 100 / numSamples) + "%)");
    }

    return this.DetectedLanguage;
},

// Get frame duration.
getFrameDuration : function() {
    //if (this.FrameDuration) {
        //return this.FrameDuration;
    //}

    var frameDurations = [
        1001 / 24,
        1000 / 24,
        1000 / 25,
        1001 / 30,
        1000 / 30
    ];
    var votes = [0, 0, 0, 0, 0];
    var numSamples = 8;
    var count = SceneChange.GetCount();
    var step = Math.round(count / numSamples) || 1;

    for (var i = 1; i < count; i += step) {
        var timing = SceneChange.GetAt(i);
        var minDiff = 1.;
        var picked;

        for (var j = 0; j < frameDurations.length; ++j) {
            var frame = timing / frameDurations[j];
            var roundedFrame = Math.round(frame);
            var diff = Math.abs(frame - roundedFrame);
            if (diff < minDiff) {
                minDiff = diff;
                picked = j;
            }
        }

        ++votes[picked];
    }

    var max = 0;
    var picked;

    for (var i = 0; i < votes.length; ++i) {
        var vote = votes[i];
        if (vote > max) {
            max = vote;
            picked = i;
        }
    }

    this.FrameDuration = frameDurations[picked];
    return this.FrameDuration;
},


// ---------------------------------------------------------------------------
// Variables and functions inherited from "common/tools.js".
// ---------------------------------------------------------------------------

// Reading speed definitions.
READING_SPEED_DEF : [
    // Pure green hue = 120 degrees (red = 0 degree, blue = 240 degrees)
    // Base color: 0x99ff99
    {value: 5,        color: 0x9999ff /* 240 */, text: "TOO SLOW!"},
    {value: 10,       color: 0x99ccff /* 210 */, text: "Slow, acceptable."},
    {value: 13,       color: 0x99ffff /* 180 */, text: "A bit slow."},
    {value: 15,       color: 0x99ffcc /* 150 */, text: "Good."},
    {value: 23,       color: 0x99ff99 /* 120 */, text: "Perfect."},
    {value: 27,       color: 0xccff99 /*  90 */, text: "Good."},
    {value: 31,       color: 0xffff99 /*  60 */, text: "A bit fast."},
    {value: 35,       color: 0xffcc99 /*  30 */, text: "Fast, acceptable."},
    {value: Infinity, color: 0xff9999 /*   0 */, text: "TOO FAST!"}
],

// Get reading speed from a subtitle.
getReadingSpeed : function(subtitle) {
    var duration = subtitle.Stop - subtitle.Start;

    if (duration < 500) {
        return Infinity;
    }

    return subtitle.StrippedText.length * 1000 / (duration - 500);
},

// Get reading speed rating.
getReadingSpeedRating : function(rs) {
    var index = Common.getReadingSpeedIndex(rs);
    return Common.READING_SPEED_DEF[index].text;
},

// Get reading speed as text.
getReadingSpeedAsText : function(subtitle) {
    var rs = Common.getReadingSpeed(subtitle);
    var roundedRs = Common.decimal1Round(rs);
    return roundedRs == rs ? roundedRs.toString() : roundedRs.toFixed(1);
},

// Get reading speed as color.
getReadingSpeedAsColor : function(subtitle) {
    var rs = Common.getReadingSpeed(subtitle);
    var index = Common.getReadingSpeedIndex(rs);
    return Common.READING_SPEED_DEF[index].color;
},

// Get reading speed index.
getReadingSpeedIndex : function(rs) {
    for (var i = 0, len = Common.READING_SPEED_DEF.length - 1; i < len; ++i) {
        if (rs < Common.READING_SPEED_DEF[i].value) {
            return i;
        }
    }

    return len;
},

// Round a number to one decimal.
decimal1Round : function(value) {
    return Math.round(value * 10) / 10;
},

// ---------------------------------------------------------------------------
// Additions
// ---------------------------------------------------------------------------

// Get characters per second from a subtitle.
getCharactersPerSecond : function(subtitle) {
    return subtitle.StrippedText.length * 1000 /
        (subtitle.Stop - subtitle.Start);
},

// Get characters per second as text.
getCharactersPerSecondAsText : function(subtitle) {
    var cps = Common.getCharactersPerSecond(subtitle);
    var roundedCps = Common.decimal1Round(cps);
    return roundedCps == cps ? roundedCps.toString() : roundedCps.toFixed(1);
},

// ---------------------------------------------------------------------------

// var Common
};


Common.LIMIT_PIXEL_WIDTH = VSSCore.MeasureStringWidth(
    Common.DEFAULT_FONTNAME, Common.DEFAULT_FONTSIZE, Common.DEFAULT_FONTBOLD,
    "La limite en longueur à ne pas dépasser.");
Common.REFERENCE_LIMIT_PIXEL_WIDTH = 465;

if (Common.LIMIT_PIXEL_WIDTH != Common.REFERENCE_LIMIT_PIXEL_WIDTH) {

Common.PIXEL_FACTOR = Common.REFERENCE_LIMIT_PIXEL_WIDTH /
    Common.LIMIT_PIXEL_WIDTH;

// Pixel lengths (Arial Bold 18pt) for all the Windows-125x charsets
// (and some more characters).
// Used if VSSCore.MeasureStringWidth() is unavailable.
// Values calculated from TextRenderer.MeasureText().
Common.PIXEL_WIDTHS = {
    9: 0, 10: 0, 13: 0, 32: 7, 33: 7, 34: 11, 35: 13, 36: 13, 37: 18, 38: 17,
    39: 6, 40: 8, 41: 8, 42: 9, 43: 14, 44: 7, 45: 8, 46: 7, 47: 7, 48: 13,
    49: 13, 50: 13, 51: 13, 52: 13, 53: 13, 54: 13, 55: 13, 56: 13, 57: 13,
    58: 7, 59: 7, 60: 14, 61: 14, 62: 14, 63: 15, 64: 23, 65: 17, 66: 17,
    67: 17, 68: 17, 69: 16, 70: 15, 71: 19, 72: 17, 73: 7, 74: 13, 75: 17,
    76: 15, 77: 21, 78: 17, 79: 18, 80: 16, 81: 18, 82: 17, 83: 16, 84: 15,
    85: 17, 86: 16, 87: 23, 88: 16, 89: 15, 90: 14, 91: 8, 92: 7, 93: 8,
    94: 14, 95: 13, 96: 8, 97: 13, 98: 15, 99: 13, 100: 15, 101: 13, 102: 8,
    103: 15, 104: 15, 105: 7, 106: 7, 107: 13, 108: 7, 109: 21, 110: 15,
    111: 15, 112: 15, 113: 15, 114: 9, 115: 13, 116: 8, 117: 15, 118: 13,
    119: 19, 120: 13, 121: 13, 122: 12, 123: 9, 124: 7, 125: 9, 126: 14,
    160: 7, 161: 7, 162: 13, 163: 13, 164: 13, 165: 13, 166: 7, 167: 13,
    168: 8, 169: 18, 170: 9, 171: 13, 172: 14, 173: 8, 174: 18, 175: 13,
    176: 10, 177: 13, 178: 8, 179: 8, 180: 8, 181: 14, 182: 13, 183: 7,
    184: 7, 185: 8, 186: 9, 187: 13, 188: 20, 189: 20, 190: 20, 191: 15,
    192: 17, 193: 17, 194: 17, 195: 17, 196: 17, 197: 17, 198: 24, 199: 17,
    200: 16, 201: 16, 202: 16, 203: 16, 204: 7, 205: 7, 206: 7, 207: 7,
    208: 17, 209: 17, 210: 18, 211: 18, 212: 18, 213: 18, 214: 18, 215: 14,
    216: 19, 217: 17, 218: 17, 219: 17, 220: 17, 221: 15, 222: 16, 223: 15,
    224: 13, 225: 13, 226: 13, 227: 13, 228: 13, 229: 13, 230: 21, 231: 13,
    232: 13, 233: 13, 234: 13, 235: 13, 236: 7, 237: 7, 238: 7, 239: 7,
    240: 15, 241: 15, 242: 15, 243: 15, 244: 15, 245: 15, 246: 15, 247: 13,
    248: 15, 249: 15, 250: 15, 251: 15, 252: 15, 253: 13, 254: 15, 255: 13,
    256: 17, 257: 13, 258: 17, 259: 13, 260: 17, 261: 13, 262: 17, 263: 13,
    268: 17, 269: 13, 270: 17, 271: 17, 272: 17, 273: 15, 274: 16, 275: 13,
    278: 16, 279: 13, 280: 16, 281: 13, 282: 16, 283: 13, 286: 19, 287: 15,
    290: 19, 291: 15, 298: 7, 299: 7, 302: 7, 303: 7, 304: 7, 305: 7,
    310: 17, 311: 13, 313: 15, 314: 7, 315: 15, 316: 7, 317: 15, 318: 9,
    321: 15, 322: 7, 323: 17, 324: 15, 325: 17, 326: 15, 327: 17, 328: 15,
    332: 18, 333: 15, 336: 18, 337: 15, 338: 24, 339: 23, 340: 17, 341: 9,
    342: 17, 343: 9, 344: 17, 345: 9, 346: 16, 347: 13, 350: 16, 351: 13,
    352: 16, 353: 13, 354: 15, 355: 8, 356: 15, 357: 12, 362: 17, 363: 15,
    366: 17, 367: 15, 368: 17, 369: 15, 370: 17, 371: 15, 376: 15, 377: 14,
    378: 12, 379: 14, 380: 12, 381: 14, 382: 12, 402: 13, 416: 20, 417: 17,
    431: 20, 432: 17, 710: 8, 711: 8, 728: 8, 729: 8, 731: 9, 732: 8, 733: 8,
    768: 0, 769: 0, 771: 0, 777: 0, 803: 0, 900: 8, 901: 11, 902: 17,
    904: 20, 905: 22, 906: 11, 908: 20, 910: 22, 911: 20, 912: 7, 913: 17,
    914: 17, 915: 14, 916: 17, 917: 16, 918: 14, 919: 17, 920: 18, 921: 7,
    922: 17, 923: 16, 924: 21, 925: 17, 926: 15, 927: 18, 928: 17, 929: 16,
    931: 14, 932: 15, 933: 15, 934: 19, 935: 16, 936: 19, 937: 19, 938: 7,
    939: 15, 940: 15, 941: 11, 942: 15, 943: 7, 944: 14, 945: 15, 946: 15,
    947: 13, 948: 15, 949: 11, 950: 11, 951: 15, 952: 13, 953: 7, 954: 13,
    955: 13, 956: 15, 957: 13, 958: 11, 959: 15, 960: 18, 961: 15, 962: 12,
    963: 16, 964: 11, 965: 14, 966: 17, 967: 14, 968: 17, 969: 19, 970: 7,
    971: 14, 972: 15, 973: 14, 974: 19, 1025: 16, 1026: 21, 1027: 14,
    1028: 17, 1029: 16, 1030: 7, 1031: 7, 1032: 13, 1033: 26, 1034: 26,
    1035: 21, 1036: 15, 1038: 15, 1039: 17, 1040: 17, 1041: 17, 1042: 17,
    1043: 14, 1044: 17, 1045: 16, 1046: 21, 1047: 15, 1048: 17, 1049: 17,
    1050: 15, 1051: 17, 1052: 21, 1053: 17, 1054: 18, 1055: 17, 1056: 16,
    1057: 17, 1058: 15, 1059: 15, 1060: 21, 1061: 16, 1062: 18, 1063: 17,
    1064: 25, 1065: 25, 1066: 21, 1067: 23, 1068: 17, 1069: 17, 1070: 25,
    1071: 17, 1072: 13, 1073: 15, 1074: 15, 1075: 10, 1076: 15, 1077: 13,
    1078: 17, 1079: 12, 1080: 15, 1081: 15, 1082: 12, 1083: 15, 1084: 19,
    1085: 15, 1086: 15, 1087: 15, 1088: 15, 1089: 13, 1090: 11, 1091: 13,
    1092: 21, 1093: 13, 1094: 15, 1095: 14, 1096: 21, 1097: 21, 1098: 18,
    1099: 21, 1100: 15, 1101: 13, 1102: 21, 1103: 14, 1105: 13, 1106: 15,
    1107: 10, 1108: 13, 1109: 13, 1110: 7, 1111: 7, 1112: 7, 1113: 23,
    1114: 22, 1115: 15, 1116: 12, 1118: 13, 1119: 15, 1168: 12, 1169: 11,
    1456: 8, 1457: 8, 1458: 8, 1459: 8, 1460: 8, 1461: 8, 1462: 8, 1463: 8,
    1464: 8, 1465: 8, 1467: 8, 1468: 8, 1469: 8, 1470: 11, 1471: 8, 1472: 7,
    1473: 8, 1474: 8, 1475: 7, 1488: 14, 1489: 14, 1490: 11, 1491: 13,
    1492: 15, 1493: 7, 1494: 10, 1495: 15, 1496: 15, 1497: 7, 1498: 13,
    1499: 12, 1500: 12, 1501: 15, 1502: 15, 1503: 7, 1504: 9, 1505: 15,
    1506: 13, 1507: 14, 1508: 14, 1509: 12, 1510: 12, 1511: 14, 1512: 13,
    1513: 17, 1514: 16, 1520: 13, 1521: 13, 1522: 13, 1523: 7, 1524: 12,
    1548: 8, 1563: 8, 1567: 9, 1569: 11, 1570: 6, 1571: 5, 1572: 11, 1573: 5,
    1574: 6, 1575: 5, 1576: 7, 1577: 8, 1578: 7, 1579: 7, 1580: 12, 1581: 12,
    1582: 12, 1583: 8, 1584: 8, 1585: 10, 1586: 10, 1587: 15, 1588: 15,
    1589: 19, 1590: 19, 1591: 13, 1592: 13, 1593: 11, 1594: 11, 1600: 5,
    1601: 7, 1602: 7, 1603: 9, 1604: 6, 1605: 10, 1606: 7, 1607: 13,
    1608: 11, 1609: 13, 1610: 6, 1611: 0, 1612: 0, 1613: 0, 1614: 0, 1615: 0,
    1616: 0, 1617: 0, 1618: 0, 1657: 7, 1662: 7, 1670: 12, 1672: 8, 1681: 10,
    1688: 10, 1705: 12, 1711: 12, 1722: 13, 1726: 10, 1729: 8, 1746: 19,
    8204: 0, 8205: 0, 8206: 0, 8207: 0, 8211: 13, 8212: 24, 8213: 24,
    8216: 7, 8217: 7, 8218: 7, 8220: 12, 8221: 12, 8222: 12, 8224: 13,
    8225: 13, 8226: 8, 8230: 24, 8239: 5, 8240: 23, 8249: 8, 8250: 8, 8362: 20,
    8363: 12, 8364: 13, 8470: 27, 8482: 24
};

Common.getPixelWidth = function(strippedText, font) {
    if (font) {
        var fontAttributes = font.split(",");
        var fontName = fontAttributes[0];
        var fontSize = parseInt(fontAttributes[1]);
        var bold = fontAttributes[2] != "0";
    } else {
        var fontName = Common.DEFAULT_FONTNAME;
        var fontSize = Common.DEFAULT_FONTSIZE;
        var bold = Common.DEFAULT_FONTBOLD;
    }

    if (fontName == Common.DEFAULT_FONTNAME &&
        fontSize == Common.DEFAULT_FONTSIZE &&
        bold == Common.DEFAULT_FONTBOLD
    ) {
        var totalPixelLen = 0;

        for (var i = 0, len = strippedText.length; i < len; ++i) {
            var pixelLen = Common.PIXEL_WIDTHS[strippedText.charCodeAt(i)];

            if (undefined !== pixelLen) {
                totalPixelLen += pixelLen;
            } else {
                break;
            }
        }

        if (i >= len) {
            return totalPixelLen;
        }
    }

    return Math.round(VSSCore.MeasureStringWidth(fontName, fontSize, bold,
        strippedText) * Common.PIXEL_FACTOR);
};

} // if VSSCore.MeasureStringWidth...

// if (undefined === Common)
}
