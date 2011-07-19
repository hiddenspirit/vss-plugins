// Action Extend plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
//

LoadScript("../common/common.js");

// ---------------------------------------------------------------------------

JSAction_Perfect = {
  onExecute : function() {
    for (sub = VSSCore.GetFirstSelected(); sub;
        sub = VSSCore.GetNextSelected(sub))
    {
        var len = sub.StrippedText.length;
        var targetDuration = Common.getIdealDuration(len);
        var nextSub = VSSCore.GetNext(sub);
        var stop = Common.getNonOverlappedStop(sub.Start + targetDuration,
            nextSub, SceneChange.GetNext(sub.Stop));

        if (stop > sub.Stop) {
            sub.Stop = stop;
        }
    }
  }
};

VSSCore.RegisterJavascriptAction("JSAction_Perfect", "Extend to Perfect",
    "Ctrl+P");

// ---------------------------------------------------------------------------

JSAction_Good = {
  rsTarget : 26.95,

  onExecute : function() {
    for (sub = VSSCore.GetFirstSelected(); sub;
        sub = VSSCore.GetNextSelected(sub))
    {
        var len = sub.StrippedText.length;
        var targetDuration = Math.ceil(Common.getDurationFromLengthRs(len,
            this.rsTarget));
        var nextSub = VSSCore.GetNext(sub);
        var stop = Common.getNonOverlappedStop(sub.Start + targetDuration,
            nextSub, SceneChange.GetNext(sub.Stop));

        if (stop > sub.Stop) {
            sub.Stop = stop;
        }
    }
  }
};

VSSCore.RegisterJavascriptAction("JSAction_Good", "Extend to Good", "Shift+Ctrl+P");

// ---------------------------------------------------------------------------

JSAction_aBitFast = {
  rsTarget : 30.95,

  onExecute : function() {
    for (sub = VSSCore.GetFirstSelected(); sub;
        sub = VSSCore.GetNextSelected(sub))
    {
        var len = sub.StrippedText.length;
        var targetDuration = Math.ceil(Common.getDurationFromLengthRs(len,
            this.rsTarget));
        var nextSub = VSSCore.GetNext(sub);
        var stop = Common.getNonOverlappedStop(sub.Start + targetDuration,
            nextSub, SceneChange.GetNext(sub.Stop));

        if (stop > sub.Stop) {
            sub.Stop = stop;
        }
    }
  }
};

VSSCore.RegisterJavascriptAction("JSAction_aBitFast", "Extend to A bit fast", "Shift+Ctrl+Alt+P");

// ---------------------------------------------------------------------------

// JSAction_FastAcceptable = {
  // rsTarget : 34.95,

  // onExecute : function() {
    // for (sub = VSSCore.GetFirstSelected(); sub;
        // sub = VSSCore.GetNextSelected(sub))
    // {
        // var len = sub.StrippedText.length;
        // var targetDuration = Math.ceil(Common.getDurationFromLengthRs(len,
            // this.rsTarget));
        // var nextSub = VSSCore.GetNext(sub);
        // var stop = Common.getNonOverlappedStop(sub.Start + targetDuration,
            // nextSub, SceneChange.GetNext(sub.Stop));

        // if (stop > sub.Stop) {
            // sub.Stop = stop;
        // }
    // }
  // }
// };

// VSSCore.RegisterJavascriptAction("JSAction_FastAcceptable", "Extend to Fast, acceptable", "Ctrl+^");

// // ---------------------------------------------------------------------------

// JSAction_Cps25 = {
  // cpsTarget : 25,

  // onExecute : function() {
    // for (sub = VSSCore.GetFirstSelected(); sub;
        // sub = VSSCore.GetNextSelected(sub))
    // {
        // var len = sub.StrippedText.length;
        // var targetDuration = Math.ceil(Common.getDurationFromLengthCps(len,
            // this.cpsTarget));
        // var nextSub = VSSCore.GetNext(sub);
        // var stop = Common.getNonOverlappedStop(sub.Start + targetDuration,
            // nextSub, SceneChange.GetNext(sub.Stop));

        // if (stop > sub.Stop) {
            // sub.Stop = stop;
        // }
    // }
  // }
// };

// VSSCore.RegisterJavascriptAction("JSAction_Cps25", "Extend to CPS 25", "Ctrl+^");

// // ---------------------------------------------------------------------------

// JSAction_TooFast = {
  // rsTarget : 35,

  // onExecute : function() {
    // for (sub = VSSCore.GetFirstSelected(); sub;
        // sub = VSSCore.GetNextSelected(sub))
    // {
        // var len = sub.StrippedText.length;
        // var targetDuration = Math.floor(Common.getDurationFromLengthRs(len,
            // this.rsTarget));
        // var nextSub = VSSCore.GetNext(sub);
        // var stop = Common.getNonOverlappedStop(sub.Start + targetDuration,
            // nextSub, SceneChange.GetNext(sub.Stop));

        // if (stop < sub.Stop) {
            // sub.Stop = stop;
        // }
    // }
  // }
// };

// VSSCore.RegisterJavascriptAction("JSAction_TooFast", "Shorten to TOO FAST",
    // "Ctrl+^");

// // ---------------------------------------------------------------------------
