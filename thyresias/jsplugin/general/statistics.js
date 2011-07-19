/*
  Statistics on subtitles
  thyresias at gmail dot com (www.calorifix.net)
  14 Jan 2006
  27 Apr 2006  added selection of histograms
  20 Jan 2007  used "display/reading speed" wording
  14 Nov 2008  modified for new fixed-pitch log font, removed display speed
*/

// Array.max()
Array.prototype.max = function() {
  var max = this[0];
  for (var i = 1; i < this.length; i++)
    if (this[i] > max) max = this[i];
  return max;
}

// Array.nz(valueIfNull)
// converts all undefined/null values to the passed value
Array.prototype.nz = function(valueIfNull) {
  var undef;
  for (var i = 0; i < this.length; i++)
    if (this[i] == null || this[i] == undef)
      this[i] = valueIfNull;
}

// Draw a histogram comparing an observed distribution with an expected one.
// The expected distribution follows a gaussian law
// with the given mean and standard deviation.
function histogram(obsFreqs, mean, std, title, max) {

  var subCount = VSSCore.GetSubCount();

  // convert nulls to zero
  obsFreqs.nz(0);

  // compute and store expected frequencies
  var expFreqs = [];
  var nonZeroFound = false;
  for (var i = 0; ; i++) {
    // expected frequency for a value between i-0.5 (excluded) and i+0.5 (included)
    var f = Math.round((ncdf((i+0.5 - mean)/std) - ncdf((i-0.5 - mean)/std)) * subCount);
    // if we already found a non-zero frequency, we are looking for the moment where
    // the expected frequency reaches 0 and we are after the last observed value.
    if (nonZeroFound) {
      if (f == 0 && i >= obsFreqs.length) break;
    }
    // if we did not, we are at the beginning of the distribution,
    // and we look for the first non-zero frequency
    else if (f > 0)
      nonZeroFound = true;
    expFreqs[i] = f;
  }

  // find the lowest value with a non-zero frequency (observed or expected)
  var iMin;
  for (iMin = 0; iMin < obsFreqs.length; iMin++)
    if (obsFreqs[iMin] || expFreqs[iMin]) break;

  // find the highest value with a non-zero frequency (observed or expected)
  var iMax = obsFreqs.length;
  if (expFreqs.length > iMax) iMax = expFreqs.length;

  // adjust max to the next 10 multiple, correct if too high
  var iMaxRegular = Math.ceil(max/10) * 10;
  if (iMaxRegular > iMax) iMaxRegular = iMax;

  // find the highest frequency
  var maxObs = obsFreqs.max();
  var maxExp = expFreqs.max();
  var maxFreq = maxObs > maxExp ? maxObs : maxExp;
  var maxLen = MAX_LOG_WIDTH - 13; // xx [bar] (xxx) xxx

  // display title & legend
  ScriptLog("    " + title);
  ScriptLog("    Legend:  " + padRight("", 3, OBS) + " Observed (number at end of bar)");
  ScriptLog("             " + padRight("", 3, EXP) + " Pro (number between parentheses)");

  // display histogram between min & regular max
  for (var i = iMin; i < iMaxRegular; i++) {
    var xText = i < 10 ? " " + i : "" + i;
    var expLen = Math.round(expFreqs[i] * maxLen / maxFreq);
    var obsLen = Math.round(obsFreqs[i] * maxLen / maxFreq);
    var bar, endText;
    if (expLen < obsLen) {
      endText = "(" + expFreqs[i] + ") " + obsFreqs[i];
      var obsLen = Math.round((obsFreqs[i] - expFreqs[i]) * maxLen / maxFreq);
      bar = padRight("", expLen, EXP) + padRight("", obsLen, OBS);
    }
    else {
      endText = "" + obsFreqs[i] + " (" + expFreqs[i] + ")";
      var expLen = Math.round((expFreqs[i] - obsFreqs[i]) * maxLen / maxFreq);
      bar = padRight("", obsLen, OBS) + padRight("", expLen, EXP);
    }
    ScriptLog( xText + " " + bar + " " + endText );
  }

  // display outliers
  for (var iLow = iMaxRegular; iLow < iMax; ) {
    var iHigh = iLow < 100 ? iLow + 10 : iMax + 1;
    var n = 0;
    for (i = iLow; i < iHigh; i++)
      if (obsFreqs[i])
        n += obsFreqs[i];
    if (n > 0) {
      len = Math.round(n * maxLen / maxFreq);
      ScriptLog( iLow + "-" + (iHigh-1) + " " + padRight("", len, OBS) + " (0) " + n );
    }
    iLow = iHigh;
  }

}
