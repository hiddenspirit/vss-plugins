// Action Split Text plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
//

LoadScript("../common/common.js");


JSAction_SplitTextCommon = {
    maxPerLine : 36,
    strictMaxPerLine : 40,
    maxPixelsPerLine : 454,
    strictMaxPixelxPerLine : 454,

    iterTexts : function(newTextFunc) {
        for (var sub = VSSCore.GetFirstSelected(); sub;
             sub = VSSCore.GetNextSelected(sub)) {

            var newText = newTextFunc(sub.Text);

            if (newText != sub.Text) {
                sub.Text = newText;
            }
        }
    },

    moveSplit : function(text, n) {
        var lines = Common.getLines(text);

        if (lines.length <= 1 &&
            Common.getStrippedText(lines[0]).length <=
            JSAction_SplitTextCommon.maxPerLine) {
            return text;
        }

        var words = Common.getOneLineText(text).split(" ");
        var numWordsFirstLine = lines[0].split(" ").length;
        var splitPos = numWordsFirstLine + n;

        if (splitPos > 0 && splitPos < words.length) {
            var newLines = [
                words.slice(0, splitPos).join(" "),
                words.slice(splitPos).join(" ")
            ];

            var i = n < 0 ? 1 : 0;

            if (Common.getStrippedText(newLines[i]).length >
                JSAction_SplitTextCommon.strictMaxPerLine) {
                return text;
            }

            return newLines.join(Common.NEWLINE);
        }

        return text;
    }
};


JSAction_UnsplitText = {
  onExecute : function() {
    JSAction_SplitTextCommon.iterTexts(Common.getOneLineText);
  }
};


JSAction_SplitText = {
  onExecute : function() {
    var lang = Common.detectLanguage(true);
    JSAction_SplitTextCommon.iterTexts(function(text) {
        return Common.getSplittedTextCharPixel(
            text,
            JSAction_SplitTextCommon.maxPerLine,
            JSAction_SplitTextCommon.strictMaxPerLine,
            JSAction_SplitTextCommon.maxPixelsPerLine,
            JSAction_SplitTextCommon.strictMaxPixelsPerLine,
            null,
            lang);
    });
  }
};


JSAction_SplitUpText = {
  onExecute : function() {
    JSAction_SplitTextCommon.iterTexts(function(text) {
        return JSAction_SplitTextCommon.moveSplit(text, -1);
    });
  }
};


JSAction_SplitDownText = {
  onExecute : function() {
    JSAction_SplitTextCommon.iterTexts(function(text) {
        return JSAction_SplitTextCommon.moveSplit(text, 1);
    });
  }
};


VSSCore.RegisterJavascriptAction("JSAction_SplitText", "Split text", "Ctrl+Shift+F");
VSSCore.RegisterJavascriptAction("JSAction_UnsplitText", "Unsplit text", "Ctrl+Shift+Alt+F");
VSSCore.RegisterJavascriptAction("JSAction_SplitUpText", "Split up text", "Ctrl+Shift+R");
VSSCore.RegisterJavascriptAction("JSAction_SplitDownText", "Split down text", "Ctrl+Shift+V");
