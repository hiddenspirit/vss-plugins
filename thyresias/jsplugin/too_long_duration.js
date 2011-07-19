/*
  Too long duration
  thyresias at gmail dot com (www.calorifix.net)
  26 Nov 2005
  14 Dec 2008   renamed to "too long duration"
  07 Feb 2009   use new 0.9.18 VSS parameter MaximumDuration
*/

VSSPlugin = {

  Name: "Too long duration",
  Color: 0x000080, // dark blue
  Message: "Too long",
  Description:
    "Error when the duration is less than the maximum duration " +
    "(set in the 'Subtitle' tab, pro: 6000 ms = 6 s).",

  // --- parameters

  // --- error detection/fix

  HasError: function(CurrentSub, PreviousSub, NextSub) {
    var durx = CurrentSub.Stop - CurrentSub.Start;
    var dur = Math.round((durx)/100)/10;
    if (durx > VSSCore.MaximumDuration)
      return (dur + " s");
    else
      return "";
  },

  // shorten display time
  FixError: function(CurrentSub, PreviousSub, NextSub) {
    var durx = CurrentSub.Stop - CurrentSub.Start;
    if (durx <= VSSCore.MaximumDuration)
      return;
    CurrentSub.Stop = CurrentSub.Start + VSSCore.MaximumDuration;
  }
}
