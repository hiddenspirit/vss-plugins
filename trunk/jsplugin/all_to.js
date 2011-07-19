// All to...
// by Nathbot

LoadScript("common/common.js");

VSSPlugin = {
  // Plugin constants
  Name : "All to...",
  Description : "Sets all subtitles to the specified level.",
  Color : 0x000000,
  Message : "All to...",

  // Plugin parameters available from VSS GUI (name must start with "Param")
  ParamRsLevel : { Value : 2, Unit : "(1/2/3/4)", Description:
    "Reading speed level.\n" +
    "1 = TOO FAST\n" +
    "2 = Fast, acceptable (default)\n" +
    "3 = A bit fast\n" +
    "4 = Good" },
  ParamWithMinDuration : { Value : 1, Unit : "(0/1)", Description:
    "Take minimum duration into account.\n" +
    "0 = Off\n" +
    "1 = On (default)" },

  AllToMessage : "{toRating} - current speed is: {currentRating}",

  // HasError method called for each subtitle during the error checking
  // If there is an error on CurrentSub
  // return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null.
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    var len = CurrentSub.StrippedText.length;
    var duration = CurrentSub.Stop - CurrentSub.Start;
    var currentRs = Common.getRsFromLengthDuration(len, duration);
    var toRs = Common.getRsFromHighLevel(this.ParamRsLevel.Value);

    if (currentRs < toRs && (!this.ParamWithMinDuration.Value ||
        duration > VSSCore.MinimumDuration))
    {
        return Common.formatMessage(this.AllToMessage,
            {toRating: Common.READING_SPEED_DEF[9 - this.ParamRsLevel.Value].
            text, currentRating: Common.getReadingSpeedRating(currentRs)});
    }

    return "";
  },

  FixError : function(CurrentSub, PreviousSub, NextSub) {
    var len = CurrentSub.StrippedText.length;
    var rs = Common.getRsFromHighLevel(this.ParamRsLevel.Value);
    var newDuration = Math.floor(Common.getDurationFromLengthRs(len, rs));

    if (this.ParamWithMinDuration.Value &&
        newDuration < VSSCore.MinimumDuration)
    {
        newDuration = VSSCore.MinimumDuration;
    }

    CurrentSub.Stop = CurrentSub.Start + newDuration;
  }
};
