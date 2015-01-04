// Overlapping & minimum blank
// (christophe.paris <at> free.fr)
// ParamMode by Nathbot

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'Overlapping & minimum blank',
  Description : 'An error is detected when the subtitle overlap on next subtitle, or when the minimum blank (see global subtitle preferences) is not respected.',
  Color : 0xFF3737,
  Message : 'Overlap on next subtitle',

  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----
  ParamFixableOverlap : { Value : 100, Unit : 'ms', Description : 'The overlap must be inferior to this to be fixed automatically.'},
  ParamMode : { Value : 2, Unit : '(1/2/3)', Description : 'Mode 1: Split the overlap zone in two.\nMode 2: Change the current subtitle stop time.\nMode 3: Change the next subtitle start time.'},
  ParamDetection : { Value : "all", Unit : '(all/overlaps/blanks)', Description : 'Detection 1: detects overlaps and minimum blanks.\n2: detects only overlaps.\n3: detects only minimum blanks.'},

  // ----- HasError method called for each subtitle during the error checking -----
  // If there is an error on CurrentSub return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    if (NextSub === null) {
      return '';
    }
    var OverlapInMs = NextSub.Start - CurrentSub.Stop;

    switch(this.ParamDetection.Value){
        case "overlaps": // only overlaps
            if (OverlapInMs >= 0) {
                return '';
            } else {
                return (-OverlapInMs) + 'ms overlap';
            }
        break;
        case "blanks":
            if (OverlapInMs >= VSSCore.MinimumBlank) {
                return '';
            } else if(OverlapInMs >= 0) {
                return 'blank is only ' + OverlapInMs + 'ms';
            }
        break;
        default: //normal mode
            if ((OverlapInMs >= 0) && (OverlapInMs >= VSSCore.MinimumBlank)) {
                return '';
            }
            if (OverlapInMs < 0) {
                return (-OverlapInMs) + 'ms overlap';
            }
            return 'blank is only ' + OverlapInMs + 'ms';
        break;
    }
    return '';
  },

  FixError : function(CurrentSub, PreviousSub, NextSub) {
    if (NextSub === null) {
      return '';
    }

    var OverlapInMs = NextSub.Start - CurrentSub.Stop;

    if (((OverlapInMs > 0) && (OverlapInMs > VSSCore.MinimumBlank)) ||
        (-OverlapInMs > this.ParamFixableOverlap.Value)) {
      return '';
    }

    switch(this.ParamMode.Value){
        case 1:
            // Fix the overlap by dividing it by 2
            var MiddlePoint = (CurrentSub.Stop + (OverlapInMs / 2));
            var HalfOffset = (VSSCore.MinimumBlank / 2);
            CurrentSub.Stop = MiddlePoint - HalfOffset;
            NextSub.Start = CurrentSub.Stop + VSSCore.MinimumBlank;
            break;

        case 2:
            // Fix the overlap by changing the stop time of the current subtitle
            var Required = VSSCore.MinimumBlank - OverlapInMs;
            CurrentSub.Stop -= Required;
            break;

        case 3:
            // Fix the overlap by changing the start time of the next subtitle
            var Required = VSSCore.MinimumBlank - OverlapInMs;
            NextSub.Start += Required;
            break;

        default:
            ScriptLog('ParamMode = ' + this.ParamMode.Value + ' is not supported');
            break;
    }

    // Special case when OverlapInMs == 0
    // if (NextSub.Start == CurrentSub.Stop) {
            // NextSub.Start += 1;
    // }
  }
};
