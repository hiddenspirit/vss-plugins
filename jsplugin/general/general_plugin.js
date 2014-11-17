// status bar display
// thyresias <at> gmail.com (www.calorifix.net)
// 20-Jan-2007  first version
// Added "Rating", "CPS", "Duration", "Line", "Pixels", and "Blank" columns,
// OnRangeStartDblClick and OnRangeStopDblClick events (Spirit)

LoadScript("../common/common.js");

// ---------------------------------------------------------------------------

VSSPlugin = {
  pixelFont : undefined, // default font as defined in Common

  // Called on subtitle modifications (time or text)
  OnSubtitleModification : function(CurrentSub, PreviousSub, NextSub) {
    SetStatusBarText(statusBarText(CurrentSub));
  },

  // Called when the selected subtitle change
  OnSelectedSubtitle : function(CurrentSub, PreviousSub, NextSub) {
    SetStatusBarText(statusBarText(CurrentSub));
  },

  // Called when the selection is doubleclicked at start on the audio display
  OnRangeStartDblClick : function(CurrentSub, PreviousSub, NextSub) {
    var frameDuration = Common.getFrameDuration();
    var start = Common.getNonOverlappedStart(
        Math.round(CurrentSub.Start - 2 * frameDuration), PreviousSub,
        SceneChange.Visible ? undefined : -1);

    if (start != CurrentSub.Start && start < CurrentSub.Stop) {
        CurrentSub.Start = start;
    }
  },

  // Called when the selection is doubleclicked at stop on the audio display
  OnRangeStopDblClick : function(CurrentSub, PreviousSub, NextSub) {
    var len = CurrentSub.StrippedText.length;
    var duration = CurrentSub.Stop - CurrentSub.Start;
    var targetDuration = Common.checkMinMaxDuration(
        Common.getTargetDuration(len)
    );

    if (SceneChange.Visible) {
        if (targetDuration < duration) {
            var stop = Common.getNonOverlappedStop(CurrentSub.Start +
                targetDuration, NextSub);
        } else {
            var stop = Common.getNonOverlappedStop(CurrentSub.Start +
                targetDuration, NextSub, SceneChange.GetNext(CurrentSub.Stop));
            // In case of scene change filter zone.
            stop = Common.getNonOverlappedStop(stop);
        }
    } else {
        var stop = Common.getNonOverlappedStop(CurrentSub.Start +
            targetDuration, NextSub, -1);
    }

    if (stop > CurrentSub.Start) {
        CurrentSub.Stop = stop;
    }
  },

  // Called after "split at cursor"
  OnSplitSubtitle : function(CurrentSub, PreviousSub, NextSub) {
    // Remove dialog markers
    var text = CurrentSub.Text;
    var strippedText = CurrentSub.StrippedText;
    var newText = difflib.updateText(text, strippedText,
        strippedText.replace(/^[\-–—]\s/mg, ""));

    var lines = Common.getLines(newText);

    if (lines.length < 2) {
        var newText = Common.getSplittedText2(text);
        var lines = Common.getLines(newText);
    }

    if (lines.length > 1) {
        // Multi-line subtitle
        var middle = Math.floor(lines.length / 2);
        var text1 = lines.slice(0, middle).join(Common.NEWLINE);
        var text2 = lines.slice(middle).join(Common.NEWLINE);
    } else {
        // Single-line subtitle
        var text1 = lines[0];
        var text2 = "";
    }

    // Various fixes
    var html_tag_re = /^(\{.*?\})*<(\w)>[^]*<\/\2>$/;
    if (html_tag_re.test(newText)) {
        var tag = newText.match(html_tag_re)[2];
        text1 = text1 + "</" + tag + ">";
        text2 = "<" + tag + ">" + text2;
    }
    var ass_tag_re = /^(\{.*?\})*\{\\(\w)1\}[^]*\{\\\2[0]\}$/;
    if (ass_tag_re.test(newText)) {
        var tag = newText.match(ass_tag_re)[2];
        text1 = text1 + "{\\" + tag + "0}";
        text2 = "{\\" + tag + "1}" + text2;
    }
    var ass_pos_re = /^\{\\pos\b.*?\}/;
    if (ass_pos_re.test(newText)) {
        var tag = newText.match(ass_pos_re)[0];
        text2 = tag + text2;
    }

    CurrentSub.Text = text1;
    NextSub.Text = text2;

    if (SceneChange.Visible) {
        var pos = VSSCore.GetAudioCursorPosition();

        if (SceneChange.Contains(
            pos - SceneChange.StopOffset, pos + SceneChange.StartOffset)) {
            var prevSC = SceneChange.GetPrevious(pos);
            var nextSC = SceneChange.GetNext(pos);
            var sc = (prevSC < 0 || pos - prevSC > nextSC - pos ?
                nextSC : prevSC);

            CurrentSub.Stop = sc - SceneChange.StartOffset;
            NextSub.Start = sc + SceneChange.StopOffset;
        }
    }
  },

  // COLUMNS -----------------------------------------------------------------

  // VSS core columns index
  // VSSCore.INDEX_COL_IDX : Index of the subtitle index column
  // VSSCore.START_COL_IDX : Index of the start time column
  // VSSCore.STOP_COL_IDX  : Index of the stop time colum
  // VSSCore.STYLE_COL_IDX : Index of the style column (SSA/ASS only)
  // VSSCore.TEXT_COL_IDX  : Index of the text column
  //
  // VSSCore.LAST_CORE_COL_IDX : Index of the last column of VSS core
  //

  // Declare extra column index here
  RS_COL_IDX :       VSSCore.LAST_CORE_COL_IDX + 1, // Reading speed
  RATING_COL_IDX :   VSSCore.LAST_CORE_COL_IDX + 2, // Reading speed rating
  CPS_COL_IDX :      VSSCore.LAST_CORE_COL_IDX + 3, // Characters per second
  DURATION_COL_IDX : VSSCore.LAST_CORE_COL_IDX + 4, // Duration
  LINE_COL_IDX :     VSSCore.LAST_CORE_COL_IDX + 5, // Maximum line length
  PIXELS_COL_IDX :   VSSCore.LAST_CORE_COL_IDX + 6, // Maximum pixel width
  BLANK_COL_IDX :    VSSCore.LAST_CORE_COL_IDX + 7, // Blank
  BALANCE_COL_IDX :  VSSCore.LAST_CORE_COL_IDX + 8, // Line balance

  // Get the number of extra-columns (called only at VSS startup)
  GetExtraColumnsCount : function() {
    return 8;
  },

  // Get the title of each extra-column (called only at VSS startup)
  GetColumnTitle : function(Index) {
    switch (Index) {
      case this.RS_COL_IDX:       return "RS";
      case this.RATING_COL_IDX:   return "Rating";
      case this.CPS_COL_IDX:      return "CPS";
      case this.DURATION_COL_IDX: return "Duration";
      case this.LINE_COL_IDX:     return "Line";
      case this.PIXELS_COL_IDX:   return "Pixels";
      case this.BLANK_COL_IDX:    return "Blank";
      case this.BALANCE_COL_IDX:  return "Balance";
      default: return "";
    }
  },

  // Get the size of each extra-column (called only at VSS startup)
  GetColumnSize : function(Index) {
    switch (Index) {
      case this.RS_COL_IDX:       return 37;
      case this.RATING_COL_IDX:   return 45;
      case this.CPS_COL_IDX:      return 37;
      case this.DURATION_COL_IDX: return 52;
      case this.LINE_COL_IDX:     return 32;
      case this.PIXELS_COL_IDX:   return 40;
      case this.BLANK_COL_IDX:    return 40;
      case this.BALANCE_COL_IDX:  return 52;
      default: return "";
    }
  },

  // Check if a column background can be colorized (called only at VSS startup)
  IsColumnBGColorized : function(Index) {
    switch (Index) {
      case this.RS_COL_IDX:       return true;
      case this.RATING_COL_IDX:   return true;
      case this.CPS_COL_IDX:      return true;
      case this.DURATION_COL_IDX: return true;
      case this.LINE_COL_IDX:     return true;
      case this.PIXELS_COL_IDX:   return true;
      case this.BLANK_COL_IDX:    return true;
      case this.BALANCE_COL_IDX:  return true;
      default: return false;
    }
  },

  // Check if a column has custom text (called only at VSS startup)
  HasColumnCustomText : function(Index) {
    switch (Index) {
      case this.RS_COL_IDX:       return true;
      case this.RATING_COL_IDX:   return true;
      case this.CPS_COL_IDX:      return true;
      case this.DURATION_COL_IDX: return true;
      case this.LINE_COL_IDX:     return true;
      case this.PIXELS_COL_IDX:   return true;
      case this.BLANK_COL_IDX:    return true;
      case this.BALANCE_COL_IDX:  return true;
      default: return false;
    }
  },

  // Get the column background color (called on each cell repaint)
  GetColumnBGColor : function(Index, CurrentSub, PreviousSub, NextSub) {
    switch (Index) {
      case this.RS_COL_IDX:
      case this.RATING_COL_IDX:
        var index = Common.getReadingSpeedIndex(this.cache);
        return Common.READING_SPEED_DEF[index].color;

      case this.CPS_COL_IDX:
        if (this.cache <   4) return 0x9999ff;  // TS color
        if (this.cache <   7) return 0x99ccff;  // SA color
        if (this.cache <  10) return 0x99ffff;  // ABS color
        if (this.cache <  13) return 0x99ffcc;  // G color
        if (this.cache <= 16) return 0x99ff99;  // P color
        if (this.cache <= 19) return 0xccff99;  // G color
        if (this.cache <= 22) return 0xffff99;  // ABF color
        if (this.cache <= 25) return 0xffcc99;  // FA color
        return 0xff9999;                        // TF color

      case this.DURATION_COL_IDX:
        if (this.cache <   500) return 0xff9999;  // TF color
        if (this.cache <   750) return 0xffcc99;  // FA color
        if (this.cache <  1000) return 0xffff99;  // ABF color
        if (this.cache <  2000) return 0xccff99;  // G color
        if (this.cache <= 3000) return 0x99ff99;  // P color
        if (this.cache <= 4000) return 0x99ffcc;  // G color
        if (this.cache <= 5000) return 0x99ffff;  // ABS color
        if (this.cache <= 6000) return 0x99ccff;  // SA color
        return 0x9999ff;                          // TS color

      case this.LINE_COL_IDX:
        if (this.cache <=  2) return 0x9999ff;  // TS color
        if (this.cache <=  5) return 0x99ccff;  // SA color
        if (this.cache <= 10) return 0x99ffff;  // ABS color
        if (this.cache <= 20) return 0x99ffcc;  // G color
        if (this.cache <= 30) return 0x99ff99;  // P color
        if (this.cache <= 35) return 0xccff99;  // G color
        if (this.cache <= 37) return 0xffff99;  // ABF color
        if (this.cache <= 40) return 0xffcc99;  // FA color
        return 0xff9999;                        // TF color

      case this.PIXELS_COL_IDX:
        if (this.cache <=  25) return 0x9999ff;  // TS color
        if (this.cache <=  61) return 0x99ccff;  // SA color
        if (this.cache <= 123) return 0x99ffff;  // ABS color
        if (this.cache <= 245) return 0x99ffcc;  // G color
        if (this.cache <= 368) return 0x99ff99;  // P color
        if (this.cache <= 429) return 0xccff99;  // G color
        if (this.cache <= 454) return 0xffff99;  // ABF color
        if (this.cache <= 500) return 0xffcc99;  // FA color
        return 0xff9999;                         // TF color

      case this.BLANK_COL_IDX:
        if (undefined != this.blankToSceneChangeStart) {
            return 0x9999ff;        // TS color
        } else if (undefined !== this.blankToSceneChangeStop) {
            return Math.abs(this.blankToSceneChangeStop - SceneChange.StartOffset) <= 1 ?
                0xccff99 :          // G color
                this.blankToSceneChangeStop < SceneChange.StartOffset ?
                0xffcc99 :          // FA color
                this.blankToSceneChangeStop < 250 ?
                    0xffff99 :      // ABF color
                    0xffffff;       // White
        } else if (undefined !== this.blank) {
            return Math.abs(this.blank - VSSCore.MinimumBlank) <= 1 ?
                    0x99ff99 :      // P color
                this.blank < VSSCore.MinimumBlank ?
                    0xff9999 :      // TF color
                    this.blank < 250 ?
                        0xffff99 :  // ABF color
                        0xffffff;   // White
        }

        return 0xffffff;    // White

      case this.BALANCE_COL_IDX:
        if (this.cache >= 0.750) return 0x99ff99;  // P color
        if (this.cache >= 0.500) return 0xccff99;  // G color
        if (this.cache >= 0.250) return 0xffff99;  // ABF color
        if (this.cache >= 0.125) return 0xffcc99;  // FA color
        return 0xff9999;                           // TF color

      default:
        return 0xffffff;    // White
    }
  },

  // Get the text of the extra-column (called on each cell repaint)
  GetColumnText : function(Index, CurrentSub, PreviousSub, NextSub) {
    switch (Index) {
      case this.RS_COL_IDX:
        this.cache = Common.getReadingSpeed(CurrentSub);
        var rounded = Common.decimal1Round(this.cache);
        return (rounded < 10 ? "  " : "") +
            (rounded == this.cache ? rounded : rounded.toFixed(1));

      case this.RATING_COL_IDX:
        this.cache = Common.getReadingSpeed(CurrentSub);
        return Common.getReadingSpeedRating(this.cache);

      case this.CPS_COL_IDX:
        this.cache = Common.getCharactersPerSecond(CurrentSub);
        var rounded = Common.decimal1Round(this.cache);
        return (rounded < 10 ? "  " : "") +
            (rounded == this.cache ? rounded : rounded.toFixed(1));

      case this.DURATION_COL_IDX:
        this.cache = CurrentSub.Stop - CurrentSub.Start;
        return (this.cache / 1000).toFixed(3);

      case this.LINE_COL_IDX:
        var lines = Common.getLines(CurrentSub.StrippedText);
        var numLines = lines.length;
        this.cache = 0;

        for (var i = 0; i < numLines; ++i) {
            var len = lines[i].length;

            if (len > this.cache) {
                this.cache = len;
            }
        }

        return this.cache;

      case this.PIXELS_COL_IDX:
        var lines = Common.getLines(CurrentSub.StrippedText);
        var numLines = lines.length;
        this.cache = 0;

        for (var i = 0; i < numLines; ++i) {
            var len = Common.getPixelWidth(lines[i], this.pixelFont);

            if (len > this.cache) {
                this.cache = len;
            }
        }

        return this.cache;

      case this.BLANK_COL_IDX:
        this.blankToSceneChangeStart = undefined;
        this.blankToSceneChangeStop = undefined;
        this.blank = NextSub ? NextSub.Start - CurrentSub.Stop : undefined;

        if (SceneChange.Visible && this.blank >= VSSCore.MinimumBlank) {
            // Around start
            var previousSceneChange = SceneChange.GetPrevious(CurrentSub.Start);

            if (previousSceneChange >= 0) {
                var blankToSceneChangeStart = CurrentSub.Start -
                    previousSceneChange;

                if (blankToSceneChangeStart < SceneChange.StopOffset) {
                    return (this.blankToSceneChangeStart =
                        blankToSceneChangeStart)/*  + " scStart" */;
                }
            }

            var nextSceneChange = SceneChange.GetNext(CurrentSub.Start + 1);

            if (nextSceneChange >= 0 &&
                nextSceneChange - CurrentSub.Start <= SceneChange.FilterOffset)
            {
                return (this.blankToSceneChangeStart = CurrentSub.Start -
                    nextSceneChange)/*  + " filterStart" */;
            }

            // Around stop
            var previousSceneChange =
                SceneChange.GetPrevious(CurrentSub.Stop - 1);

            if (previousSceneChange >= 0 &&
                CurrentSub.Stop - previousSceneChange <=
                SceneChange.FilterOffset)
            {
                return (this.blankToSceneChangeStop = previousSceneChange -
                    CurrentSub.Stop)/*  + " filterStop" */;
            }

            var nextSceneChange = SceneChange.GetNext(CurrentSub.Stop);
        } else {
            var nextSceneChange = -1;
        }

        if (nextSceneChange < 0) {
            if (this.blank) {
                return this.blank;
            }
        } else {
            if (this.blank && NextSub.Start < nextSceneChange) {
                return this.blank;
            } else {
                return (this.blankToSceneChangeStop = nextSceneChange -
                    CurrentSub.Stop)/*  + " scStop" */;
            }
        }

        return "";

      case this.BALANCE_COL_IDX:
        var lines = Common.getLines(CurrentSub.StrippedText);
        var numLines = lines.length;
        var minLineLen = Infinity;
        var maxLineLen = 0;

        for (var i = 0; i < numLines; ++i) {
            var lineLen = lines[i].length;

            if (lineLen > maxLineLen) {
                maxLineLen = lineLen;
            }
            if (lineLen < minLineLen) {
                minLineLen = lineLen;
            }
        }

        this.cache = minLineLen / maxLineLen || 1;
        var pct = Math.round(this.cache * 100);
        var numBlanks = 2 - Math.floor(Math.log(pct) / Math.log(10));
        var blanks = "";
        for (var i = 0; i < numBlanks; ++i) {
            blanks += "  ";
        }
        return blanks + pct + "%";

      default: return "";
    }
  }
};

