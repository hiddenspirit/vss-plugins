/*
  Overlapping & delay between subtitles
  original version by christophe dot paris at free dot fr
  all changes below by thyresias at gmail dot com (www.calorifix.net)
  26 Nov 2005  refactoring, added inter-subtitle delay and smart autofix
  25 Feb 2007  Param_MinDelay set to 170 by default
  14 Nov 2008  use global VSS parameter VSSCore.MinimumBlank
*/

// can we fix the problem?
function canFix(CurrentSub, NextSub, maxOverlapFixed) {
  // if overlap too large, we can't
  if ((NextSub.Start - CurrentSub.Stop) < -maxOverlapFixed)
    return false;
  // if there is less room than twice the min duration plus the minimum delay, we can't either
  if (NextSub.Stop - CurrentSub.Start < 2 * VSSCore.MinimumDuration + VSSCore.MinimumBlank)
    return false;
  // if some jerk set the VSSCore parameters to stupid values, check for reasonable ones
  if (NextSub.Stop - CurrentSub.Start < 1002)
    return false;
  // YES WE CAN!
  return true;
}

function stopEarlier(CurrentSub, NextSub) {
  var newStop = NextSub.Start - VSSCore.MinimumBlank;
  if (newStop > CurrentSub.Start) CurrentSub.Stop = newStop;
}

function startLater(CurrentSub, NextSub) {
  var newStart = CurrentSub.Stop + VSSCore.MinimumBlank;
  if (newStart < NextSub.Stop) NextSub.Start = newStart;
}

function optimizeReadingSpeeds(CurrentSub, NextSub) {

  var totalDur = NextSub.Stop - CurrentSub.Start - VSSCore.MinimumBlank;

  // get the current delay/overlap zone
  var zoneStart, zoneStop;
  if (CurrentSub.Stop <= NextSub.Start) {
    // delay, possibly 0
    zoneStart = CurrentSub.Stop;
    zoneStop = NextSub.Start;
  }
  else {
    // overlap
    zoneStart = NextSub.Start;
    zoneStop = CurrentSub.Stop;
  }

  // ideally, we have the same reading speed for both subtitles: total length / (total time - 1s)
  var curLen = CurrentSub.StrippedText.length;
  var nextLen = NextSub.StrippedText.length;
  var rs = (curLen + nextLen) / (totalDur - 1000);

  // new display times
  var curDur = Math.round(curLen / rs + 500);
  var nextDur = totalDur - curDur;

  // corresponding new stop & start times
  var newCurStop = CurrentSub.Start + curDur;
  var newNextStart = NextSub.Stop - nextDur;

  // we do not want to move the split zone too far from the current one
  // the rule here is that the new zone must touch/overlap the old one

  // if the new zone is before the old one,
  // it means the current sub is way slower than the next one,
  // so we move the stop time of the current one,
  // which will remain slower than the next one, but not as much as before
  if (newNextStart < zoneStart)
    CurrentSub.Stop = NextSub.Start - VSSCore.MinimumBlank;

  // if the new zone is after the old one, it is the reverse,
  // so we move the start time of the next one
  else if (newCurStop > zoneStop)
    NextSub.Start = CurrentSub.Stop + VSSCore.MinimumBlank;

  // otherwise, the new zone overlaps the old one, so we choose it
  else {
    CurrentSub.Stop = newCurStop;
    NextSub.Start = newNextStart;
  }

}

VSSPlugin = {

  Name: "Overlap & delay between subtitles",
  Color: 0xFF0000, // red
  Message: "Delay to next subtitle",
  Description: "Detects subtitles that overlap, or are too close from one another.",

  // --- parameters

  Param_Mode: {
    Value: 1, Unit: '(1/2/3)', Description:
    "How a problem will be fixed:\r\n" +
    "1: Stop current subtitle earlier.\r\n" +
    "2: Start next subtitle later.\r\n" +
    "3: Do what optimizes the reading speeds."
  },
  Param_MaxOverlapFixed: {
    Value: 500, Unit: "ms", Description:
    "If subtitles overlap by more than this value, they won't be fixed."
  },

  // --- error detection/fix

  HasError: function(CurrentSub, PreviousSub, NextSub) {

    // last sub: cannot overlap
    if (NextSub == null) return "";

    // enough delay?
    var delayToNext = NextSub.Start - CurrentSub.Stop;
    if (delayToNext >= VSSCore.MinimumBlank) return "";

    // not enough
    return (
      delayToNext >= 0
      ? delayToNext + " ms delay to next subtitle"
      : (-delayToNext) + " ms overlap"
    ) + (
      canFix(CurrentSub, NextSub, this.Param_MaxOverlapFixed.Value)
      ? ""
      : ", no autofix"
    );
  },

  FixError: function(CurrentSub, PreviousSub, NextSub) {

    if (NextSub == null) return;
    var delayToNext = NextSub.Start - CurrentSub.Stop;
    if (delayToNext >= VSSCore.MinimumBlank) return;
    if (!canFix(CurrentSub, NextSub, this.Param_MaxOverlapFixed.Value)) return;
    switch(this.Param_Mode.Value) {
      case 1: stopEarlier(CurrentSub, NextSub); return;
      case 2: startLater(CurrentSub, NextSub); return;
      case 3: optimizeReadingSpeeds(CurrentSub, NextSub); return;
      default: ScriptLog("Invalid overlap parameter Param_Mode = " + this.Param_Mode.Value); return;
    }

  }

}
