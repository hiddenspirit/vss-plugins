// Tag plugin for VisualSubSync
// Spirit <hiddenspirit (at) gmail.com>
//

LoadScript("common/common.js");

VSSPlugin = {
  // Plugin constants
  Name : "Tag",
  Description : "Check tags formatting.",
  Color : 0xaa9922,
  Message : "Tag",

  // Plugin parameters available from VSS GUI (name must start with "Param")
  ParamAsteriskOnMaskedText : { Value : 1, Unit : "(0/1)", Description :
    "Enforce asterisk for masked texts\n" +
    "0 = Off\n"+
    "1 = On (default)" },

  Rules : new Array(
    {   msg : "unclosed",
        re : /[^]*<(.)>(?![^]*<\/\1>)[^]*/,
        replaceby : "$&</$1>"
    },
    {   msg : "misplaced italics on a dialog",
        re : /^(\{[^}]*\})?<i>([\-–—]\s*)(.*)<\/i>(.*)$/mg,
        replaceby : "$1$2<i>$3</i>$4"
    },
    {   msg : "misplaced italics on a dialog",
        re : /^(\{[^}]*\})?<i>([\-–—]\s*)(.*)\r\n([\-–—]\s*)(.*)<\/i>$/,
        replaceby : "$1$2<i>$3</i>\r\n$4<i>$5</i>"
    },
    {   msg : "mergeable",
        re : /<\/(.)>([\r\n\s]*)<\1>/,
        replaceby : "$2"
    },
    {   msg : "newline after an opening tag",
        re : /\s*(<\w[^>]*>) *([\r\n]+)\s*/,
        replaceby : "$2$1"
    },
    {   msg : "newline before a closing tag",
        re : / *([\r\n]+)\s*(<\/[^>]*>)\s*/,
        replaceby : "$2$1"
    },
    {   msg : "more than one unique ASS tag",
        re : /(\{\\(pos|fade?|an?)[^A-Za-z].*?\}[^]*)\{\\\2[^A-Za-z].*?\}/,
        replaceby : "$1"
    },
    {   msg : "misplaced unique ASS tag",
        re : /^([^]+?)(\{\\(pos|fade?|an?)[^A-Za-z].*?\})/,
        exceptre : /^(\{.*?\})+\{\\(pos|fade?|an?)[^A-Za-z].*?\}/,
        replaceby : "$2$1"
    },
    {   msg : "malformed {\\pos}",
        re : /\{\\pos\b(?!\(\d+,\d+\)(\\.*?)?\})/i,
        replacere : /\{\\pos\W*(\d+)\D+(\d+).*?(\\.*?)?\}/,
        replaceby : "{\\pos($1,$2)$3}"
    },
    {   msg : "malformed {\\fad}",
        re : /\{\\fad\b(?!\(\d+,\d+\)(\\.*?)?\})/i,
        replacere : /\{\\fad\W*(\d+)\D+(\d+).*?(\\.*?)?\}/,
        replaceby : "{\\fad($1,$2)$3}"
    },
    {   msg : "use {\\fad} when using two parameters",
        re : /\{\\fade\((\d+),(\d+)\)/i,
        replaceby : "{\\fad($1,$2)"
    },
    {   msg : "misplaced {\\pub}",
        re : /([^]+)(\{\\pub\})([^]+)/i,
        replaceby : "$2$1$3"
    },
    {   msg : "malformed tag",
        re : /\{\/([^}]*)\}/i,
        replaceby : "{\\$1}"
    },
    {   msg : "unwanted {\\b}",
        re : /\{\\(b\D[^}]*)\}/,
        replaceby : "{\\*$1}"
    },
    {   msg : "unwanted {\\c}",
        re : /\{\\(c(?!&)\D[^}]*)\}/,
        replaceby : "{\\*$1}"
    },
    {   msg : "unwanted {\\i}",
        re : /\{\\(i\D[^}]*)\}/,
        replaceby : "{\\*$1}"
    },
    {   msg : "malformed masked text",
        re : /\{(?!\\)([^}]*)\}/,
        replaceby : "{\\*$1}"
    },
    {   msg : "malformed pub",
        re : /\{\\(pub)\b([^}]+)\}/i,
        replaceby : "{\\$1}"
    }
  ),

  RuleAsteriskOnMaskedText : {
    msg : "masked text requires *",
    re : /\{\\((?!((pos|fade?)\(|[*$]|pub\}|(an?|i|b|u)\d)|\d?c|fs)[^}]*)\}/i,
    replaceby : "{\\*$1}"
  },

  // HasError method called for each subtitle during the error checking
  // If there is an error on CurrentSub
  // return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null.
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    var rule = this.FindErrorRule(CurrentSub.Text);
    return rule ? rule.msg : "";
  },

  FixError : function(CurrentSub, PreviousSub, NextSub) {
    var rule = this.FindErrorRule(CurrentSub.Text);

    if (rule) {
        var re = rule.replacere ? rule.replacere : rule.re;
        CurrentSub.Text = CurrentSub.Text.replace(re, rule.replaceby);
    }
  },

  FindErrorRule : function(text) {
    for (var i = 0; i < this.Rules.length; ++i) {
        if (this.Rules[i].re.test(text)) {
            this.Rules[i].re.lastIndex = 0;

            if (!this.Rules[i].exceptre || !this.Rules[i].exceptre.test(text)) {
                return this.Rules[i];
            }
        }
    }

    if (this.ParamAsteriskOnMaskedText.Value) {
        if (this.RuleAsteriskOnMaskedText.re.test(text)) {
            return this.RuleAsteriskOnMaskedText;
        }
    }

    return null;
  }
}


