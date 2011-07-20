/*
  General plugin:
  - status bar display
  - definition of additional columns
  - load javascript custom actions
  this file MUST be saved as UTF8 with BOM

  20-Jan-2007   thyresias at gmail dot com (www.calorifix.net)
                first version
  2007-2008     Christophe Paris / Nathbot (TBC)
                updates for new VSS features
  14-Nov-2008   thyresias
                refactoring, new Rating column, color based on actual reading speed
*/

LoadScript("tools.js");

// ---------------------------------------------------------------------------
//  status bar text
// ---------------------------------------------------------------------------

// returns a bar of (max - min + 1) dots,
// so the first dot is min, the last dot is max
function initBar(min, max) {
  var bar = "·····················································";
  var length = max - min + 1;
  while (bar.length < length)
    bar = bar + bar;
  return bar.substr(0, length);
}

// template bar for reading speeds
var TEMPLATE_BAR = initBar(RS_MIN, RS_MAX);

// returns a bar displaying "value" between min and max
// for a 10-dot bar representing values from 1 to 10,
// "value" will be rounded, and then marked on the bar:
// value < 1   =>  «··········
// value > 10  =>   ··········»
// value = 3   =>   ··¦·······
function getBar(value, min, max, templateBar) {
  // ~{|}[\]^_`:<=>-+!#%&‘’¡¤§«¬­¯°±´º»
  var iVal = Math.round(value);
  // below min: «·························
  if (iVal < min)
    return "«" + templateBar;
  // above max: ·························»
  else if (iVal > max)
    return templateBar + "»";
  // in the range
  else {
    iVal = iVal - min;
    return templateBar.substr(0, iVal-1) + "¦" + templateBar.substr(iVal+1);
  }
}

// returns the text for the status bar
function statusBarText(Sub) {

  // values displayed
  var rs = readingSpeed(Sub).rounded_per_s;
  var rating = readingSpeedRating(Sub);
  var dur = duration(Sub).rounded_s;
  var ideal = idealDuration(Sub).rounded_s;

  // bar displayed
  var barRS = getBar(rs, RS_MIN, RS_MAX, TEMPLATE_BAR);

  // symbol versus ideal duration
  var sym;
  if (dur < ideal)      sym = "<";
  else if (dur > ideal) sym = ">";
  else                  sym = "=";

  return "Reading Speed: " + rs + " " + barRS +
    "  |  Duration: " + dur + " " + sym + " ideal=" + ideal +
    "  |  " + rating.text;

}

// ---------------------------------------------------------------------------
//  general plugin
// ---------------------------------------------------------------------------

