// Blank plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
//

LoadScript("common/common.js");

VSSPlugin = {
  // Plugin constants
  Name : "Blank",
  Description : "Blank between two subtitles, " +
    "or between a subtitle and a scene change " +
    "when scene changes are visible in the audio display.",
  Color : 0xff3737,
  Message : "Blank",

  // Plugin parameters available from VSS GUI (name must start with "Param")
  ParamFixableOverlap : { Value : 100, Unit : "ms", Description :
    "The overlap must be inferior to this to be fixed automatically " +
    "(default: 100)." },

  // Error codes
  BlankError : 0,
  SceneChangeOnStartError : 1,
  SceneChangeOnStopError : 2,

  // Messages
  Messages : [
    "Next subtitle",
    "Scene change on start",
    "Scene change on stop",
    "Filter zone"
  ],

  // HasError method called for each subtitle during the error checking
  // If there is an error on CurrentSub
  // return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null.
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    var result = this.CheckError(CurrentSub, PreviousSub, NextSub);

    if (null !== result) {
        if (result.error == 1 && result.value < -SceneChange.StartOffset ||
            result.error == 2 && result.value < -SceneChange.StopOffset)
        {
            return this.Messages[3];
        }
        return this.Messages[result.error];
    }

    return "";
  },

  FixError : function(CurrentSub, PreviousSub, NextSub) {
    var result = this.CheckError(CurrentSub, PreviousSub, NextSub);

    if (null !== result) {
        this.FixFuncs[result.error](CurrentSub, result.value);
    }
  },

  CheckError : function(CurrentSub, PreviousSub, NextSub) {
    if (SceneChange.Visible) {
        // Scene change previous to start.
        var previousSceneChange = SceneChange.GetPrevious(CurrentSub.Start);

        if (previousSceneChange >= 0 &&
            CurrentSub.Start - previousSceneChange < SceneChange.StopOffset)
        {
            return {error: this.SceneChangeOnStartError,
                value: CurrentSub.Start - previousSceneChange};
        }

        // Scene change next to start.
        var nextSceneChange = SceneChange.GetNext(CurrentSub.Start + 1);

        if (nextSceneChange >= 0 &&
            nextSceneChange - CurrentSub.Start <= SceneChange.FilterOffset)
        {
            return {error: this.SceneChangeOnStartError,
                value: CurrentSub.Start - nextSceneChange};
        }

        // Scene change previous to stop.
        var previousSceneChange = SceneChange.GetPrevious(CurrentSub.Stop - 1);

        if (previousSceneChange >= 0 &&
            CurrentSub.Stop - previousSceneChange <= SceneChange.FilterOffset)
        {
            return {error: this.SceneChangeOnStopError,
                value: previousSceneChange - CurrentSub.Stop};
        }

        // Scene change next to stop.
        var nextSceneChange = SceneChange.GetNext(CurrentSub.Stop);
    } else {
        var nextSceneChange = -1;
    }

    var nextSubStart = NextSub ? NextSub.Start : null;

    if (nextSceneChange < 0) {
        if (nextSubStart) {
            var blank = nextSubStart - CurrentSub.Stop;

            // Minimum blank or overlapping (when blank is negative).
            if (blank < VSSCore.MinimumBlank) {
                return {error: this.BlankError, value: blank};
            }
        }
    } else {
        if (nextSubStart && nextSubStart < nextSceneChange) {
            var blank = nextSubStart - CurrentSub.Stop;

            // Minimum blank or overlapping (when blank is negative).
            if (blank < VSSCore.MinimumBlank) {
                return {error: this.BlankError, value: blank};
            }
        } else {
            var blankToSceneChange = nextSceneChange - CurrentSub.Stop;

            // Blank to next scene change.
            if (blankToSceneChange < SceneChange.StartOffset) {
                return {error: this.SceneChangeOnStopError,
                    value: blankToSceneChange};
            }
        }
    }

    return null;
  },

  FixFuncs : [
    // BlankError
    function(CurrentSub, value) {
        if (value >= -VSSPlugin.ParamFixableOverlap.Value) {
            CurrentSub.Stop += value - VSSCore.MinimumBlank;
        }
    },

    // SceneChangeOnStartError
    function(CurrentSub, value) {
        CurrentSub.Start += SceneChange.StopOffset - value;
    },

    // SceneChangeOnStartError
    function(CurrentSub, value) {
        CurrentSub.Stop += value - SceneChange.StartOffset
    }
  ]
};