// Test
/*
function assertEqual(SrcText, ExpectedStr, Str) {
  if (ExpectedStr !== Str) {
    ScriptLog("Assertion failed with [" + SrcText.replace("\r\n", "|") +
        "].\r\nExpected [" + ExpectedStr.replace("\r\n", "|") + "],\r\nbut was  [" +
        Str.replace("\r\n", "|") + "].");
  }
}

function TestFixError(SrcText, ExpectedResult) {
  var DummySubtitle = new Object();
  DummySubtitle.Text = SrcText;
  VSSPlugin.FixError(DummySubtitle, null, null);
  assertEqual(SrcText, ExpectedResult, DummySubtitle.Text);
}

function TestHasError(SrcText, ExpectedResult) {
  var DummySubtitle = new Object();
  DummySubtitle.Text = SrcText;
  assertEqual(SrcText, ExpectedResult, VSSPlugin.HasError(DummySubtitle, null, null));
}

function TestPlugin() {
    ScriptLog("Tag plugin testing...");

    TestHasError("toto <i>titi\r\ntoto</i> titi", "");
    TestFixError("toto <i>titi\r\ntoto titi", "toto <i>titi\r\ntoto titi</i>");

    TestFixError("<i>- toto</i>\r\n- titi", "- <i>toto</i>\r\n- titi");
    TestFixError("- toto\r\n<i>- titi</i>", "- toto\r\n- <i>titi</i>");

    TestFixError("<i>- toto\r\n- titi</i>", "- <i>toto</i>\r\n- <i>titi</i>");

    TestFixError("toto <i>titi</i>\r\n<i>toto</i> titi", "toto <i>titi\r\ntoto</i> titi");

    TestFixError("toto <i>\r\ntiti</i>", "toto\r\n<i>titi</i>");

    TestFixError("<i>toto \r\n</i>titi", "<i>toto</i>\r\ntiti");

    TestHasError("{\\pos(192,268)}toto titi\r\ntoto titi", "");
    TestFixError("{\\pos(192,268)}toto titi\r\n{\\pos(192,268)}toto titi", "{\\pos(192,268)}toto titi\r\ntoto titi");

    TestFixError("toto titi\r\n{\\pos(192,268)}toto titi", "{\\pos(192,268)}toto titi\r\ntoto titi");
    TestHasError("{\\pub}{\\pos(192,268)}toto titi\r\ntoto titi", "");

    TestFixError("{\\pos(192, 268}toto titi\r\ntoto titi", "{\\pos(192,268)}toto titi\r\ntoto titi");

    TestHasError("{\\pub}toto titi\r\ntoto titi", "");
    TestHasError("toto titi\r\ntoto titi{\\pub}", "");
    TestFixError("toto titi\r\n{\\pub}toto titi", "{\\pub}toto titi\r\ntoto titi");

    TestFixError("{/pub}toto titi\r\ntoto titi", "{\\pub}toto titi\r\ntoto titi");

    TestFixError("toto {\\bibi} titi", "toto {\\*bibi} titi");

    TestFixError("toto {\\coco} titi", "toto {\\*coco} titi");

    TestFixError("toto {titi\r\ntoto} titi", "toto {\\*titi\r\ntoto} titi");
}

TestPlugin();
*/
