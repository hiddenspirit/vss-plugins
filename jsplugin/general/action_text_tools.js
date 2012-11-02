LoadScript("../common/common.js");
LoadScript("../common/difflib.js");

// ---------------------------------------------------------------------------

// Action Mask Text plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
//

JSAction_MaskText = {
  onExecute : function() {
    if (VSSCore.GetTextSelectionLength) {
        var selection_len = VSSCore.GetTextSelectionLength();
        
        if (selection_len) {
            var selection_start = VSSCore.GetTextSelectionStart();
            var sub = sub = VSSCore.GetFirstSelected();
            var text = sub.Text;
            var selectedText = text.substr(selection_start, selection_len);
            if (/^\{\\\*/.test(text.slice(selection_start))) {
                var endPos = text.indexOf("}", selection_start);
                selectedText = text.slice(selection_start + 3, endPos);
                sub.Text = text.slice(0, selection_start) +
                    selectedText +
                    text.slice(endPos + 1);
            } else {
                sub.Text = text.slice(0, selection_start) +
                    "{\\*" + selectedText + "}" +
                    text.slice(selection_start + selection_len);
            }
            return;
        }
    }

    for (sub = VSSCore.GetFirstSelected(); sub;
        sub = VSSCore.GetNextSelected(sub))
    {
        var other = sub.text.indexOf("{\\$");
        if (other >= 0) {
            sub.text = sub.text.replace(/\{\\[\$\*]/, "{\\*");
            continue;
        }

        var c = sub.text.indexOf("{\\*");
        if (c >= 0) {
            sub.text = sub.text.replace(/^(\{\\pos\(\d+,\d+\)\})?\{\\[\$\*]?([^]*?)\}/, "$1$2");
            continue;
        }

        var p = sub.text.indexOf("}");
        if (p >= 0) {
            sub.text = sub.text.substr(0, p+1) + "{\\*" + sub.text.substr(p+1) + "}";
        } else {
            sub.text = "{\\*" + sub.text.substr(p+1) + "}";
        }
    }
  }
};

VSSCore.RegisterJavascriptAction("JSAction_MaskText", "Mask text", "Shift+Ctrl+M");

// ---------------------------------------------------------------------------

// Action Toggle Case plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
//

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

// ---------------------------------------------------------------------------

// Action Toggle Dialogue plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
//

JSAction_ToggleDialogue = {
  onExecute : function() {
    for (sub = VSSCore.GetFirstSelected(); sub;
        sub = VSSCore.GetNextSelected(sub))
    {
        if (Common.isDialog(sub.StrippedText)) {
            sub.Text = sub.Text.replace(/^(\{\\pos\(.*?\})?[\-–—]\s*/mg, "$1");
        } else if (Common.getLines(sub.Text).length > 1) {
            sub.Text = sub.Text.replace(/(^|\n)(\{\\pos\(.*?\})?/g, "$1$2- ")
        }
    }
  }
};

VSSCore.RegisterJavascriptAction("JSAction_ToggleDialogue", "Toggle dialogue", "Shift+Ctrl+D");
