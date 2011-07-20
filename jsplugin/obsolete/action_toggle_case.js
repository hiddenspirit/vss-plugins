// Action Split Text plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
//

LoadScript("../common/difflib.js");


JSAction_ToggleCase = {
    onExecute : function() {
        this.iterTexts(function(text, strippedText) {
            var sel_len;
            if (VSSCore.GetTextSelectionLength &&
                0 != (sel_len = VSSCore.GetTextSelectionLength())) {
                var sel_start = VSSCore.GetTextSelectionStart();
            } else {
                var sel_start = 0;
                sel_len = text.length;
            }
            var upperStrippedText = Common.getStrippedText(
                text.slice(0, sel_start) +
                text.substr(sel_start, sel_len).toUpperCase() +
                text.slice(sel_start + sel_len));
            if (strippedText == upperStrippedText) {
                var lowerStrippedText = Common.getStrippedText(
                    text.slice(0, sel_start) +
                    text.substr(sel_start, sel_len).toLowerCase() +
                    text.slice(sel_start + sel_len));
                var newStrippedText = lowerStrippedText;
            } else {
                var newStrippedText = upperStrippedText;
            }

            return difflib.updateText(text, strippedText, newStrippedText);
        });
    },

    iterTexts : function(newTextFunc) {
        for (var sub = VSSCore.GetFirstSelected(); sub;
             sub = VSSCore.GetNextSelected(sub)) {
            var newText = newTextFunc(sub.Text, sub.StrippedText);
            if (newText != sub.Text) {
                sub.Text = newText;
            }
        }
    }
};



VSSCore.RegisterJavascriptAction("JSAction_ToggleCase", "Toggle case", "Shift+Ctrl+U");
