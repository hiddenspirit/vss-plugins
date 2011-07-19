// Sticky blank plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
//

LoadScript("common/common.js");

VSSPlugin = {
  // Plugin constants
  Name : "Sticky blank",
  Description : "Sticky blank between subtitles and scene changes.",
  Color : 0xff22d2,
  Message : "Sticky blank",

  // Plugin parameters available from VSS GUI (name must start with "Param")
  ParamMode : { Value :  3, Unit : "(1/2/3)", Description :
    "Detection mode.\n" +
    "1 = Subtitle blank\n" +
    "2 = Scene change blank\n" +
    "3 = Subtitle and scene change blank (default)" },
  ParamStartRange : { Value : 50, Unit : "ms", Description :
    "Start range (default: 50)."},
  ParamStopRange : { Value : 100, Unit : "ms", Description :
    "Stop range (default: 100)."},
  ParamTolerance : { Value : 1, Unit : "ms", Description :
    "Tolerance (default: 1)" },

  // Messages
  StartMessage : "Start: {value} {unit}",
  StopMessage : "Stop: {value} {unit}",

  // HasError method called for each subtitle during the error checking
  // If there is an error on CurrentSub
  // return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null.
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    var resultList = new Array();

    if (this.ParamMode.Value != 1) {
        var resultScene =
            this.CheckBlankToScene(CurrentSub, PreviousSub, NextSub);

        if (resultScene) {
            resultList.push(resultScene);
        }
    }

    if (this.ParamMode.Value != 2) {
        var resultSub =
            this.CheckBlankToSubtitle(CurrentSub, PreviousSub, NextSub);

        if (resultSub) {
            resultList.push(resultSub);
        }
    }

    return resultList.join(", ");
  },

  FixError : function(CurrentSub, PreviousSub, NextSub) {
    if (this.ParamMode.Value != 1 &&
        this.CheckBlankToScene(CurrentSub, PreviousSub, NextSub))
    {
        this.FixBlankToScene(CurrentSub, PreviousSub, NextSub);
    }

    if (this.ParamMode.Value != 2 &&
        this.CheckBlankToSubtitle(CurrentSub, PreviousSub, NextSub))
    {
        this.FixBlankToSubtitle(CurrentSub, PreviousSub, NextSub);
    }
  },

  CheckBlankToScene : function(CurrentSub, PreviousSub, NextSub) {
    this.BlankToPreviousScene = 0;
    this.BlankToNextScene = 0;

    var previousScene = SceneChange.GetPrevious(CurrentSub.Start);

    if (previousScene >= 0) {
        var previousSceneStop = previousScene + SceneChange.StopOffset;

        if (!PreviousSub ||
            previousSceneStop >= PreviousSub.Stop + VSSCore.MinimumBlank)
        {
            this.BlankToPreviousScene = CurrentSub.Start - previousSceneStop;
        }
    }

    var nextScene = SceneChange.GetNext(CurrentSub.Stop);

    if (nextScene >= 0) {
        var nextSceneStart = nextScene - SceneChange.StartOffset;

        if (!NextSub || nextSceneStart < NextSub.Start - VSSCore.MinimumBlank) {
            this.BlankToNextScene = nextSceneStart - CurrentSub.Stop;
        }
    }

    var resultList = new Array();

    if (this.BlankToPreviousScene > 0 &&
        this.BlankToPreviousScene < this.ParamStartRange.Value &&
        this.BlankToPreviousScene > this.ParamTolerance.Value)
    {
        resultList.push(Common.formatMessage(this.StartMessage,
            {value: this.BlankToPreviousScene,
            range: this.ParamStartRange.Value,
            unit: this.ParamStartRange.Unit}));
    }

    if (this.BlankToNextScene > 0 &&
        this.BlankToNextScene < this.ParamStopRange.Value &&
        this.BlankToNextScene > this.ParamTolerance.Value)
    {
        resultList.push(Common.formatMessage(this.StopMessage,
            {value: this.BlankToNextScene,
            range: this.ParamStopRange.Value,
            unit: this.ParamStopRange.Unit}));
    }

    return resultList.join(", ");
  },

  FixBlankToScene : function(CurrentSub, PreviousSub, NextSub) {
    if (this.BlankToPreviousScene > 0 &&
        this.BlankToPreviousScene < this.ParamStartRange.Value)
    {
        CurrentSub.Start -= this.BlankToPreviousScene;
    }

    if (this.BlankToNextScene > 0 &&
        this.BlankToNextScene < this.ParamStopRange.Value)
    {
        CurrentSub.Stop += this.BlankToNextScene;
    }
  },

  CheckBlankToSubtitle : function(CurrentSub, PreviousSub, NextSub) {
    if (null === NextSub) {
        return "";
    }

    var beforeNextSub = NextSub.Start - VSSCore.MinimumBlank;
    var nextScene = SceneChange.GetNext(CurrentSub.Stop);

    if (nextScene >= 0) {
        var nextSceneStart = nextScene - SceneChange.StartOffset;
        var nextSceneStop = nextScene + SceneChange.StopOffset;

        if (beforeNextSub > nextSceneStart && beforeNextSub < nextSceneStop) {
            return "";
        }
    }

    if (CurrentSub.Stop < beforeNextSub &&
        CurrentSub.Stop > beforeNextSub - this.ParamStopRange.Value)
    {
        var interval = beforeNextSub - CurrentSub.Stop;

        if (interval > this.ParamTolerance.Value) {
            return Common.formatMessage(this.StopMessage,
                {value: interval,
                range: this.ParamStopRange.Value,
                unit: this.ParamStopRange.Unit});
        }
    }

    return "";
  },

  FixBlankToSubtitle : function(CurrentSub, PreviousSub, NextSub) {
    CurrentSub.Stop = NextSub.Start - VSSCore.MinimumBlank;
  }
};
