// Action Frame Adjustment plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
//

LoadScript("../common/common.js");


// ---------------------------------------------------------------------------

JSAction_FrameAdjustment = {
  getFrameTiming : function(timing) {
    var frame = Math.round(timing / this.frameDuration);
    var frameTiming = Math.round(frame * this.frameDuration);

    return this.getSCCorrectedTiming(frameTiming);
  },

  getPreviousFrameTiming : function(timing) {
    var frame = Math.round(timing / this.frameDuration);

    if (frame <= 0) {
        ++frame;
    }

    var frameTiming = Math.round((frame - 1) * this.frameDuration);

    return this.getSCCorrectedTiming(frameTiming);
  },

  getNextFrameTiming : function(timing) {
    var frame = Math.round(timing / this.frameDuration);
    var frameTiming = Math.round((frame + 1) * this.frameDuration);

    return this.getSCCorrectedTiming(frameTiming);
  },

  getSCCorrectedTiming : function(timing) {
    var frameDuration = this.frameDuration / 2;
    var scPrev = SceneChange.GetPrevious(timing);

    if (scPrev >= 0) {
        var scStop = scPrev + SceneChange.StopOffset;
        if (Math.abs(scStop - timing) <= frameDuration) {
            return scStop;
        } else if (Math.abs(scPrev - timing) <= frameDuration) {
            return scPrev;
        }
    }

    var scNext = SceneChange.GetNext(timing);

    if (scNext >= 0) {
        var scStart = scNext - SceneChange.StartOffset;
        if (Math.abs(scStart - timing) <= frameDuration) {
            return scStart;
        } else if (Math.abs(scNext - timing) <= frameDuration) {
            return scNext;
        }
    }

    return timing;
  },

  getNextSubCorrectedTiming : function(timing, nextSub) {
    var frameDuration = this.frameDuration / 2;

    if (nextSub) {
        var nextStart = this.getFrameTiming(nextSub.Start);
        var blankStart = nextStart - VSSCore.MinimumBlank;
        if (Math.abs(blankStart - timing) < frameDuration) {
            timing = blankStart;
        } else if (Math.abs(nextStart - timing) < frameDuration) {
            timing = nextStart - 1;
        }
    }

    return timing;
  },

  initFrameDuration : function() {
    this.frameDuration = Common.getFrameDuration() || 1001 / 24;
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
