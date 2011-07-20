// Scene change overlap plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>

LoadScript("./common/common.js");

VSSPlugin = {
  // Plugin constant
  Name : "Scene change overlap",
  Description : "Detects subtitles overlapping a scene change.",
  Color : 0xafa4ab,
  Message : "Scene change overlap",

  // Plugin parameters available from VSS GUI (name must start with "Param")
  ParamMaxRs : { Value : 35, Unit : "RS", Description : "Maximum RS" },
  ParamMinRs : { Value :  0, Unit : "RS", Description : "Minimum RS" },
  ParamDetectionMode : { Value : 1, Unit : "(1/2/3)", Description :
    "1 = Non Successive (default)\n" +
    "2 = Successive\n" +
    "3 = All" },

  // HasError method called for each subtitle during the error checking
  // If there is an error on CurrentSub
  // return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null.
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    endSceneTime = SceneChange.GetPrevious(CurrentSub.Stop) -
        SceneChange.StartOffset;

    if (endSceneTime <= CurrentSub.Start) {
        return "";
    }

    var nextBlank = NextSub ? NextSub.Start - CurrentSub.Stop : Infinity;
    var blankCondition;

    switch (this.ParamDetectionMode.Value) {
        case 1:
            blankCondition = nextBlank > VSSCore.MinimumBlank;
            break;
        case 2:
            blankCondition = nextBlank <= VSSCore.MinimumBlank;
            break;
        default:
            blankCondition = true;
    }

    var testRS = Common.getRsFromLengthDuration(CurrentSub.StrippedText.length,
        endSceneTime - CurrentSub.Start);

    if (testRS < this.ParamMaxRs.Value && testRS >= this.ParamMinRs.Value &&
        blankCondition)
    {
        return Common.decimal1Round(testRS).toString();
    }

    return "";
  },

  FixError : function(CurrentSub, PreviousSub, NextSub) {
    if (this.HasError(CurrentSub, PreviousSub, NextSub) == "") {
        return;
    }

    CurrentSub.Stop = endSceneTime;
  },
}
