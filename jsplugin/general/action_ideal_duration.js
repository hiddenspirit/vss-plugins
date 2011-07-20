/*
  Change the stop time of the selected subtitle(s) to match the ideal reading speed.
  The new duration will be at least VSSCore.MinimumDuration.

  14 Nov 2008   thyresias at gmail dot com
*/

JSAction_SetIdealDuration = {
  onExecute: function() {
    for (var sub = VSSCore.GetFirstSelected(); sub; sub = VSSCore.GetNextSelected(sub)) {
      var newStop = sub.Start + idealDuration(sub).exact_ms;
      if (newStop - sub.Start < VSSCore.MinimumDuration)
        newStop = sub.Start + VSSCore.MinimumDuration;
      sub.Stop = newStop;
    }
  }
};

VSSCore.RegisterJavascriptAction('JSAction_SetIdealDuration', 'Make Duration Ideal', 'Ctrl+U');

