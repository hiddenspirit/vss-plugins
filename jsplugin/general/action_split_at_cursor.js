// ---------------------------------------------------------------------------

if (VSSCore.GetTextSelectionStart) {
    JSAction_SplitAtCursor = {
      onExecute : function() {
        var selectionStart = VSSCore.GetTextSelectionStart();
        var selectedSub = VSSCore.GetFirstSelected();
        if (selectionStart && selectedSub.Text[selectionStart - 1] == " ") {
            --selectionStart;
        } else {
            while (selectionStart < selectedSub.Text.length &&
                   selectedSub.Text[selectionStart] != " ") {
                ++selectionStart;
            }
        }
        if (selectionStart < 1) {
            return;
        }
        if (selectedSub.Text.length - selectionStart < 1) {
            return;
        }
        var newText = selectedSub.Text; 
        newText = newText.substring(0, selectionStart).replace(/\s*\r\n\s*/mg, ' ')    
            + '\r\n'
            + newText.substring(selectionStart).replace(/\s*\r\n\s*/mg, ' ');
        newText = newText.replace(/^ +| +$/mg, "");
        selectedSub.Text = newText;
      }
    };

    VSSCore.RegisterJavascriptAction('JSAction_SplitAtCursor', 'Split text at cursor', 'Shift+Ctrl+C');
}

// ---------------------------------------------------------------------------