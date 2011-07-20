// Action Duration plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
//

LoadScript("../common/common.js");

// ---------------------------------------------------------------------------

JSAction_Duration = {
  onExecute : function() {
    for (sub = VSSCore.GetFirstSelected(); sub;
        sub = VSSCore.GetNextSelected(sub))
    {
        var duration = Common.checkMinMaxDuration(sub.Stop - sub.Start);
        var nextSub = VSSCore.GetNext(sub);
        var stop = Common.getNonOverlappedStop(sub.Start + duration,
            nextSub, SceneChange.GetNext(sub.Stop));

        if (stop != sub.Stop) {
            sub.Stop = stop;
        }
    }
  }
};

VSSCore.RegisterJavascriptAction("JSAction_Duration", "Fix duration",
    "Ctrl+Alt+D");

// ---------------------------------------------------------------------------
