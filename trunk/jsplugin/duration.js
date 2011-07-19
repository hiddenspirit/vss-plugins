// Duration plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
// Nathbot <nathbot (at) gmail.com>
//

LoadScript("common/common.js");

VSSPlugin = {
  // Plugin constants
  Name : "Duration",
  Description : "Detects too short or too long durations. " +
    "Fixes the durations without creating overlaps.",
  Color : 0x3787ff,
  Message : "Duration",

  // Plugin parameters available from VSS GUI (name must start with "Param")
  ParamStrictMinDuration : { Value : 1000, Unit : "ms", Description :
    "Strict minimum subtitle duration (default: 1000).\n" +
    "This is for error detection. Minimum subtitle duration from " +
    "the common settings is used for fixing." },
  ParamStrictMaxDuration : { Value : 6000, Unit : "ms", Description :
    "Strict maximum subtitle duration (default: 6000)." },
  ParamMaxStartMove : { Value : 0, Unit : "ms", Description :
    "Maximum subtitle start movement when fixing (default: 0)." },
  ParamDetectionLevel : { Value : 1, Unit : "(0/1/2/3)", Description :
    "Detection level.\n" +
    "0 = Only detect strict limits\n" +
    "1 = Detect acceptable limits when not next to a subtitle or a scene change (default)\n" +
    "2 = Detect acceptable limits when not next to a scene change\n" +
    "3 = Detect all acceptable limits" },

  // Messages
  TooShortMessage : "< {minSeconds} s",
  TooLongMessage : "> {maxSeconds} s",
  ShortAcceptableMessage : "< {minSeconds} s, ACCEPTABLE",
  LongAcceptableMessage : "> {maxSeconds} s, ACCEPTABLE",

  // HasError method called for each subtitle during the error checking
  // If there is an error on CurrentSub
  // return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null.
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    var duration = CurrentSub.Stop - CurrentSub.Start;

    if (duration < this.ParamStrictMinDuration.Value) {
        // Too short duration.
        return Common.formatMessage(this.TooShortMessage,
            {minSeconds: this.ParamStrictMinDuration.Value / 1000});
    } else if (duration > this.ParamStrictMaxDuration.Value) {
        // Too long duration.
        return Common.formatMessage(this.TooLongMessage,
            {maxSeconds: this.ParamStrictMaxDuration.Value / 1000});
    } else if (this.ParamDetectionLevel.Value) {
        if (duration < VSSCore.MinimumDuration) {
            // Short, acceptable duration.
            switch(this.ParamDetectionLevel.Value) {
                case 1:
                    var minDuration = Math.max(VSSCore.MinimumDuration,
                        this.ParamStrictMinDuration.Value);
                    var newStop = Common.getNonOverlappedStop(
                        CurrentSub.Start + minDuration,
                        NextSub, SceneChange.GetNext(CurrentSub.Stop));
                    if (newStop - 1 <= CurrentSub.Stop) {
                        return "";
                    }
                    break;
                case 2:
                    var minDuration = Math.max(VSSCore.MinimumDuration,
                        this.ParamStrictMinDuration.Value);
                    var newStop = Common.getNonOverlappedStop(
                        CurrentSub.Start + minDuration,
                        null, SceneChange.GetNext(CurrentSub.Stop));
                    if (newStop - 1 <= CurrentSub.Stop) {
                        return "";
                    }
                    break;
            }
            return Common.formatMessage(this.ShortAcceptableMessage,
                {minSeconds: VSSCore.MinimumDuration / 1000});
        } else if (duration > VSSCore.MaximumDuration) {
            // Long, acceptable duration.
            return Common.formatMessage(this.LongAcceptableMessage,
                {maxSeconds: VSSCore.MaximumDuration / 1000});
        }
    }

    return "";
  },

  FixError : function(CurrentSub, PreviousSub, NextSub) {
    var duration = CurrentSub.Stop - CurrentSub.Start;

    if (duration < VSSCore.MinimumDuration) {
        this.FixShortDuration(CurrentSub, PreviousSub, NextSub);
    } else if (duration > VSSCore.MaximumDuration) {
        CurrentSub.Stop = CurrentSub.Start + Math.min(
            VSSCore.MaximumDuration, this.ParamStrictMaxDuration.Value);
    }
  },

  FixShortDuration : function(CurrentSub, PreviousSub, NextSub) {
    var minDuration = Math.max(VSSCore.MinimumDuration,
        this.ParamStrictMinDuration.Value);

    var newStop = Common.getNonOverlappedStop(
        CurrentSub.Start + minDuration,
        NextSub, SceneChange.GetNext(CurrentSub.Stop));

    if (newStop > CurrentSub.Stop) {
        CurrentSub.Stop = newStop;
    }

    var maxStart = CurrentSub.Stop - minDuration;

    if (CurrentSub.Start <= maxStart || this.ParamMaxStartMove.Value == 0) {
        return;
    }

    var newStart = Common.getNonOverlappedStart(
        Math.max(maxStart, CurrentSub.Start - this.ParamMaxStartMove.Value),
        PreviousSub, SceneChange.GetPrevious(CurrentSub.Start));

    if (newStart < CurrentSub.Start) {
        CurrentSub.Start = newStart;
    }
  },
};
