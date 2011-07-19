/*
  Display an histogram of reading speeds.

  14 Nov 2008   thyresias at gmail dot com
*/

JSAction_ReadingSpeedStats = {
  onExecute: function() {

    if (VSSCore.GetSubCount() == 0) return;

    logTitle("Reading Speed Statistics");
    LoadScript("statistics.js");

    // collect frequency for each rounded reading speed
    var mean = 0;
    var std = 0;
    var freqs = [];
    for (var sub = VSSCore.GetFirst(); sub; sub = VSSCore.GetNext(sub)) {
      var rs = readingSpeed(sub).exact_per_ms * 1000;
      var i = Math.round(rs);
      if (freqs[i]) freqs[i]++;
      else          freqs[i] = 1;
    }

    // display them
    histogram(freqs, RS_MEAN, RS_STD, "Distribution of Reading Speed (pro: between 5 and 35)", RS_MAX);

  }
};

VSSCore.RegisterJavascriptAction('JSAction_ReadingSpeedStats', 'Reading speed stats', 'Ctrl+R');
