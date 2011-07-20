/*
  Scene change check

  original version by Nathbot
  modified by Toff for integration in VSS 0.9.11
  07 Dec 2008   re-written by thyresias at gmail dot com
*/

function readingSpeed(length, start, stop) {
  var readingDuration = (stop - start) / 1000.0 - 0.5;
  if (readingDuration <= 0)
    return Infinity;
  else
    return length / readingDuration;
}

function checkSub(CurrentSub, PreviousSub, NextSub) {

  // check for a scene change inside the subtitle "hot zone"
  var hotZoneStart = CurrentSub.Start - SceneChange.StopOffset + 1;
  var hotZoneStop = CurrentSub.Stop + SceneChange.StartOffset - 1;
  if (!SceneChange.Contains(hotZoneStart, hotZoneStop))
    return null;

  var scTime;   // time of scene change

  // scene change before the subtitle starts?
  scTime = SceneChange.GetPrevious(CurrentSub.Start);
  if (scTime > 0 && hotZoneStart <= scTime)
    return {
      msg: "Starts too close to a scene change: " + (CurrentSub.Start - scTime) + " ms",
      fix: "start a bit later",
      fixShift: false,
      fixStart: scTime + SceneChange.StopOffset,
      fixStop: CurrentSub.Stop
    };

  // scene change after the subtitle stops?
  scTime = SceneChange.GetNext(CurrentSub.Stop);
  if (scTime > 0 && hotZoneStop >= scTime)
    return {
      msg: "Ends too close to a scene change: " + (scTime - CurrentSub.Stop) + " ms",
      fix: "stop a bit earlier",
      fixShift: false,
      fixStart: CurrentSub.Start,
      fixStop: scTime - SceneChange.StartOffset
    };

  // at this point, there is a scene change inside the subtitle
  scTime = SceneChange.GetNext(CurrentSub.Start);
  var timeToStart = scTime - CurrentSub.Start;
  var timeToStop = CurrentSub.Stop - scTime;

  // closer to start than end
  if (timeToStart < timeToStop && timeToStart < SceneChange.FilterOffset) {
    var msg = "Start overlaps a scene change: " + timeToStart + " ms";
    // we can fix if it will preserve a reasonable reading speed
    var newStart = scTime + SceneChange.StopOffset;
    var rs = readingSpeed(CurrentSub.StrippedText.length, newStart, CurrentSub.Stop);
    // --- if the RS would be reasonable this way, we're done
    if (rs <= 35)
      return {
        msg: msg,
        fix: "start later",
        fixShift: false,
        fixStart: newStart,
        fixStop: CurrentSub.Stop
      };
    // --- the RS would be too fast: maybe we can move the end?
    // new stop for ideal reading speed
    var newStop = Math.round(newStart + 500 + CurrentSub.StrippedText.length / 18 * 1000);
    // can't move too close to next subtitle
    if (NextSub && newStop + VSSCore.MinimumBlank > NextSub.Start)
      newStop = NextSub.Start - VSSCore.MinimumBlank;
    // can't move too close to a scene change
    if (newStop > CurrentSub.Stop && SceneChange.Contains(CurrentSub.Stop, newStop + SceneChange.StartOffset))
      newStop = SceneChange.GetNext(CurrentSub.Stop) - SceneChange.StartOffset;
    // do we have a reasonable RS now?
    rs = readingSpeed(CurrentSub.StrippedText.length, newStart, newStop);
    // nope: no fix
    if (rs > 35) return {msg: msg, fix: null};
    // YESSS!
    return {
      msg: msg,
      fix: "shift subtitle",
      fixShift: true,
      fixStart: newStart,
      fixStop: newStop
    };
  }

  // closer to end than start
  else if (timeToStart > timeToStop && timeToStop < SceneChange.FilterOffset) {
    var msg = "End overlaps a scene change: " + timeToStop + " ms";
    // we can fix if it will preserve a reasonable reading speed
    var newStop = scTime - SceneChange.StartOffset;
    var rs = readingSpeed(CurrentSub.StrippedText.length, CurrentSub.Start, newStop);
    // --- if the RS would be reasonable this way, we're done
    if (rs <= 35)
      return {
        msg: msg,
        fix: "stop earlier",
        fixShift: false,
        fixStart: CurrentSub.Start,
        fixStop: newStop
      };
    // --- the RS would be too fast: maybe we can move the start?
    // new start for ideal reading speed
    var newStart = Math.round(newStop - 500 - CurrentSub.StrippedText.length / 18 * 1000);
    // can't move too close to previous subtitle
    if (PreviousSub && newStart - VSSCore.MinimumBlank < PreviousSub.Stop)
      newStart = PreviousSub.Stop + VSSCore.MinimumBlank;
    // can't move too close to a scene change
    if (newStart < CurrentSub.Start && SceneChange.Contains(newStart - SceneChange.StopOffset, CurrentSub.Start))
      newStop = SceneChange.GetPrevious(CurrentSub.Start) + SceneChange.StopOffset;
    // do we have a reasonable RS now?
    rs = readingSpeed(CurrentSub.StrippedText.length, newStart, newStop);
    // nope: no fix
    if (rs > 35) return {msg: msg, fix: null};
    // YESSS!
    return {
      msg: msg,
      fix: "shift subtitle",
      fixShift: true,
      fixStart: newStart,
      fixStop: newStop
    };
  }

  // equal distance from start & end, or inside filtered zone
  var msg = "Overlaps a scene change";
  if (CurrentSub.Stop - CurrentSub.Start >= 2* VSSCore.MinimumBlank)
    msg += ": consider splitting";
  return {
    msg: msg,
    fix: null
  }

}

VSSPlugin = {

  Name: "Scene change",
  Color: 0xFF8040, // orange
  Message: "Scene change",
  Description:
    "Error when a subtitle overlaps a scene change, " +
    "or is too close to a scene change.",

  // --- parameters

  Param_ReportNoFix: { Value: 1, Unit: "1=Yes, 0=No", Description: "Report problems that have no fix?" },
  Param_ReportShift: { Value: 1, Unit: "1=Yes, 0=No", Description: "Report problems where fix is shifting the subtitle?" },

  // --- error detection/fix

  HasError: function(CurrentSub, PreviousSub, NextSub) {
    check = checkSub(CurrentSub, PreviousSub, NextSub);
    if (check == null) return "";
    if (check.fix == null)
      if (this.Param_ReportNoFix.Value == 0)  return "";
      else                                    return check.msg + ", no fix";
    if (check.fixShift && this.Param_ReportShift.Value == 0) return "";
    return check.msg + ", fix: " + check.fix;
  },

  FixError: function(CurrentSub, PreviousSub, NextSub) {
    check = checkSub(CurrentSub, PreviousSub, NextSub);
    if (check == null || check.fix == null) return;
    CurrentSub.Start = check.fixStart;
    CurrentSub.Stop = check.fixStop;
  }

};