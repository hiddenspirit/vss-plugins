// Action Frame Adjustment plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
//

LoadScript("../common/common.js");


// ---------------------------------------------------------------------------

JSAction_FrameAdjustment = {
  getFrameTiming : function(timing) {
    timing = Math.round(timing);

    // var nextSC = SceneChange.GetNext(timing);
    // if (nextSC >= 0) {
        // var ref = JSAction_FrameAdjustment.nextSCorSCStart(nextSC, timing);
    // } else {
        // var prevSC = SceneChange.GetPrevious(timing);
        // if (prevSC >= 0) {
            // var ref = JSAction_FrameAdjustment.prevSCorSCStop(prevSC, timing);
        // } else {
            // var frame = Math.round(
                // timing / JSAction_FrameAdjustment.frameDuration);
            // return Math.round(frame * JSAction_FrameAdjustment.frameDuration);
        // }
    // }

    var prevSC = SceneChange.GetPrevious(timing);
    var nextSC = SceneChange.GetNext(timing);
    if (prevSC >= 0) {
        if (nextSC >= 0) {
            if (timing - prevSC < nextSC - timing) {
                var ref = JSAction_FrameAdjustment.prevSCorSCStop(
                    prevSC, timing);
            } else {
                var ref = JSAction_FrameAdjustment.nextSCorSCStart(
                    nextSC, timing);
            }
        } else {
            var ref = JSAction_FrameAdjustment.prevSCorSCStop(prevSC, timing);
        }
    } else if (nextSC >= 0) {
        var ref = JSAction_FrameAdjustment.nextSCorSCStart(nextSC, timing);
    } else {
        var frame = Math.round(timing / JSAction_FrameAdjustment.frameDuration);
        var frameTiming = Math.round(
            frame * JSAction_FrameAdjustment.frameDuration);
        return frameTiming;
    }

    var diff = timing - ref;
    var numFrames = Math.round(diff / JSAction_FrameAdjustment.frameDuration);
    var frameTiming = ref + Math.round(
        numFrames * JSAction_FrameAdjustment.frameDuration);
    return frameTiming;
  },

  getPreviousFrameTiming : function(timing) {
    return JSAction_FrameAdjustment.getFrameTiming(
        timing - JSAction_FrameAdjustment.frameDuration);
  },

  getNextFrameTiming : function(timing) {
    return JSAction_FrameAdjustment.getFrameTiming(
        timing + JSAction_FrameAdjustment.frameDuration);
  },

  prevSCorSCStop : function(prevSC, timing) {
    var prevSCStop = prevSC + SceneChange.StopOffset;
    return prevSCStop > timing ? prevSC : prevSCStop;
  },

  nextSCorSCStart : function(nextSC, timing) {
    var nextSCStart = nextSC - SceneChange.StartOffset;
    return nextSCStart < timing ? nextSC : nextSCStart;
  },

  getNextSubCorrectedTiming : function(timing, nextSub) {
    if (nextSub) {
        var nextStart = JSAction_FrameAdjustment.getFrameTiming(nextSub.Start);
        var blankStart = nextStart - VSSCore.MinimumBlank;
        if (Math.abs(blankStart - timing) <
            JSAction_FrameAdjustment.frameLimit
        ) {
            timing = blankStart;
        } else if (Math.abs(nextStart - timing) <
            JSAction_FrameAdjustment.frameLimit
        ) {
            timing = nextStart - 1;
        }
    }

    return timing;
  },

  initFrameDuration : function() {
    JSAction_FrameAdjustment.frameDuration =
        Common.getFrameDuration() || 1001 / 24;
    JSAction_FrameAdjustment.frameLimit =
        JSAction_FrameAdjustment.frameDuration / 2;
  }
};


JSAction_StartMinusOneFrame = {
  onExecute : function() {
    JSAction_FrameAdjustment.initFrameDuration();
    for (var sub = VSSCore.GetFirstSelected(); sub;
        sub = VSSCore.GetNextSelected(sub)
    ) {
        sub.start = JSAction_FrameAdjustment.getPreviousFrameTiming(sub.start);
    }
  }
};


JSAction_StartPlusOneFrame = {
  onExecute : function() {
    JSAction_FrameAdjustment.initFrameDuration();
    for (var sub = VSSCore.GetFirstSelected(); sub;
        sub = VSSCore.GetNextSelected(sub)
    ) {
        sub.start = JSAction_FrameAdjustment.getNextFrameTiming(sub.start);
    }
  }
};


JSAction_StopMinusOneFrame = {
  onExecute : function() {
    JSAction_FrameAdjustment.initFrameDuration();
    for (var sub = VSSCore.GetFirstSelected(); sub;
        sub = VSSCore.GetNextSelected(sub)
    ) {
        sub.stop = JSAction_FrameAdjustment.getPreviousFrameTiming(sub.stop);
    }
  }
};


JSAction_StopPlusOneFrame = {
  onExecute : function() {
    JSAction_FrameAdjustment.initFrameDuration();
    for (var sub = VSSCore.GetFirstSelected(); sub;
        sub = VSSCore.GetNextSelected(sub)
    ) {
        sub.stop = JSAction_FrameAdjustment.getNextFrameTiming(sub.stop);
    }
  }
};


JSAction_NormalizeTimings = {
  onExecute : function() {
    JSAction_FrameAdjustment.initFrameDuration();

    for (var sub = VSSCore.GetFirst(); sub; sub = nextSub) {
        var nextSub = VSSCore.GetNext(sub);
        var start = JSAction_FrameAdjustment.getFrameTiming(sub.Start);
        var stop = JSAction_FrameAdjustment.getNextSubCorrectedTiming(
            JSAction_FrameAdjustment.getFrameTiming(sub.Stop), nextSub);

        if (start != sub.Start) {
            sub.Start = start;
        }

        if (stop != sub.Stop) {
            sub.Stop = stop;
        }
    }
  }
};


VSSCore.RegisterJavascriptAction(
    "JSAction_NormalizeTimings",
    "Normalize all timings",
    "Shift+Ctrl+N");

VSSCore.RegisterJavascriptAction(
    "JSAction_StartMinusOneFrame",
    "Shift start time by -1 frame",
    "Ctrl+J");

VSSCore.RegisterJavascriptAction(
    "JSAction_StartPlusOneFrame",
    "Shift start time by +1 frame",
    "Ctrl+K");

VSSCore.RegisterJavascriptAction(
    "JSAction_StopMinusOneFrame",
    "Shift stop time by -1 frame",
    "Shift+Ctrl+J");

VSSCore.RegisterJavascriptAction(
    "JSAction_StopPlusOneFrame",
    "Shift stop time by +1 frame",
    "Shift+Ctrl+K");

// ---------------------------------------------------------------------------