// ---------------------------------------------------------------------------
// ASCII bar stuff
// ---------------------------------------------------------------------------

function initBar(min, max) {
    var bar = "·····················································";
    var length = max - min + 1;
    while (bar.length < length)
        bar += bar;
    return bar.substr(0, length);
}

function getRsBar(value, min, max, templateBar, symbol) {
    // ~{|}[\]^_`:<=>-+!#%&‘’¡¤§«¬­¯°±´º»
    // below min: *  ·························
    if (value < min)
        return "«" + templateBar.substr(1);
    // above max: ·························  *
    else if (value >= max)
        return templateBar.substr(1) + "»";
    // in the range
    else {
        var iVal = Math.round(value) - min;
        return templateBar.substr(0, iVal) + symbol +
            templateBar.substr(iVal + 1);
    }
}

function getCpsBar(value, min, max, templateBar, symbol) {
    // ~{|}[\]^_`:<=>-+!#%&‘’¡¤§«¬­¯°±´º»
    // below min: *  ·························
    if (value < min)
        return "«" + templateBar.substr(1);
    // above max: ·························  *
    else if (value > max)
        return templateBar.substr(1) + "»";
    // in the range
    else {
        var iVal = Math.round(value) - min;
        return templateBar.substr(0, iVal) + symbol +
            templateBar.substr(iVal + 1);
    }
}

