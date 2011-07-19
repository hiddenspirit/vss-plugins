// Framerate accuracy plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
//

VSSPlugin = {
  // Plugin constants
  Name : "Framerate accuracy",
  Description : "Adjusts timings to be framerate accurate.",
  Color : 0x223ba0,
  Message : "Framerate accuracy",

  // Plugin parameters available from VSS GUI (name must start with "Param")
  ParamFrameratePreset : { Value : 1, Unit : "(1/2/3/4)", Description :
    "Framerate.\n" +
    "1 = 23.976\n" +
    "2 = 24\n" +
    "3 = 25\n" +
    "4 = 29.97"
    },
  ParamTolerance : { Value : 1, Unit : "ms", Description :
    "Tolerance (default: 1)" },

  Delays : [
    undefined,
    41.70833,
    41.66667,
    40,
    33.36667
  ],

  // HasError method called for each subtitle during the error checking
  // If there is an error on CurrentSub
  // return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null.
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    var timings = this.GetTimings(CurrentSub);

    if (Math.abs(CurrentSub.Start - timings.start) >
        this.ParamTolerance.Value ||
        Math.abs(CurrentSub.Stop - timings.stop) >
        this.ParamTolerance.Value)
    {
        return this.FormatTiming(timings.start) + " -> " +
            this.FormatTiming(timings.stop);
    }

    return "";
  },

  FixError : function(CurrentSub, PreviousSub, NextSub) {
    var timings = this.GetTimings(CurrentSub);

    if (CurrentSub.Start != timings.start ) {
        CurrentSub.Start = timings.start ;
    }

    if (CurrentSub.Stop != timings.stop) {
        CurrentSub.Stop = timings.stop;
    }
  },

  GetTimings : function(CurrentSub) {
    var delay = this.Delays[this.ParamFrameratePreset.Value];

    var startFrame = Math.round(CurrentSub.Start / delay);
    var stopFrame = Math.round(CurrentSub.Stop / delay);
    var start = parseInt(startFrame * delay);
    var stop = parseInt(stopFrame * delay);

    return {start: start, stop: stop};
  },

  Time2hmsms : function(time) {
    h = parseInt(time / 3600000);
    ms = time % 1000;
    time %= 3600000;
    m = parseInt(time / 60000);
    time %= 60000;
    s = parseInt(time / 1000);

    return [h, m, s, ms];
  },

  FormatTiming : function(timing) {
    var timingArray = this.Time2hmsms(timing);
    var sizes = [2, 2, 2, 3];

    for (var i = 0; i < 4; ++i) {
        timingArray[i] = timingArray[i].toString();
        while (timingArray[i].length < sizes[i]) {
            timingArray[i] = "0" + timingArray[i];
        }
    }

    return timingArray.join(":");
  }
}
