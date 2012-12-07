// Action Resync plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
//
// Video demonstration: http://spsubs.free.fr/auto_resync.swf.html
//


LoadScript("../common/common.js");


JSAction_Resync = {
  DEBUG : false,
  EARLY_AUDIO_FRAMES : 2,
  LATE_AUDIO_FRAMES : 2,

  iterSubs : function(func, firstIndex, lastIndex) {
    if (!lastIndex) {
        lastIndex = VSSCore.GetSubCount();
    }
    for (var i = firstIndex ? firstIndex - 1 : 0; i < lastIndex; ++i) {
        func(VSSCore.GetSubAt(i));
    }
  },

  getFrameTiming : function(timing) {
    var frame = Math.round(timing / this.frameDuration);
    var frameTiming = Math.round(frame * this.frameDuration);

    // return this.getSCCorrectedTiming(frameTiming);
    return frameTiming;
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

  initFrameDuration : function() {
    this.frameDuration = Common.getFrameDuration() || 1001 / 24;
  },

  normalizeTimings : function() {
    if (undefined !== JSAction_NormalizeTimings) {
        JSAction_NormalizeTimings.onExecute();
    }
  },

  timing2text : function(timing) {
    h = parseInt(timing / 3600000);
    ms = timing % 1000;
    timing %= 3600000;
    m = parseInt(timing / 60000);
    timing %= 60000;
    s = parseInt(timing / 1000);
    return [h, m, s, ms].join(":");
  }
};


JSAction_Resync1 = {
  onExecute : function() {
    if (!SceneChange.GetCount()) {
        ScriptLog("Error: no scene changes")
        return;
    }
    var subCount = VSSCore.GetSubCount();
    var scCount = 0;
    var bscCount = 0;
    JSAction_Resync.initFrameDuration();

    JSAction_Resync.iterSubs(function(sub) {
        var newText = sub.Text.replace(/\{\\[EBF]?SC\d*\}/g, "");
        if (newText == "") {
            newText = " ";
        }
        if (newText != sub.Text) {
            sub.Text = newText;
        }

        var prevSC = SceneChange.GetPrevious(sub.Start);
        if (prevSC >= 0) {
            prevSC = JSAction_Resync1.getCorrectedSC(prevSC);
            var diff = prevSC + SceneChange.StopOffset - sub.Start;
            if (diff > 0) {
                ++bscCount;
            }
            if (Math.abs(diff) < JSAction_Resync.frameDuration / 2) {
                var prevPrevSC = SceneChange.GetPrevious(prevSC - 1);
                if (prevPrevSC >= 0) {
                    sub.Text = "{\\SC" + (prevSC - prevPrevSC) + "}" +
                        sub.Text;
                } else {
                    sub.Text = "{\\SC}" + sub.Text;
                }
                ++scCount;
            } else if (diff < 0 && diff > JSAction_Resync.frameDuration * -3) {
                sub.Text = "{\\ESC" + (SceneChange.StopOffset - diff) + "}" +
                    sub.Text;
            } else if (diff >= 0) {
                var prevSub = VSSCore.GetPrevious(sub);
                if (!prevSub ||
                    sub.Start - prevSub.Stop >=
                    SceneChange.StartOffset + SceneChange.StopOffset
                ) {
                    sub.Text = "{\\BSC" + (SceneChange.StopOffset - diff) +"}" +
                        sub.Text;
                }
            } else {
                sub.Text = "{\\FSC" + (SceneChange.StopOffset - diff) +"}" +
                    sub.Text;
            }
        }

        var nextSC = SceneChange.GetNext(sub.Stop);
        if (nextSC >= 0) {
            nextSC = JSAction_Resync1.getCorrectedSC(nextSC);
            var diff = nextSC - SceneChange.StartOffset - sub.Stop;
            if (diff < 0) {
                ++bscCount;
            }
            if (Math.abs(diff) < JSAction_Resync.frameDuration / 2) {
                var nextNextSC = SceneChange.GetNext(nextSC + 1);
                if (nextNextSC >= 0) {
                    sub.Text = sub.Text + "{\\SC" + (nextNextSC - nextSC) +
                        "}";
                } else {
                    sub.Text = sub.Text + "{\\SC}";
                }
                ++scCount;
            } else if (diff <= 0) {
                var nextSub = VSSCore.GetNext(sub);
                if (!nextSub ||
                    nextSub.Start - sub.Stop >=
                    SceneChange.StartOffset + SceneChange.StopOffset
                ) {
                    sub.Text = sub.Text + "{\\BSC" +
                        (SceneChange.StartOffset + diff) + "}";
                }
            } else {
                sub.Text = sub.Text + "{\\FSC" +
                    (SceneChange.StartOffset + diff) + "}";
            }
        }
    });

    var firstSub = VSSCore.GetFirst();
    if (firstSub) {
        firstSub.Text = firstSub.Text.replace(/\{\\RS\d+,\d+\}/, "");
        firstSub.Text = "{\\RS" +
            SceneChange.StartOffset + "," +
            SceneChange.StopOffset + "}" +
            firstSub.Text;
    }

    if (JSAction_QuickStats) {
        stats = JSAction_QuickStats.run();
        if (stats) {
            if (stats.minBlank > VSSCore.MinimumBlank) {
                ScriptLog("Warning: minimum blank doesn't match preset.");
            }
        }
    }
    if (scCount / subCount < .1) {
        ScriptLog("Warning: very few scene change matches; check preset or video.");
    }
    if (bscCount / subCount > .2) {
        ScriptLog("Warning: too many scene change mismatches; check preset.");
    }
  },

  getCorrectedSC : function(timing) {
    var corrected = JSAction_Resync.getFrameTiming(timing);
    return Math.abs(timing - corrected) > 3 ? corrected : timing;
  }
};


JSAction_Resync2 = {
  searchLimit : 60000 * 3,
  onExecute : function() {
    if (!SceneChange.GetCount()) {
        ScriptLog("Error: no scene changes")
        return;
    }
    var subs = this.run();
    if (subs) {
        JSAction_Resync.iterSubs(function(sub) {
            if (/^\{\\SC\d*\}/.test(sub.Text)) {
                sub.Start = JSAction_Resync2.getSCCorrectedStart(sub.Start);
            }
            if (/\{\\SC\d*\}$/.test(sub.Text)) {
                sub.Stop = JSAction_Resync2.getSCCorrectedStop(sub.Stop);
            }
        });
        this.finalize(subs);
        ScriptLog("Resync done");
    }
  },

  run : function() {
    var firstSub = VSSCore.GetFirst();

    if (!firstSub) {
        return;
    }

    var match = firstSub.Text.match(/^\{\\RS(\d+),(\d+)\}/);

    if (match) {
        if (match[1] != SceneChange.StartOffset || match[2] != SceneChange.StartOffset) {
            ScriptLog("Preset mismatch");
            return;
        }

        firstSub.Text = firstSub.Text.replace(/\{\\RS\d+,\d+\}/, "");
    }

    JSAction_Resync.initFrameDuration();
    JSAction_Resync2.diffLimit = parseInt(
        JSAction_Resync.frameDuration * 2);
    JSAction_Resync2.audioDiffLimit = parseInt(
        JSAction_Resync.frameDuration * 3 + 1);
    JSAction_Resync2.halfDiffLimit = Math.ceil(JSAction_Resync2.diffLimit / 2);
    JSAction_Resync2.halfFrameDuration = Math.ceil(
        JSAction_Resync.frameDuration / 2);

    var firstIndex = 0;
    var lastIndex = null;
    var newFirstIndex = null;
    var subs = new Array();
    var minTiming = -JSAction_Resync2.searchLimit;

    do {
        if (JSAction_QuickStats) {
            stats = JSAction_QuickStats.run();
            if (stats) {
                var rsIndex = Common.getReadingSpeedIndex(stats.maxRs);
                this.maxRS = Common.READING_SPEED_DEF[rsIndex].value;
                this.minDuration = stats.minDuration;
                break;
            }
        }
        this.maxRS = Common.STRICT_MAX_RS;
        this.minDuration = VSSCore.MinimumDuration;
    } while (false);


    // Old references to subtitles returned from VSSCore seem to get
    // periodically recycled, despite being referenced in JavaScript,
    // so we need to work with copies.
    JSAction_Resync.iterSubs(function(sub) {
        subs.push(JSAction_Resync2.copySub(sub, VSSCore.GetNext(sub)));
    });

    var searchLimit = JSAction_Resync2.searchLimit;

    for (var i = 0; i < subs.length; ++i) {
        var sub = subs[i];
        var lowerCaseText = sub.Text.replace(/\{\\[EBF]?SC\d*\}/g, "").toLowerCase();

        if (i && JSAction_Resync2.startsWith(lowerCaseText, "{\\pub}")) {
            lastIndex = i;
            newFirstIndex = i;
        } else if (JSAction_Resync2.endsWith(lowerCaseText, "{\\pub}")) {
            lastIndex = i + 1;
            newFirstIndex = i + 1;
        }

        if (lastIndex) {
            var result = JSAction_Resync2.findBestDelay(
                subs.slice(firstIndex, lastIndex), minTiming, searchLimit);
            if (result.matchCount == 0 && minTiming < 0) {
                minTiming = 0;
                result = JSAction_Resync2.findBestDelay(
                    subs.slice(firstIndex, lastIndex), minTiming, searchLimit);
            }
            JSAction_Resync2.delaySubs(subs, firstIndex, result);

            if (result.matchCount) {
                minTiming = subs[lastIndex - 1].Stop;
            }
            firstIndex = newFirstIndex;
            lastIndex = null;
        }
    }

    var result = JSAction_Resync2.findBestDelay(
        subs.slice(firstIndex), minTiming, searchLimit);
    JSAction_Resync2.delaySubs(subs, firstIndex, result);

    return subs;
  },

  finalize : function(subs) {
    var tooFast = 0;
    for (var i = 0; i < subs.length; ++i) {
        var copiedSub = subs[i];
        var sub = VSSCore.GetSubAt(i);
        var prevSub = VSSCore.GetPrevious(sub);
        var nextSub = VSSCore.GetNext(sub);
        var len = sub.StrippedText.length;
        var duration = sub.Stop - sub.Start;
        var rs = Common.getRsFromLengthDuration(len, duration);

        if (nextSub && copiedSub.originalBlank == VSSCore.MinimumBlank) {
            var blank = nextSub.Start - sub.Stop;
            if (copiedSub.originalBlank != blank) {
                if (/^\{\\SC\d*\}/.test(nextSub.Text)) {
                    var nextStart = Common.getNonOverlappedStart(
                        sub.Stop + copiedSub.originalBlank, null,
                        SceneChange.GetPrevious(nextSub.Start));
                    if (nextStart < nextSub.Start) {
                        JSAction_Resync.debugLog("nb"+sub.Index);
                        nextSub.Start = nextStart;
                    }
                } else if (blank > copiedSub.originalBlank * 2) {
                    // Don't fix next start.
                } else {
                    nextSub.Start = sub.Stop + copiedSub.originalBlank;
                }
            }
        }

        if (prevSub && lastOriginalBlank == VSSCore.MinimumBlank) {
            var blank = sub.Start - prevSub.Stop;
            if (lastOriginalBlank != blank) {
                var prevStop = Common.getNonOverlappedStop(
                    sub.Start - lastOriginalBlank, null,
                    SceneChange.GetNext(prevSub.Stop));
                if (prevStop > prevSub.Stop) {
                    if (blank > lastOriginalBlank * 2) {
                        ScriptLog("#" + prevSub.Index + ": big duration increase (" + ((prevStop - prevSub.Stop) / 1000) +" s)");
                    }
                    JSAction_Resync.debugLog("pb"+sub.Index);
                    prevSub.Stop = prevStop;
                }
            }
        }

        if (rs >= this.maxRS) {
            var oldBlank = nextSub ? nextSub.Start - sub.Stop : null;
            var nextSC = SceneChange.GetNext(sub.Stop);
            var targetDuration = Math.ceil(Common.getDurationFromLengthRs(len,
                this.maxRS));
            var stop = JSAction_Resync.getFrameTiming(sub.Start +
                targetDuration);
            if (Common.getRsFromLengthDuration(len, stop - sub.Start) >=
                this.maxRS
            ) {
                stop += JSAction_Resync.frameDuration;
            }
            stop = this.getNonOverlappedStopNoSCOffset(stop, null, nextSC);
            if (stop > sub.Stop) {
                // JSAction_Resync.debugLog("r"+sub.Index);
                sub.Stop = stop;
                duration = sub.Stop - sub.Start;
                if (nextSub) {
                    var newBlank = nextSub.Start - sub.Stop;
                    if (newBlank <= VSSCore.MinimumBlank) {
                        var start = stop + Math.min(oldBlank,
                            VSSCore.MinimumBlank);
                        var diff = Math.round(start - nextSub.Start);
                        if (diff > JSAction_Resync.frameDuration * 1.5) {
                            ScriptLog("#" + nextSub.Index + ": start +" +
                                diff +
                                " ms to maintain previous subtitle RS");
                        }
                        nextSub.Start = start;
                    }
                }
            }
        }

        if (duration < this.minDuration) {
            var oldBlank = nextSub ? nextSub.Start - sub.Stop : null;
            var nextSC = SceneChange.GetNext(sub.Stop);
            var stop = this.getNonOverlappedStopNoSCOffset(sub.Start +
                this.minDuration, null, nextSC);
            if (stop > sub.Stop) {
                // JSAction_Resync.debugLog("d"+sub.Index);
                sub.Stop = stop;
                if (nextSub) {
                    var newBlank = nextSub.Start - sub.Stop;
                    if (newBlank <= VSSCore.MinimumBlank) {
                        var start = stop + Math.min(oldBlank,
                            VSSCore.MinimumBlank);
                        var diff = Math.round(start - nextSub.Start);
                        if (diff > JSAction_Resync.frameDuration * 1.5) {
                            ScriptLog("#" + nextSub.Index + ": start +" +
                                diff +
                                " ms to maintain previous subtitle duration");
                        }
                        nextSub.Start = start;
                    }
                }
            }
        }

        var newDuration = sub.Stop - sub.Start;
        var newRS = Common.getRsFromLengthDuration(len, newDuration);
        if (newRS >= Common.STRICT_MAX_RS) {
            ++tooFast;
        }

        var lastOriginalBlank = copiedSub.originalBlank;
        sub.Text = sub.Text.replace(/\{\\[EBF]?SC\d*\}/g, "")
    }
    if (tooFast) {
        ScriptLog("Warning: " + tooFast + " unresolved TOO FAST subtitle(s)");
    }
    return tooFast;
  },

  getNonOverlappedStopNoSCOffset : function(stop, nextSub, nextSC) {
    if (nextSub) {
        var max = nextSub.Start - VSSCore.MinimumBlank;
        if (stop > max) {
            stop = max;
        }
    }
    if (nextSC >= 0 && stop > nextSC) {
        stop = nextSC;
    }
    return stop;
  },

  copySub : function(sub, nextSub) {
    var len = sub.StrippedText.length;
    var duration = sub.Stop - sub.Start;
    var rs = Common.getRsFromLengthDuration(len, duration);
    var blank = nextSub ? nextSub.Start - sub.Stop : null;
    return {Index: sub.Index, Start: sub.Start, Stop: sub.Stop, Text: sub.Text,
        originalDuration: duration, originalRS: rs, originalBlank: blank};
  },

  findBestDelay : function(subs, minTiming, searchLimit) {
    var scoreData = new Array();
    var computedDelays = {};
    var scCount = 0;
    var matchCount = 0;

    for (var i = 0; i < subs.length; ++i) {
        var match = subs[i].Text.match(/\{\\[EBF]?SC\d*\}/g);
        if (match) {
            scCount += match.length;
        }
    }

    // Ignore if too few matched scene changes.
    if (scCount < 3) {
        scCount = Infinity;
    }

    var delayLowerLimit = minTiming - subs[0].Start;

    for (var i = 0; !matchCount && i < subs.length; ++i) {
        var sub = subs[i];

        if (/^\{\\SC\d*\}/.test(sub.Text)) {
            matchCount += JSAction_Resync2.iterSC(sub.Start,
                function(scTiming) {
                    var delay = JSAction_Resync.getFrameTiming(
                        scTiming + SceneChange.StopOffset - sub.Start);
                    if (!(delay in computedDelays)) {
                        var score = JSAction_Resync2.getScore(subs, delay);
                        scoreData.push({score: score, delay: delay});
                        computedDelays[delay] = score.looseSingles;
                    }
                    return computedDelays[delay];
                }, searchLimit, sub.Start + delayLowerLimit, scCount);
        }

        if (!matchCount && /\{\\SC\d*\}$/.test(sub.Text)) {
            matchCount += JSAction_Resync2.iterSC(sub.Stop,
                function(scTiming) {
                    var delay = JSAction_Resync.getFrameTiming(
                        scTiming - SceneChange.StartOffset - sub.Stop);
                    if (!(delay in computedDelays)) {
                        var score = JSAction_Resync2.getScore(subs, delay);
                        scoreData.push({score: score, delay: delay});
                        computedDelays[delay] = score.looseSingles;
                    }
                    return computedDelays[delay];
                }, searchLimit, sub.Stop + delayLowerLimit, scCount);
        }

        if (!matchCount && /\^{\\[EBF]SC(\d+)\}/.test(sub.Text)) {
            var match = sub.Text.match(/^\{\\[EBF]SC(\d+)\}/);
            var dist = parseInt(match[1]);
            matchCount += JSAction_Resync2.iterSC(sub.Start - dist,
                function(scTiming) {
                    var delay = JSAction_Resync.getFrameTiming(
                        scTiming + dist - sub.Start);
                    if (!(delay in computedDelays)) {
                        var score = JSAction_Resync2.getScore(subs, delay);
                        scoreData.push({score: score, delay: delay});
                        computedDelays[delay] = score.looseSingles;
                    }
                    return computedDelays[delay];
                }, searchLimit, sub.Start + delayLowerLimit - dist, scCount);
        }

        if (!matchCount && /\{\\[EBF]SC(\d+)\}$/.test(sub.Text)) {
            var match = sub.Text.match(/\{\\[EBF]SC(\d+)\}$/);
            var dist = parseInt(match[1]);
            matchCount += JSAction_Resync2.iterSC(sub.Stop + dist,
                function(scTiming) {
                    var delay = JSAction_Resync.getFrameTiming(
                        scTiming - dist - sub.Stop);
                    if (!(delay in computedDelays)) {
                        var score = JSAction_Resync2.getScore(subs, delay);
                        scoreData.push({score: score, delay: delay});
                        computedDelays[delay] = score.looseSingles;
                    }
                    return computedDelays[delay];
                }, searchLimit, sub.Stop + delayLowerLimit + dist, scCount);
        }
    }

    scoreData.sort(this.sortScore);

    if (scoreData.length) {
        if (matchCount) {
            scoreData = scoreData.slice(0, 3);
            var deltas = [
                -JSAction_Resync.frameDuration,
                JSAction_Resync.frameDuration,
                -JSAction_Resync.frameDuration * 2,
                JSAction_Resync.frameDuration * 2,
                -JSAction_Resync.frameDuration * 3,
                JSAction_Resync.frameDuration * 3
            ];
            for (var i = 0; i < deltas.length; ++i) {
                var delay = JSAction_Resync.getFrameTiming(
                    scoreData[0].delay + deltas[i]);
                if (!(delay in computedDelays)) {
                    var score = JSAction_Resync2.getScore(subs, delay);
                    scoreData.push({score: score, delay: delay});
                    computedDelays[delay] = score.looseSingles;
                    if (score.looseSingles * 2 > scCount) {
                        ++matchCount;
                    }
                }
            }
            scoreData.sort(this.sortScore);
        }

        // ScriptLog(scCount);
        // for (i = 0; i < Math.min(3, scoreData.length); ++i) {
            // var d = scoreData[i];
            // ScriptLog(d.delay+","+d.score.doubles+","+d.score.singles+","+d.score.looseSingles);
        // }

        do {
            if (scoreData.length >= 2) {
                if (Infinity === scCount) {
                    if (Math.abs(scoreData[1].delay) <
                        Math.abs(scoreData[0].delay)
                    ) {
                        var score = scoreData[1];
                        break;
                    }
                } else {
                    var diff = scoreData[0].delay - scoreData[1].delay;
                    if (diff > 0 && diff <= JSAction_Resync.frameDuration + 1 &&
                        scoreData[1].score.singles * 2 > scCount
                    ) {
                        var score = scoreData[1];
                        break;
                    }
                }
            }
            var score = scoreData[0];
        } while (false);
        var foundDelay = score.delay;
        if (!matchCount && score.looseSingles * 2 > scCount) {
            ++matchCount;
        }
    } else {
        var foundDelay = 0;
    }

    return {delay: foundDelay, matchCount: matchCount};
  },

  sortScore : function(a, b) {
        var doubles = b.score.doubles - a.score.doubles;
        if (doubles) return doubles;
        var singles = b.score.singles - a.score.singles;
        if (singles) return singles;
        var looseSingles = b.score.looseSingles - a.score.looseSingles;
        if (looseSingles) return looseSingles;
        return Math.abs(a.delay) - Math.abs(b.delay);
  },

  getScore : function(subs, delay) {
    var looseSingles = 0;
    var singles = 0;
    var doubles = 0;

    for (var i = 0; i < subs.length; ++i) {
        var sub = subs[i];

        var match = sub.Text.match(/^\{\\SC(\d*)\}/);
        if (match) {
            var delayedStart = sub.Start + delay;
            var scTiming = SceneChange.GetPrevious(delayedStart);
            if (scTiming >= 0) {
                var d = Math.abs(scTiming + SceneChange.StopOffset -
                    delayedStart);
                if (d < JSAction_Resync2.diffLimit) {
                    ++looseSingles;
                    if (d < JSAction_Resync.frameDuration) {
                        ++singles;
                        if ("" != match[1]) {
                            var scDist = parseInt(match[1]);
                            var sc2 = scTiming - scDist;
                            var tolerance = 1 + parseInt(
                                JSAction_Resync.frameDuration);
                            var stop = Math.min(sc2 + tolerance, scTiming - 1);
                            var start = Math.min(sc2 - tolerance, stop - 1);
                            if (SceneChange.Contains(start, stop)) {
                                doubles += scDist <
                                    JSAction_Resync.frameDuration + 1 ? 1 : 2;
                            }
                        }
                    }
                }
            }
        } else {
            var match = sub.Text.match(/^\{\\[EBF]SC(\d+)\}/);
            if (match) {
                var dist = parseInt(match[1]);
                var delayedStart = sub.Start + delay;
                var pos = delayedStart - dist;
                var start = pos - JSAction_Resync2.halfDiffLimit;
                var stop = pos + JSAction_Resync2.halfDiffLimit;

                if (SceneChange.Contains(start, stop)) {
                    ++looseSingles;
                    var start = pos - JSAction_Resync2.halfFrameDuration;
                    var stop = pos + JSAction_Resync2.halfFrameDuration;
                    if (SceneChange.Contains(start, stop)) {
                        ++singles;
                    }
                }
            }
        }

        var match = sub.Text.match(/\{\\SC(\d*)\}$/);
        if (match) {
            var delayedStop = sub.Stop + delay;
            var scTiming = SceneChange.GetNext(delayedStop);
            if (scTiming >= 0) {
                var d = Math.abs(scTiming - SceneChange.StartOffset -
                    delayedStop);
                if (d < JSAction_Resync2.diffLimit) {
                    ++looseSingles;
                    if (d < JSAction_Resync.frameDuration) {
                        ++singles;
                        if ("" != match[1]) {
                            var scDist = parseInt(match[1]);
                            var sc2 = scTiming + scDist;
                            var tolerance = 1 + parseInt(
                                JSAction_Resync.frameDuration);
                            var start = Math.max(sc2 - tolerance, scTiming + 1);
                            var stop = Math.max(sc2 + tolerance, start + 1);
                            if (SceneChange.Contains(start, stop)) {
                                doubles += scDist <
                                    JSAction_Resync.frameDuration + 1 ? 1 : 2;
                            }
                        }
                    }
                }
            }
        } else {
            var match = sub.Text.match(/\{\\[EBF]SC(\d+)\}$/);
            if (match) {
                var dist = parseInt(match[1]);
                var delayedStop = sub.Stop + delay;
                var pos = delayedStop + dist;
                var start = pos - JSAction_Resync2.halfDiffLimit;
                var stop = pos + JSAction_Resync2.halfDiffLimit;

                if (SceneChange.Contains(start, stop)) {
                    ++looseSingles;
                    var start = pos - JSAction_Resync2.halfFrameDuration;
                    var stop = pos + JSAction_Resync2.halfFrameDuration;
                    if (SceneChange.Contains(start, stop)) {
                        ++singles;
                    }
                }
            }
        }
    }

    return {looseSingles: looseSingles, singles: singles, doubles: doubles};
  },

  iterSC : function(timing, func, searchLimit, minTiming, scCount) {
    var prevSC = SceneChange.GetPrevious(timing - 1);
    var nextSC = SceneChange.GetNext(timing);
    var matchCount = 0;

    if (minTiming < 0) {
        minTiming = 0;
    }

    do {
        var singles = null;
        if (prevSC >= minTiming && timing - prevSC <= searchLimit) {
            singles = func(prevSC);
            prevSC = SceneChange.GetPrevious(prevSC - 1);
            if (singles * 2 > scCount) {
                ++matchCount;
                break;
            }
        }
        if (nextSC >= 0 && nextSC - timing <= searchLimit) {
            singles = func(nextSC);
            nextSC = SceneChange.GetNext(nextSC + 1);
            if (singles * 2 > scCount) {
                ++matchCount;
                break;
            }
        }
    } while (null !== singles);

    return matchCount;
  },

  delaySubs : function(subs, index, delayData) {
    var negativeTimings = false;
    var warnings = delayData.matchCount ? [] : ["unsure"];
    for (var i = index; i < subs.length; ++i) {
        var sub = subs[i];
        sub.Start += delayData.delay;
        sub.Stop += delayData.delay;
        var vssSub = VSSCore.GetSubAt(i);
        vssSub.Start = sub.Start;
        vssSub.Stop = sub.Stop;
        if (sub.Start < 0 && !negativeTimings) {
            warnings.push("negative timings");
            negativeTimings = true;
        }
    }
    var warningMsg = warnings.length ? " (" + warnings.join(", ") + ")" : "";
    ScriptLog("Delay from subtitle #" + subs[index].Index + ": " +
        delayData.delay / 1000 + " s" + warningMsg);
  },

  getSCCorrectedStart : function(timing) {
    var scPrev = SceneChange.GetPrevious(timing);

    if (scPrev >= 0) {
        var scStop = scPrev + SceneChange.StopOffset;
        if (Math.abs(scStop - timing) <= JSAction_Resync2.audioDiffLimit) {
            return scStop;
        }// else if (Math.abs(scPrev - timing) < JSAction_Resync2.audioDiffLimit) {
            // return scPrev;
        // }
    }

    var scNext = SceneChange.GetNext(timing);

    if (scNext >= 0) {
        var scStop = scNext + SceneChange.StopOffset;
        if (Math.abs(scStop - timing) <= JSAction_Resync2.audioDiffLimit) {
            return scStop;
        }// else if (Math.abs(scNext - timing) < JSAction_Resync2.audioDiffLimit) {
            // return scNext;
        // }
    }

    return timing;
  },

  getSCCorrectedStop : function(timing) {
    var scPrev = SceneChange.GetPrevious(timing);

    if (scPrev >= 0) {
        var scStart = scPrev - SceneChange.StartOffset;
        if (Math.abs(scStart - timing) <= JSAction_Resync2.audioDiffLimit) {
            return scStart;
        }// else if (Math.abs(scPrev - timing) < JSAction_Resync2.audioDiffLimit) {
            // return scPrev;
        // }
    }

    var scNext = SceneChange.GetNext(timing);

    if (scNext >= 0) {
        var scStart = scNext - SceneChange.StartOffset;
        if (Math.abs(scStart - timing) <= JSAction_Resync2.audioDiffLimit) {
            return scStart;
        }// else if (Math.abs(scNext - timing) < JSAction_Resync2.audioDiffLimit) {
            // return scNext;
        // }
    }

    return timing;
  },

  startsWith : function(s, prefix) {
    return s.substr(0, prefix.length) == prefix;
  },

  endsWith : function(s, suffix) {
    return s.substr(s.length - suffix.length) == suffix;
  },
};


JSAction_Resync2EarlyAudio = {
  onExecute : function() {
    if (!SceneChange.GetCount()) {
        ScriptLog("Error: no scene changes")
        return;
    }
    var subs = JSAction_Resync2.run();
    if (!subs) {
        return;
    }
    var delay = -JSAction_Resync.EARLY_AUDIO_FRAMES * JSAction_Resync.frameDuration;
    // JSAction_Resync.normalizeTimings();

    JSAction_Resync.iterSubs(function(sub) {
        if (/^\{\\SC\d*\}/.test(sub.Text)) {
            sub.Start = JSAction_Resync2.getSCCorrectedStart(sub.Start);
        } else if (/^\{\\ESC(\d*)\}/.test(sub.Text)) {
            sub.Start = Common.getNonOverlappedStart(sub.Start + delay,
                VSSCore.GetPrevious(sub), SceneChange.GetPrevious(sub.Start));
        } else if (/^\{\\BSC(\d*)\}/.test(sub.Text)) {
            var prevSC = SceneChange.GetPrevious(sub.Start);
            if (prevSC >= 0 && prevSC + SceneChange.StopOffset >= sub.Start) {
                var start = sub.Start + delay;
                var match = sub.Text.match(/^\{\\BSC(\d*)\}/);
                var dist = parseInt(match[1]) || 0;
                var minTiming = prevSC + dist;
                if (start < minTiming) {
                    start = minTiming;
                }

                var prevSub = VSSCore.GetPrevious(sub);
                if (prevSub) {
                    var minTiming = prevSub.Stop + VSSCore.MinimumBlank;
                    if (start < minTiming) {
                        start = minTiming;
                    }
                }
                sub.Start = start;
            }
        } else {
            sub.Start = Common.getNonOverlappedStart(sub.Start + delay,
                VSSCore.GetPrevious(sub), -1);
        }
        if (/\{\\SC\d*\}$/.test(sub.Text)) {
            sub.Stop = JSAction_Resync2.getSCCorrectedStop(sub.Stop);
        } else {
            sub.Stop = Common.getNonOverlappedStop(sub.Stop + delay, null, -1);
        }
    });

    JSAction_Resync2.finalize(subs);
    // JSAction_Resync.normalizeTimings();
    ScriptLog("Resync done with audio delay " + Math.round(delay) + " ms");
  }
};

JSAction_Resync2LateAudio = {
  onExecute : function() {
    if (!SceneChange.GetCount()) {
        ScriptLog("Error: no scene changes")
        return;
    }
    var subs = JSAction_Resync2.run();
    if (!subs) {
        return;
    }
    var delay = JSAction_Resync.LATE_AUDIO_FRAMES * JSAction_Resync.frameDuration;
    // JSAction_Resync.normalizeTimings();

    JSAction_Resync.iterSubs(function(sub) {
        if (/^\{\\SC\d*\}/.test(sub.Text)) {
            sub.Start = JSAction_Resync2.getSCCorrectedStart(sub.Start);
        } else if (/^\{\\ESC(\d*)\}/.test(sub.Text)) {
            sub.Start = Common.getNonOverlappedStart(sub.Start + delay,
                VSSCore.GetPrevious(sub), SceneChange.GetPrevious(sub.Start));
        } else if (/^\{\\BSC(\d*)\}/.test(sub.Text)) {
            var prevSC = SceneChange.GetPrevious(sub.Start);
            if (prevSC >= 0 && prevSC + SceneChange.StopOffset >= sub.Start) {
                var start = sub.Start + delay;
                var match = sub.Text.match(/^\{\\BSC(\d*)\}/);
                var dist = parseInt(match[1]) || 0;
                var minTiming = prevSC + dist;
                if (start < minTiming) {
                    start = minTiming;
                }

                var prevSub = VSSCore.GetPrevious(sub);
                if (prevSub) {
                    var minTiming = prevSub.Stop + VSSCore.MinimumBlank;
                    if (start < minTiming) {
                        start = minTiming;
                    }
                }
                sub.Start = start;
            }
        } else {
            sub.Start = Common.getNonOverlappedStart(sub.Start + delay,
                VSSCore.GetPrevious(sub), -1);
        }
        if (/\{\\SC\d*\}$/.test(sub.Text)) {
            sub.Stop = JSAction_Resync2.getSCCorrectedStop(sub.Stop);
        } else {
            sub.Stop = Common.getNonOverlappedStop(sub.Stop + delay, null, -1);
        }
    });

    JSAction_Resync2.finalize(subs);
    // JSAction_Resync.normalizeTimings();
    ScriptLog("Resync done with audio delay " + Math.round(delay) + " ms");
  }
};


if (JSAction_Resync.DEBUG) {
    JSAction_Resync.debugLog = function(msg) {
        ScriptLog(msg);
    }
} else {
    JSAction_Resync.debugLog = function() {}
}


VSSCore.RegisterJavascriptAction("JSAction_Resync1",
    "Resync - 1th pass (with source video)", "");
VSSCore.RegisterJavascriptAction("JSAction_Resync2",
    "Resync - 2nd pass (with destination video)", "");
// VSSCore.RegisterJavascriptAction("JSAction_Resync2EarlyAudio",
    // "Resync - 2nd pass (with destination video) for early audio", "");
// VSSCore.RegisterJavascriptAction("JSAction_Resync2LateAudio",
    // "Resync - 2nd pass (with destination video) for late audio", "");
