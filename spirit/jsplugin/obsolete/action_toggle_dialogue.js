// Action Dialog plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
//

LoadScript("../common/common.js");

// ---------------------------------------------------------------------------

JSAction_ToggleDialogue = {
  onExecute : function() {
    for (sub = VSSCore.GetFirstSelected(); sub;
        sub = VSSCore.GetNextSelected(sub))
    {
        if (Common.isDialog(sub.StrippedText)) {
            sub.Text = sub.Text.replace(/^(\{\\pos\(.*?\})?[\-—]\s*/mg, "$1");
        } else if (Common.getLines(sub.Text).length > 1) {
            sub.Text = sub.Text.replace(/(^|\n)(\{\\pos\(.*?\})?/g, "$1$2- ")
        }
    }
  }
};

VSSCore.RegisterJavascriptAction("JSAction_ToggleDialogue", "Toggle dialogue", "Shift+Ctrl+D");
