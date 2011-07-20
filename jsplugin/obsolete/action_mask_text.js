// Action Mask Text plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
//

LoadScript("../common/common.js");

// ---------------------------------------------------------------------------

JSAction_MaskText = {
  onExecute : function() {
    if (VSSCore.GetTextSelectionLength) {
        var selection_len = VSSCore.GetTextSelectionLength();
        
        if (selection_len) {
            var selection_start = VSSCore.GetTextSelectionStart();
            var sub = sub = VSSCore.GetFirstSelected();
            var text = sub.Text;
            sub.Text = text.slice(0, selection_start) +
                "{\\*" + text.substr(selection_start, selection_len) + "}" +
                text.slice(selection_start + selection_len);
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
            sub.text = sub.text.replace(/^(\{\\pos\(\d+,\d+\)\})?\{\\[\$\*]?(.*?)\}/, "$1$2");
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
