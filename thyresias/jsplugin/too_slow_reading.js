/*
  Too slow reading speed
  thyresias at gmail dot com (www.calorifix.net)

  14 Jan 2006
  05 May 2006   used Math.round to compare to limit given, so 4.6 is OK for min=5, but 4.4 is not
                added check for negative corrected CPS (very fast!)
  20 Jan 2007   used "reading speed" wording
  25 Feb 2007   Param_ShowOptimal=0 by default
  14 Nov 2008   use global VSS parameter VSSCore.MinimumBlank, removed Param_ShowOptimal
*/

function checkSub (Sub, NextSub, minRS) {

  // length, current duration, reading speed
  var len = Sub.StrippedText.length;
  var durMS = Sub.Stop - Sub.Start;
  var rsX = len * 1000 / (durMS - 500);
  if (rsX <= 0) return null;  // way too fast!
  var rs = Math.round(rsX*10) / 10;

  // duration in seconds, rounded to 1 decimal digit
  var dur = Math.round(durMS/100) / 10;

  // check duration
  if (Math.round(rs) >= minRS) return null;

  var fixDurX = len / minRS + 0.5;
  var fixDur = Math.round(fixDurX*10)/10;
  var fixLen = Math.round((dur - 0.5) * minRS);

  // new stop time
  var newStop = Sub.Start + Math.round(fixDurX*1000);

  if (fixLen<2 || fixLen==len) fixLen = null;

  return {
    curDur: dur,
    curRS: rs,
    fixDurDiff: Math.round(durMS - fixDurX*1000),
    fixLenDiff: (fixLen ? fixLen - len : null),
    fixable: (newStop != null),
    newStop: newStop
  };

}

VSSPlugin = {

  Name: "Too slow",
  Color: 0x0080FF, // light blue
  Message: "Too slow reading",
  Description:
    "Error when reading speed < MinRS (pro: 5).\r\n" +
    "Reading Speed = (subtitle length) / (reading time).\r\n" +
    "(reading time = display time - 0.5 seconds)",

  // --- parameters

  Param_MinRS: { Value: 5, Unit: "c/s", Description: "Minimum reading speed." },

  // --- error detection/fix

  HasError: function(CurrentSub, PreviousSub, NextSub) {
    var check = checkSub(CurrentSub, NextSub, this.Param_MinRS.Value);
    if (check == null)
      return "";
    var msg = check.curRS + " c/s >> -" + check.fixDurDiff + " ms";
    if (check.fixable) {
      if (check.fixLenDiff) {
        msg += " or +" + check.fixLenDiff + " char";
        if (check.fixLenDiff > 1) msg += "s";
      }
    }
    else
      msg += ", no fix";
    return msg;
  },

  FixError: function(CurrentSub, PreviousSub, NextSub) {
    var check = checkSub(CurrentSub, NextSub, this.Param_MinRS.Value);
    if (check && check.fixable) CurrentSub.Stop = check.newStop;
  },

}