// ---------------------------------------------------------------------------

function statusBarText(subtitle) {

    // current length, duration
    var len = subtitle.StrippedText.length;
    var duration = subtitle.Stop - subtitle.Start;
    var durationSecondsText = (duration / 1000).toFixed(3);

    // reading speed
    var rs = Common.getRsFromLengthDuration(len, duration);
    var roundedRs = Common.decimal1Round(rs);

    if (roundedRs < 100) {
        if (rs == parseInt(rs)) {
            var rsText = rs + "   ";
            if (rsText.length < 5) rsText = "  " + rsText;
        } else {
            var rsText = rs.toFixed(1);
            if (rsText.length < 4) rsText = "  " + rsText;
        }
    } else if (roundedRs < 1000) {
        var rsText = rs.toFixed(0) + " ";
    } else {
        var rsText = "###";
    }

    // characters per second
    var cps = Common.getCpsFromLengthDuration(len, duration);
    var roundedCps = Common.decimal1Round(cps);

    if (roundedCps < 100) {
        if (cps == parseInt(cps)) {
            var cpsText = cps + "   ";
            if (cpsText.length < 5) cpsText = "  " + cpsText;
        } else {
            var cpsText = cps.toFixed(1);
            if (cpsText.length < 4) cpsText = "  " + cpsText;
        }
    } else if (roundedCps < 1000) {
        var cpsText = cps.toFixed(0) + " ";
    } else {
        var cpsText = "###";
    }

    // rating
    var rating = Common.getReadingSpeedRating(rs);

    // compute Lavie duration
    var ideal = Common.getIdealDuration(len);
    var idealText = (ideal / 1000).toFixed(3);

    // get display bars
    var rsBar = getRsBar(rs, Common.STRICT_MIN_RS, Common.STRICT_MAX_RS,
        templateBarRS, duration < ideal ? ">" : duration > ideal ? "<" : "=");
    var cpsBar = getCpsBar(cps, Common.STRICT_MIN_CPS, Common.STRICT_MAX_CPS,
        templateBarDS, cps < VSSCore.CpsTarget ? "<" :
        cps > VSSCore.CpsTarget ? ">" : "=");

    return "RS: " + rsText + " " + rsBar +
        "  |  CPS: " + cpsText + " " + cpsBar +
        "  |  Duration: " + durationSecondsText + " " +
        (duration < ideal ? "<" : duration > ideal ? ">" : "=") +
        " Ideal: " + idealText + "  |  " + rating;
}

// initialize template bars
var templateBarRS = initBar(Common.STRICT_MIN_RS, Common.STRICT_MAX_RS);
var templateBarDS = initBar(Common.STRICT_MIN_CPS, Common.STRICT_MAX_CPS);

// ---------------------------------------------------------------------------
// Load javascript actions
// ---------------------------------------------------------------------------

LoadScript("action_*.js");

// ---------------------------------------------------------------------------
