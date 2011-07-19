// More detailed Quick stats for VisualSubSync
// Nathbot <nathbot (at) gmail.com>
// Spirit <hiddenspirit (at) gmail.com>
//
// Based on:
// original "Quick stats" (Toff)
// Subtitles statistics PHP script (Spirit)
//

LoadScript("../common/common.js");
// ---------------------------------------------------------------------------

JSAction_QuickStats = {
  onExecute : function() {
    stats = this.run();
    ScriptLog("-------- Quick stats ----------");
    ScriptLog("Total subtitle count: " + (stats ? stats.subCount : 0));
    if (stats) {
        ScriptLog("Valid subtitle count: " + stats.validCount);

        if (stats.validCount > 0) {
            ScriptLog("-------------------------------");

            // Display results.
            for (var i = 0; i < stats.rsArray.length; ++i) {
                var rsCount = stats.rsArray[i];
                var rsCountPercent = rsCount * 100 / stats.validCount;

                ScriptLog(Common.READING_SPEED_DEF[i].text + " = " + rsCount +
                    " (" + Common.decimal1Round(rsCountPercent) + "%)");
            }

            ScriptLog("-------------------------------");
            ScriptLog("Minimum reading speed: " + Common.decimal1Round(stats.minRs) +
                " (" + Common.getReadingSpeedRating(stats.minRs) + ")");
            ScriptLog("Maximum reading speed: " + Common.decimal1Round(stats.maxRs) +
                " (" + Common.getReadingSpeedRating(stats.maxRs) + ")");
            ScriptLog("Average reading speed: " + Common.decimal1Round(stats.avgRs) +
                " (" + Common.getReadingSpeedRating(stats.avgRs) + ")");
            ScriptLog("-------------------------------");
            ScriptLog("Minimum chars per sec: " + Common.decimal1Round(stats.minCps));
            ScriptLog("Maximum chars per sec: " + Common.decimal1Round(stats.maxCps));
            ScriptLog("Average chars per sec: " + Common.decimal1Round(stats.avgCps));
            ScriptLog("-------------------------------");
            ScriptLog("Maximum lines per sub: " + stats.maxLines);
            ScriptLog("Maximum chars per line: " + stats.maxCharPerLine);
            ScriptLog("Maximum pixel width: " + stats.maxPixelWidth);
            ScriptLog("Minimum duration: " + stats.minDuration / 1000 + " s");
            ScriptLog("Maximum duration: " + stats.maxDuration / 1000 + " s");
            ScriptLog("Minimum blank: " +
                (isFinite(stats.minBlank) ? stats.minBlank + " ms" : "N/A"));
            ScriptLog("Common blank: " + (undefined !== stats.commonBlank ?
                stats.commonBlank + " ms" : "N/A"));
            ScriptLog("-------------------------------");
            ScriptLog("Total text characters: " + stats.totalText);
        }
    }
    ScriptLog("---");
  },

  run : function() {
    var subCount = VSSCore.GetSubCount();

    if (subCount > 0) {
        var validCount = 0;
        var minRs = Infinity;
        var maxRs = 0;
        var sumRs = 0;
        var minCps = Infinity;
        var maxCps = 0;
        var sumCps = 0;
        var maxLines = 0;
        var maxCharPerLine = 0;
        var maxPixelWidth = 0;
        var minDuration = Infinity;
        var maxDuration = 0;
        var minBlank = Infinity;
        var totalText = 0;
        var blanks = new Object();

        // Table to store reading speed results.
        var rsArrayLen = Common.READING_SPEED_DEF.length;
        var rsArray = new Array(rsArrayLen);

        for (var i = 0; i < rsArrayLen; ++i) {
            rsArray[i] = 0;
        }

        // Iterate over all subtitles to collect stats.
        for (var sub = VSSCore.GetFirst(); null !== sub; sub = nextSub) {
            var nextSub = VSSCore.GetNext(sub);
            var strippedText = sub.StrippedText;
            var len = sub.StrippedText.length;
            var duration = sub.Stop - sub.Start;
            var cps = Common.getCpsFromLengthDuration(len, duration);
            var rs = Common.getRsFromLengthDuration(len, duration);
            var lines = Common.getLines(strippedText);
            var numLines = lines.length;
            var blank = nextSub ? nextSub.Start - sub.Stop : null;
            var rsIndex = Common.getReadingSpeedIndex(rs);

            // Ignore invalid subtitles.
            if (!isFinite(rs) || !isFinite(cps) || !len) {
                continue;
            }

            ++rsArray[rsIndex];
            ++validCount;
            totalText += len;

            // Reading speed.
            if (rs < minRs) {
                minRs = rs;
            }

            if (rs > maxRs) {
                maxRs = rs;
            }

            sumRs += rs;

            // Chars per sec.
            if (cps < minCps) {
                minCps = cps;
            }

            if (cps > maxCps) {
                maxCps = cps;
            }

            sumCps += cps;

            // Number of lines.
            if (numLines > maxLines) {
                maxLines = numLines;
            }

            // Chars per line.
            for (var i = 0; i < numLines; ++i) {
                var lineLen = lines[i].length;
                if (lineLen > maxCharPerLine) {
                    maxCharPerLine = lineLen;
                }

                var pixelWidth = Common.getPixelWidth(lines[i]);
                if (pixelWidth > maxPixelWidth) {
                    maxPixelWidth = pixelWidth;
                }
            }

            // Duration.
            if (duration < minDuration) {
                minDuration = duration;
            }

            if (duration > maxDuration) {
                maxDuration = duration;
            }

            // Blank.
            if (null !== blank) {
                if (blank < minBlank) {
                    minBlank = blank;
                }
                if (undefined === blanks[blank]) {
                    blanks[blank] = 1;
                } else {
                    ++blanks[blank];
                }
            }
        }

        var avgRs = sumRs / validCount;
        var avgCps = sumCps / validCount;
        var commonBlank = this.getMaxKey(blanks);
        return {
            subCount: subCount,
            validCount: validCount,
            rsArray: rsArray,
            minRs: minRs,
            maxRs: maxRs,
            avgRs: avgRs,
            minCps: minCps,
            maxCps: maxCps,
            avgCps: avgCps,
            maxLines: maxLines,
            maxCharPerLine: maxCharPerLine,
            maxPixelWidth: maxPixelWidth,
            minDuration: minDuration,
            maxDuration: maxDuration,
            minBlank: minBlank,
            commonBlank: commonBlank,
            totalText: totalText
        };
    }
    return null;
  },

  getMaxKey : function(array) {
    var maxKey, maxValue = -Infinity;
    for (var key in array) {
        if (array[key] > maxValue) {
            maxKey = key;
            maxValue = array[key];
        }
    }
    return maxKey;
  }
};

VSSCore.RegisterJavascriptAction("JSAction_QuickStats", "Quick stats",
    "Ctrl+M");

// ---------------------------------------------------------------------------
