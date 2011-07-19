/*
  Show quick stats:
  - subtitle count
  - average reading speed
  - number of subtitles per reading speed rating

  08 Dec 2008   modified by thyresias at gmail dot com
*/

function percentAsText(percent) {
  // 0: a dash, no % sign
  if (percent == 0) return "- ";
  // round to integer
  percent = Math.round(percent);
  // if now zero, less than 0.5
  if (percent == 0) return "<1%"; // don't add a decimal just for this case
  return "" + percent + "%";
}

JSAction_QuickStats = {
  onExecute: function() {

    logTitle("Quick Stats");

    var subCount = VSSCore.GetSubCount();
    ScriptLog("    Subtitle Count: " + subCount);

    if (subCount <= 0) return;

    // array to store the results
    var rsStats = new Array(RS_RATINGS.length);
    for (var i = 0; i < rsStats.length; i++)
      rsStats[i] = {obsCount: 0};

    // loop on subtitles to collect stats
    var sub = VSSCore.GetFirst();
    var mean = 0;
    var nvar = 0;  // N times the variance
    var n = 0;          // subtitles with computable speed (duration > 500 ms)
    var nInfinite = 0;  // unreadable subtitles (duration <= 500 ms)
    for (var i = 1; sub; i++) {
      var len = sub.StrippedText.length;
      var dur = (sub.Stop - sub.Start) / 1000 - 0.5;
      if (dur <= 0)
        nInfinite++;
      else {
        n++;
        var rs = len / dur;
        var delta = rs - mean;
        mean += delta / n;
        nvar += delta * delta * (n - 1) / n;
      }
      rsStats[readingSpeedRating(sub).index].obsCount++;
      sub = VSSCore.GetNext(sub);
    }
    var std = Math.sqrt(nvar/n);

    // display the average reading speed
    ScriptLog("    Average Reading Speed: " + round1(mean) + " c/s (pro: 18 to 20)");
    ScriptLog("    Standard Deviation:    " + round1(std) + " c/s (pro: 4 to 5)");
    ScriptLog("    Unreadable Subtitles:  " + nInfinite + " (pro: 0)");

    // Compute % and expected values.
    // Find the longest text in each display column,
    // and the max number of subtitles in a category
    var xSym = 0;
    var xText = 0;
    var xPercent = 3;  // 99% or <1%
    var xObsCount = 0;
    var xExpCount = 0;
    var maxObsCount = 0;
    var maxExpCount = 0;
    for (var i = 0; i < RS_RATINGS.length; i++) {
      var rs = RS_RATINGS[i];
      var obsCount = rsStats[i].obsCount;
      var obsPercent = obsCount / subCount * 100;
      var expCount = Math.round(rs.proba * subCount);
      var expPercent = rs.proba * 100;
      rsStats[i].obsPercent = obsPercent;
      rsStats[i].expCount = expCount;
      rsStats[i].expPercent = expPercent;
      // text lengths
      if (rs.symbol.length > xSym) xSym = rs.symbol.length;
      if (rs.text.length > xText) xText = rs.text.length;
      // count lengths
      var len = ("" + obsCount).length;
      if (len > xObsCount) xObsCount = len;
      len = ("" + expCount).length;
      if (len > xExpCount) xExpCount = len;
      // max counts
      if (obsCount > maxObsCount) maxObsCount = obsCount;
      if (expCount > maxExpCount) maxExpCount = expCount;
    }

    // space left for bars
    var left = MAX_LOG_WIDTH - (xSym + 1 + xText+4 + 1 + xPercent + 1+xObsCount + 1+0 + 1 + xPercent + 1+xExpCount + 1+0);
    var xObsBar = Math.ceil(left/2);
    var xExpBar = Math.floor(left/2);

    ScriptLog(
      padRight("", xSym, "-") + " " +
      padRight("Rating ", xText+4, "-") + " " +
      padRight("--- Observed ", xPercent + 1+xObsCount + 1+xObsBar, "-") + " " +
      padRight("--- Expected ", xPercent + 1+xExpCount + 1+xExpBar, "-")
    );

    // display the stats by rating
    for (var i = 0; i < RS_RATINGS.length; i++) {
      var rs = RS_RATINGS[i];
      // symbol, text & leading dots
      var text = padLeft(rs.symbol, xSym, " ") + " " + padRight(rs.text + " ", xText+4, ".");
      // observed percentage, count & bar
      text += padLeft(percentAsText(rsStats[i].obsPercent), 1+xPercent, " ");
      text += padLeft("" + rsStats[i].obsCount, 1+xObsCount, " ");
      var barLength = Math.round(xObsBar / maxObsCount * rsStats[i].obsCount)
      text += " " + padRight("", barLength, OBS);
      text += padRight("", xObsBar - barLength, " ");
      // observed percentage, count & bar
      text += padLeft(percentAsText(rsStats[i].expPercent), 1+xPercent, " ");
      text += padLeft("" + rsStats[i].expCount, 1+xExpCount, " ");
      var barLength = Math.round(xExpBar / maxExpCount * rsStats[i].expCount)
      text += " " + padRight("", barLength, EXP);
      // output the line
      ScriptLog(text);
    }

  }
};

VSSCore.RegisterJavascriptAction('JSAction_QuickStats', 'Quick stats', 'Ctrl+Q');
