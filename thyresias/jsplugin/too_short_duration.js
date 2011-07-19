/*
  Too short duration
  thyresias at gmail dot com (www.calorifix.net)
  26 Nov 2005
  07 Mar 2006   refactoring: use generic function
  25 Feb 2007   Param_MinDelay set to 170 by default
  14 Nov 2008   update for new VSS capabilities
  14 Dec 2008   renamed to "too short duration"
*/

// generic check
function checkSub (Sub, NextSub) {

  // current duration
  var dur = Sub.Stop - Sub.Start;

  // return null if OK
  if (dur >= VSSCore.MinimumDuration) return null;

  // new duration
  var newStop = Sub.Start + VSSCore.MinimumDuration;

  // preserve minimum delay to next subtitle
  if (NextSub != null && newStop > NextSub.Start - VSSCore.MinimumBlank)
    newStop = NextSub.Start - VSSCore.MinimumBlank;

  // return null if we cannot correct
  if (newStop <= Sub.Stop)
    newStop = null;

  return {
    dur: dur,
    fixable: (newStop != null),
    newStop: newStop
  };

}

VSSPlugin = {

  Name: "Too short duration",
  Color: 0xFF80FF, // pink
  Message: "Too short",
  Description:
    "Error when the duration is less than the minimum duration " +
    "(set in the 'Subtitle' tab, pro: 600 ms = 0.6 s).",

  // --- error detection/fix

  HasError: function(CurrentSub, PreviousSub, NextSub) {
    var check = checkSub(CurrentSub, NextSub);
    if (check == null)
      return "";
    else
      return check.dur + " ms" + ( check.fixable ? "": ", no fix" ) ;
  },

  // lengthen display time
  FixError: function(CurrentSub, PreviousSub, NextSub) {
    var check = checkSub(CurrentSub, NextSub);
    if (check != null && check.fixable) CurrentSub.Stop = check.newStop;
  }
}
