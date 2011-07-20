/*
  Too fast reading speed
  thyresias at gmail dot com (www.calorifix.net)

  14 Jan 2006
  05 May 2006   used Math.round to compare to limit given, so 35.4 is OK for max=35, but 35.6 is not
  20 Jan 2007   used "reading speed" wording
  25 Feb 2007   Param_MinDelay set to 170 by default, Param_ShowOptimal=0 by default
  14 Nov 2008   use global VSS parameter VSSCore.MinimumBlank, removed Param_ShowOptimal
*/

// generic check
function checkSub (Sub, NextSub, maxRS) {

  // length, current duration, reading speed
  var len = Sub.StrippedText.length;
  var durMS = Sub.Stop - Sub.Start;
  var rsX = len * 1000 / (durMS - 500);
  var rs = Math.round(rsX*10) / 10;

  // duration in seconds, rounded to 1 decimal digit
  var dur = Math.round(durMS/100) / 10;

  // check duration
  if (Math.round(rs) <= maxRS) return null;

  var fixDurX = len / maxRS + 0.5;
  var fixDur = Math.round(fixDurX*10)/10;
  var fixLen = Math.round((dur - 0.5) * maxRS);

  // new duration = min, new c/s, new stop time
  var newStop = Sub.Start + Math.round(fixDurX*1000);

  // preserve minimum delay to next subtitle
  if (NextSub != null && newStop > NextSub.Start - VSSCore.MinimumBlank)
    newStop = NextSub.Start - VSSCore.MinimumBlank;

  // return null if we cannot correct
  if (newStop <= Sub.Stop)
   newStop = null;

  if (fixLen<2 || fixLen==len) fixLen = null;

  return {
    curRS: rs,
    fixDurDiff: Math.round(fixDurX*1000 - durMS),
    fixLenDiff: (fixLen ? len - fixLen : null),
    fixable: (newStop != null),
    newStop: newStop
  };

}

VSSPlugin = {

  Name: "Too fast",
  Color: 0xFFFF00, // yellow
  Message: "Too fast reading",
  Description:
    "Error when reading speed > MaxRS (pro: 35).\r\n" +
    "Reading Speed = (subtitle length) / (reading time).\r\n" +
    "(reading time = display time - 0.5 seconds)",

  // --- parameters

  Param_MaxRS: { Value: 35, Unit: "c/s", Description: "Maximum reading speed." },

  // --- error detection/fix

  HasError: function(CurrentSub, PreviousSub, NextSub) {
    var check = checkSub(CurrentSub, NextSub, this.Param_MaxRS.Value);
    if (check == null)
      return "";
    var msg = check.curRS + " c/s >> +" + check.fixDurDiff + " ms";
    if (check.fixable) {
      if (check.fixLenDiff) {
        msg += " or -" + check.fixLenDiff + " char";
        if (check.fixLenDiff > 1) msg += "s";
      }
    }
    else
      msg += ", no fix";
    return msg;
  },

  FixError: function(CurrentSub, PreviousSub, NextSub) {
    var check = checkSub(CurrentSub, NextSub, this.Param_MaxRS.Value);
    if (check && check.fixable) CurrentSub.Stop = check.newStop;
  }

}
