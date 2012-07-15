// Speed plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
// Nathbot <nathbot (at) gmail.com>
//

LoadScript("common/common.js");

VSSPlugin = {
  // Plugin constants
  Name : "Speed",
  Description : "Detects when the reading speed (RS) " +
    "and/or the characters per second (CPS) is inferior or superior " +
    "to the specified values. Fixes slow subtitles by targeting " +
    "the minimum speed, and fast subtitles by targeting the ideal speed.",
  Color : 0xffc437,
  Message : "Speed",

  // Plugin parameters available from VSS GUI (name must start with "Param")
  ParamMode : { Value : 1, Unit : "(1/2/3)", Description :
    "Speed mode.\n" +
    "1 = RS mode (default)\n" +
    "2 = CPS mode\n" +
    "3 = RS and CPS mode" },
  ParamMinRsLevel : { Value : 1, Unit : "(0/1/2/3/4)", Description :
    "Minimum RS detection level.\n" +
    "0 = Disabled\n" +
    "1 = TOO SLOW (default)\n" +
    "2 = Slow, acceptable\n" +
    "3 = A bit slow\n" +
    "4 = Good" },
  ParamMaxRsLevel : { Value : 1, Unit : "(0/1/2/3/4)", Description :
    "Maximum RS detection level.\n" +
    "0 = Disabled\n" +
    "1 = TOO FAST (default)\n" +
    "2 = Fast, acceptable\n" +
    "3 = A bit fast\n" +
    "4 = Good" },
  ParamMinCps : { Value : 4, Unit : "char/s", Description :
    "Minimum CPS (default: 4)." },
  ParamMaxCps : { Value : 25, Unit : "char/s", Description :
    "Maximum CPS (default: 25)." },
  ParamOptimize : { Value : 0, Unit : "(0/1/2/3)", Description :
    "Optimizable subtitles detection mode.\n" +
    "0 = Off (default)\n" +
    "1 = Detect increasable subtitles\n" +
    "2 = Detect decreasable subtitles\n" +
    "3 = Detect increasable and decreasable subtitles" },
  ParamMaxStartMove : { Value : 0, Unit : "ms", Description :
    "Maximum start movement when fixing fast subtitles (default: 0)." },
  ParamBreakSceneChanges : { Value : 0, Unit : "(0/1)", Description :
    "Break scene changes if it can fix subtitles " +
    "above the strict maximum speed.\n" +
    "0 = Off (default)\n" +
    "1 = On" },
  ParamIgnoreLinesOf : { Value : 0, Unit : "Characters", Description :
    "Ignore lines which have this many characters (default: 0)." },

  // Messages
  TooHighCpsMessage : "> {maxCps} {unit}",
  TooLowCpsMessage : "< {minCps} {unit}",
  OptimizableMessage : "optimizable: {valueSeconds} s",

  // HasError method called for each subtitle during the error checking
  // If there is an error on CurrentSub
  // return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null.
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    var len = CurrentSub.StrippedText.length;

    if (len <= this.ParamIgnoreLinesOf.Value) {
        return "";
    }

    var targetDuration = 0;
	var start = Common.getStartIfOverlapping(CurrentSub);
    var duration = CurrentSub.Stop - start;

    // RS
    if (this.ParamMode.Value != 2) {
        var rs = Common.getRsFromLengthDuration(len, duration);

        if (rs >= Common.getRsFromHighLevel(this.ParamMaxRsLevel.Value) ||
            rs < Common.getRsFromLowLevel(this.ParamMinRsLevel.Value))
        {
            return Common.getReadingSpeedRating(rs);
        } else if (this.ParamOptimize.Value) {
            targetDuration = Common.getTargetDuration(len);
        }
    }

    // CPS
    if (this.ParamMode.Value != 1) {
        var cps = Common.getCpsFromLengthDuration(len, duration);

        if (cps > this.ParamMaxCps.Value) {
            return Common.formatMessage(this.TooHighCpsMessage,
                {maxCps: this.ParamMaxCps.Value, unit: this.ParamMaxCps.Unit});
        } else if (cps < this.ParamMinCps.Value) {
            return Common.formatMessage(this.TooLowCpsMessage,
                {minCps: this.ParamMinCps.Value, unit: this.ParamMinCps.Unit});
        } else if (this.ParamOptimize.Value) {
            var targetDurationCps = Math.round(
                Common.getDurationFromLengthCps(len, VSSCore.CpsTarget));

            if (targetDurationCps > targetDuration) {
                targetDuration = targetDurationCps;
            }
        }
    }

    // Check for optimizable subtitles.
    if (targetDuration) {
        var newStop = this.GetOptimalStop(targetDuration, CurrentSub, NextSub, start);
        var diff = newStop - CurrentSub.Stop;

        if (diff > 0 && this.ParamOptimize.Value != 2) {
            return Common.formatMessage(this.OptimizableMessage,
                {valueSeconds: "+" + diff / 1000});
        } else if (diff < 0 && this.ParamOptimize.Value != 1 &&
            newStop - start == targetDuration)
        {
            return Common.formatMessage(this.OptimizableMessage,
                {valueSeconds: diff / 1000});
        }
    }

    return "";
  },

  FixError : function(CurrentSub, PreviousSub, NextSub) {
    var len = CurrentSub.StrippedText.length;
    var maxDuration = Infinity;
    var minDuration = 0;
    var targetDuration = 0;
    var start = Common.getStartIfOverlapping(CurrentSub);
    var duration = CurrentSub.Stop - start;

    // RS
    if (this.ParamMode.Value != 2) {
        var rs = Common.getRsFromLengthDuration(len, duration);
        var minRs = Common.getRsFromLowLevel(this.ParamMinRsLevel.Value);

        if (rs < minRs) {
            maxDuration = Math.floor(
                Common.getDurationFromLengthRs(len, minRs));
        } else {
            targetDuration = Common.getTargetDuration(len);
            var maxRs = Common.getRsFromHighLevel(this.ParamMaxRsLevel.Value);

            if (rs >= maxRs) {
                minDuration = Math.ceil(
                    Common.getDurationFromLengthRs(len, maxRs - .05));
            }
        }
    }

    // CPS
    if (this.ParamMode.Value != 1) {
        var cps = Common.getCpsFromLengthDuration(len, duration);

        if (cps < this.ParamMinCps.Value) {
            var maxDurationCps = Math.floor(
                Common.getDurationFromLengthCps(len, this.ParamMinCps.Value));

            if (maxDurationCps < maxDuration) {
                maxDuration = maxDurationCps;
            }
        } else {
            var targetDurationCps = Math.round(
                Common.getDurationFromLengthCps(len, VSSCore.CpsTarget));

            if (targetDurationCps > targetDuration) {
                targetDuration = targetDurationCps;
            }

            if (cps > this.ParamMaxCps.Value) {
                var minDurationCps = Math.ceil(
                    Common.getDurationFromLengthCps(
                    len, this.ParamMaxCps.Value));

                if (minDurationCps > minDuration) {
                    minDuration = minDurationCps;
                }
            }
        }
    }

    // Too low speed.
    if (isFinite(maxDuration)) {
        CurrentSub.Stop = start + maxDuration;
        return;
    }

    var newStop = this.GetOptimalStop(targetDuration, CurrentSub, NextSub, start);

    if (newStop > CurrentSub.Stop || this.ParamOptimize.Value > 1) {
        CurrentSub.Stop = newStop;
    }

    // If needed, try to move the start timing.
    if (this.ParamMaxStartMove.Value) {
        // Maximum allowed start timing to be below the maximum speed.
        var maxStart = CurrentSub.Stop - minDuration;

        // Exit if the speed is below the maximum.
        if (CurrentSub.Start <= maxStart) {
            return;
        }

        var newStart = Common.getNonOverlappedStart(
            Math.max(maxStart, CurrentSub.Start - this.ParamMaxStartMove.Value),
            PreviousSub, SceneChange.GetPrevious(CurrentSub.Start));

        if (newStart < CurrentSub.Start) {
            CurrentSub.Start = newStart;
        }
    }

    // If needed, try to break scene changes.
    if (this.ParamBreakSceneChanges.Value) {
        // Minimum allowed stop timing to be below the maximum speed.
        //var minStop = CurrentSub.Start + minDuration;

        // Check against the strict minimum stop timing.
        this.CheckMode();
        var strictMinDuration = StrictMinDuration[this.ParamMode.Value](len);
        var strictMinStop = CurrentSub.Start + strictMinDuration;

        // Exit if the speed is below the strict maximum.
        if (CurrentSub.Stop >= strictMinStop) {
            return;
        }

        // The speed is still above the strict maximum,
        // so we try to break the scene changes.
        //ScriptLog("Try to break the scene changes.");

        newStop = Common.getNonOverlappedStop(CurrentSub.Start +
            Math.min(targetDuration, VSSCore.MaximumDuration), NextSub);

        // Apply the new stop timing only if it fixes the speed.
        if (newStop >= strictMinStop) {
            CurrentSub.Stop = newStop;
        }
    }
  },

  GetOptimalStop : function(targetDuration, CurrentSub, NextSub, start) {
	if (undefined === start) {
		start = CurrentSub.Start;
	}
    return Common.getNonOverlappedStop(start +
        Math.min(targetDuration, VSSCore.MaximumDuration),
        NextSub, SceneChange.GetNext(CurrentSub.Stop));
  },

  CheckMode : function() {
    // We can't afford an error when indexing the function arrays.
    if (!(this.ParamMode.Value >= 1 && this.ParamMode.Value <= 3)) {
        this.ParamMode.Value = 1;
    }
  },
};

var StrictMinDuration = new Array(
    undefined,

    // RS mode.
    function(len) {
        return Math.ceil(
            Common.getDurationFromLengthRs(len, Common.STRICT_MAX_RS - .05));
    },

    // CPS mode.
    function(len) {
        return Math.ceil(Common.getDurationFromLengthCps(len,
            Math.max(VSSPlugin.ParamMaxCps.Value, Common.STRICT_MAX_CPS)));
    },

    // RS and CPS mode.
    function(len) {
        return Math.max(this[1](len), this[2](len));
    }
);