VSSPlugin = {

  // Called on subtitle modifications (time or text)
  OnSubtitleModification: function(CurrentSub, PreviousSub, NextSub) {
    SetStatusBarText(statusBarText(CurrentSub));
  },

  // Called when the selected subtitle change
  OnSelectedSubtitle: function(CurrentSub, PreviousSub, NextSub) {
    SetStatusBarText(statusBarText(CurrentSub));
  },

  // Called when the WAV subtitle start is double-clicked
  // => try to fix delay to previous, if needed
  OnRangeStartDblClick : function(CurrentSub, PreviousSub, NextSub) {

    if (PreviousSub == null) return;
    var delayToPrevious = CurrentSub.Start - PreviousSub.Stop;

    // nothing to do if everything is OK
    if (delayToPrevious >= VSSCore.MinimumBlank) return;

    // can't fix if there is less room than twice the min duration plus the minimum delay
    if (CurrentSub.Stop - PreviousSub.Start < 2 * VSSCore.MinimumDuration + VSSCore.MinimumBlank) return;

    // if some jerk set the VSSCore parameters to stupid values, check for reasonable ones
    if (NextSub.Stop - CurrentSub.Start < 1002) return;

    var newStart = PreviousSub.Stop + VSSCore.MinimumBlank;
    if (newStart < CurrentSub.Stop) CurrentSub.Start = newStart;

  },

  // Called when the WAV subtitle end is double-clicked
  // => try to set the ideal duration, preserving the delay to the next subtitle
  OnRangeStopDblClick : function(CurrentSub, PreviousSub, NextSub) {

    // ideal stop
    var idealStop = CurrentSub.Start + idealDuration(CurrentSub).exact_ms;

    // if shortening, everything is OK
    if (idealStop <= CurrentSub.Stop) {
      CurrentSub.Stop = idealStop;
      return;
    }

    // if no next subtitle, we can't check versus video end...
    if (NextSub == null) {
      CurrentSub.Stop = idealStop;
      return;
    }

    // check delay to next
    var delayToNext = NextSub.Start - idealStop;
    if (delayToNext >= VSSCore.MinimumBlank) {
      CurrentSub.Stop = idealStop;
      return;
    }

    // we can't set the ideal duration, because the subtitle would be too close to the next one
    var newStop = NextSub.Start - VSSCore.MinimumBlank;
    if (newStop > CurrentSub.Stop) {
      CurrentSub.Stop = newStop;
      return;
    }

    // we cannot preserve the delay to the next subtitle: at least avoid overlapping
    if (CurrentSub.Stop >= NextSub.Start) {
      CurrentSub.Stop = NextSub.Start - 1;
      return;
    }

    // we can't do anything

  },


  // COLUMNS -----------------------------------------------------------------

  // VSS core column indices:
  // VSSCore.INDEX_COL_IDX      subtitle number
  // VSSCore.START_COL_IDX      start time
  // VSSCore.STOP_COL_IDX       stop time
  // VSSCore.STYLE_COL_IDX      style (displayed for SSA/ASS only)
  // VSSCore.TEXT_COL_IDX       text
  // VSSCore.LAST_CORE_COL_IDX  index of the last core VSS column

  // Declare extra column index here
  RS_COL_IDX: VSSCore.LAST_CORE_COL_IDX + 1,     // Reading Speed
  RATING_COL_IDX: VSSCore.LAST_CORE_COL_IDX + 2, // RS rating

  // --- functions called only at VSS startup

  // number of extra-columns
  GetExtraColumnsCount: function() {
    return 2;
  },

  // title of each extra-column
  GetColumnTitle: function(Index) {
    switch(Index) {
      case this.RS_COL_IDX:     return 'RS';
      case this.RATING_COL_IDX: return 'Rating';
      default:                  return '';
    }
  },

  // size of each extra-column
  GetColumnSize: function(Index) {
    switch(Index) {
      case this.RS_COL_IDX:     return 40;
      case this.RATING_COL_IDX: return 50;
      default:                  return 0;
    }
  },

  // is the column background colorized?
  IsColumnBGColorized: function(Index) {
    switch(Index) {
      case this.RS_COL_IDX:     return true;
      case this.RATING_COL_IDX: return true;
      default:                  return false;
    }
  },

  // column has custom text?
  HasColumnCustomText: function(Index) {
    switch(Index) {
      case this.RS_COL_IDX:     return true;
      case this.RATING_COL_IDX: return true;
      default: return false;
    }
  },

  // --- functions called on each cell repaint

  // cell background color
  GetColumnBGColor: function(Index, CurrentSub, PreviousSub, NextSub) {
    switch(Index) {
      case this.RS_COL_IDX:     return readingSpeedColor(CurrentSub);
      case this.RATING_COL_IDX: return readingSpeedColor(CurrentSub);
      default:                  return 0xFFFFFF; // white
    }
  },

  // cell text
  GetColumnText: function(Index, CurrentSub, PreviousSub, NextSub) {
    switch(Index) {
      case this.RS_COL_IDX:
        var rs = "" + readingSpeed(CurrentSub).rounded_per_s;
        if (rs == "Infinity") rs = "Unreadable";
        return rs;
      case this.RATING_COL_IDX:
        return "" + readingSpeedRating(CurrentSub).symbol;
      default:
        return "";
    }
  }

};

// ---------------------------------------------------------------------------
//  Load javascript actions
// ---------------------------------------------------------------------------

LoadScript('action_*.js');
