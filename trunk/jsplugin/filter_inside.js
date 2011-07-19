// Filter inside plugin for VisualSubSync
// Nathbot <nathbot (at) gmail.com>
// Spirit <hiddenspirit (at) gmail.com>
//

LoadScript("common/common.js");

VSSPlugin = {
  // Plugin constants
  Name : "Filter inside",
  Description :
    "Detect subtitles that are too close " +
    'to a "Filter inside subtitle" zone.',
  Color : 0xff99b3,
  Message : "Filter inside",

  // Plugin parameters available from VSS GUI (name must start with "Param")
  ParamMaxRsLevel : { Value : 1, Unit : "(0/1/2/3/4)", Description :
    "Maximum RS after fixing an error.\n" +
    "0 = Disabled\n" +
    "1 = Fast, acceptable (default)\n" +
    "2 = A bit fast\n" +
    "3 = Good\n" +
    "4 = Perfect" },

  // Error codes
  OnStartError : 0,
  OnStopError : 1,

  // Messages
  Messages : [
    "on start: {value} ms",
    "on stop: {value} ms",
    "on stop (blink): {value} ms",
  ],

  // HasError method called for each subtitle during the error checking
  // If there is an error on CurrentSub
  // return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null.
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    var result = this.CheckError(CurrentSub);

    if (!result) {
        return '';
    }

    return Common.formatMessage(this.Messages[result.error], result);
  },

  FixError : function(CurrentSub, PreviousSub, NextSub) {
    var result = this.CheckError(CurrentSub);

    if (!result) {
        return;
    }

    var maxRS = Common.getRsFromHighLevel(this.ParamMaxRsLevel.Value);

    switch (result.error) {
        case this.OnStartError:
            var timing = result.sc + SceneChange.StopOffset;
            if (Common.getRsFromLengthDuration(CurrentSub.StrippedText.length,
                CurrentSub.Stop - timing) < maxRS) {
                CurrentSub.Start = timing;
            }
            break;
        case this.OnStopError:
            var timing = result.sc - SceneChange.StartOffset;
            if (Common.getRsFromLengthDuration(CurrentSub.StrippedText.length,
                timing - CurrentSub.Start) < maxRS) {
                CurrentSub.Stop = timing;
            } else {
                timing = Common.getNonOverlappedStop(
                    result.sc + SceneChange.FilterOffset + 1, NextSub);

                if (timing > CurrentSub.Stop) {
                    CurrentSub.Stop = timing;
                }
            }
            break;
    }
  },

  CheckError : function(CurrentSub) {
    var startSearch = CurrentSub.Start + SceneChange.StartOffset + 1;
    var stopSearch = CurrentSub.Stop - SceneChange.StopOffset - 1;

    if (!SceneChange.Contains(startSearch, stopSearch)) {
        return null;
    }

    // Check for scene change around start time
    // Get the scene change next to the start time
    var scTiming1 = SceneChange.GetNext(startSearch);
    var toFilterZoneStart = scTiming1 - CurrentSub.Start;

    if (toFilterZoneStart <= SceneChange.FilterOffset) {
        return {error: this.OnStartError, value: toFilterZoneStart,
            sc: scTiming1};
    }

    // Check for scene change around stop time
    // Get the scene change previous to the stop time
    var scTiming2 = SceneChange.GetPrevious(stopSearch);
    var toFilterZoneStop = CurrentSub.Stop - scTiming2;

    if (toFilterZoneStop <= SceneChange.FilterOffset) {
        return {error: this.OnStopError, value: toFilterZoneStop,
            sc: scTiming2};
    }

    return null;
  }

};
