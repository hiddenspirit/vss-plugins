// Action Extend plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
//

if (VSSCore.GetAudioCursorPosition) {
    LoadScript("../common/common.js");

    JSAction_MoveToAudioCursor = {
      onExecute : function() {
        var sub = VSSCore.GetFirstSelected();
        if (sub) {
            var cursor_pos = VSSCore.GetAudioCursorPosition();
            var delay = cursor_pos - sub.Start;
            if (delay) {
                sub.start += delay;
                sub.stop += delay;
            }
        }
      }
    };

    JSAction_MoveNextToAudioCursor = {
      onExecute : function() {
        var sub = VSSCore.GetFirstSelected();
        if (sub) {
            var cursor_pos = VSSCore.GetAudioCursorPosition();
            var delay = cursor_pos - sub.Start;
            if (delay) {
                for (; sub; sub = VSSCore.GetNext(sub)) {
                    sub.start += delay;
                    sub.stop += delay;
                }
            }
        }
      }
    };

    // VSSCore.RegisterJavascriptAction(
        // "JSAction_MoveToAudioCursor",
        // "Move current subtitle to audio cursor",
        // "Shift+Ctrl+T");
    VSSCore.RegisterJavascriptAction(
        "JSAction_MoveNextToAudioCursor",
        "Move current and next subtitles to audio cursor",
        "Shift+Ctrl+Alt+T");
}
