/*
  French punctuation
  original version by christophe dot paris at free dot fr
  all changes below by thyresias at gmail dot com (www.calorifix.net)
  26 Nov 2005  refactoring, tune rules for Calorifix
  25 Feb 2007  Param_AllAtOnce=1 by default
*/

VSSPlugin = {

  Name: " French punctuation", // space: check this first
  Color: 0x008000, // dark green
  Message: "Typo",
  Description: "Check text against French punctuation rules.",

  // --- parameters

  // If AllAtOnce=true, this will look for all typo errors, and fix all of them at once.
  // However, the message will not give all reasons.
  Param_AllAtOnce: {
    Value: 1, Unit: "1=Yes 0=No", Description:
      "Report/fix all errors in a subtitle?\r\n" +
      "0: Only the first detected error will be reported/fixed.\r\n" +
      "1: All errors found will be reported/fixed."
  },

  // We use a table of rules to define the typography
  // Each rule is defined by those field:
  //   - re: a regular expression
  //   - msg: a message to display when the text match
  //   - replaceby (optional): a replace expression used to fix the error
  //   - exception (optional): if set to true the processing will stop on
  //     this rule and no replacement will be made (msg can be used for debugging)
  Rules: new Array(
    // espaces
    { re: /[\t\v\f]/mg, msg: "Caractère d'espacement interdit (Tab, VT, FF)", replaceby: " "},
    { re: /^[ \u00A0\u2028\u2029]+/mg, msg: "Pas d'espace en début ligne", replaceby: ""},
    { re: /[ \u00A0\u2028\u2029]+$/mg, msg: "Pas d'espace en fin de ligne", replaceby: ""},
    { re: /[ \u00A0\u2028\u2029]{2,}/mg, msg: "Pas plus d'un espace consécutif", replaceby: " "},
    // ponctuation multiple
    { re: /([!:;.,]*\?[!:;?.,])|([!:;.,]+\?[!:;?.,]*)/mg, msg: "Pas de ponctuation multiple", replaceby: "?"}, // privilégie le ?
    { re: /([?!:;])[?!:;.,]+/mg, msg: "Pas de ponctuation multiple", replaceby: "$1"},
    // points de suspension
    { re: /([^.])\.\.([^.])/mg, msg: "Manque un point de suspension", replaceby: "$1...$2"},
    { re: /([^.])\.\.$/mg, msg: "Manque un point de suspension", replaceby: "$1..."},
    { re: /\.{4,}/mg, msg: "Trop de points de suspension", replaceby: "..."},
    { re: /\.{3}\b/mg, msg: "Un espace après ...", replaceby: "... "},
    { re: /^\.[.]+[ \u00A0\u2028\u2029]*/mg, msg: "Pas de points de suspension en début de ligne", replaceby: ""},
    // espaces et ponctuation
    { re: /\s+([,.])/mg, msg: "Pas d'espace avant , et .", replaceby: "$1"},
    { re: /(\w)([?!:;]+)/mg, msg: "Un espace avant ? : ; !", replaceby: "$1 $2"},
    { re: /^-(\S)/mg, msg: "Un espace après - en début de ligne", replaceby: "- $1"},
    // apostrophe
    { re: /''/mg, msg: "Double apostrophe", replaceby: "\""},
    // apostrophes comme guillemets:
    // - la 1e précédée d'un espace ou en début de ligne, suivie d'une lettre ou d'un chiffre
    // - la 2e non suivie d'une lettre ou en fin de ligne
    { re: /(\s|^)'([A-ZŠŒŽÀ-ÖØ-Þ0-9a-zšœžà-öø-þ][^'"]*)'([^A-ZŠŒŽÀ-ÖØ-Þ0-9a-zšœžà-öø-þ]|$)/mg,
        msg: "Pas d'apostrophe comme guillemet", replaceby: "$1\"$2\"$3"},
    { re: /(\s')|('\s)/mg, msg: "Pas d'espace avant ni après une apostrophe", replaceby: "'"}, // '
    // guillemets
    { re: /( |^)" +([^"]+) +"/mg, msg: "Pas d'espace après et avant guillemets", replaceby: "$1\"$2\""},
    { re: /(^" +)|( +"$)/mg, msg: "Pas d'espace après et avant guillemets", replaceby: "\""},
    { re: / +" +/mg, msg: "Pas d'espace après et avant guillemets", replaceby: " \""},  // '
    // nombres
    { re: /([0-9]+)[,.]([0-9]{3})/mg, msg: "Espace comme séparateur des milliers", replaceby: "$1\u00A0$2"},
    { re: /([0-9]+)\.([0-9]{1,2})/mg, msg: "Virgule comme séparateur décimal", replaceby: "$1,$2"},
    // espaces après . et ,
    { re: /(http:\/\/[^\s\)]+)/mg, msg: "Ignorer les point dans les URL (1)", replaceby: "[url1=$1]", exception: true, },
    { re: /(www.[^\s)]+)/mg, msg: "Ignorer les points dans les URL (2)", replaceby: "[url2=$1]", exception: true},
    { re: /\b(([A-Z]\.){2,})\B/mg, msg: "Ignorer les points dans les acronymes", replaceby: "[acro=$1]", exception: true},
    { re: /([0-9]+[.,][0-9]+)/mg, msg: "Ignorer points et virgules dans les nombres", replaceby: "[nombre=$1]", exception: true},
    { re: /([.,])\b/mg, msg: "Un espace après , et ,", replaceby: "$1 "}
  ),

  // --- error detection/fix

  HasError: function(CurrentSub, PreviousSub, NextSub) {
    var check = this.checkIt(CurrentSub);
    if (check.msg != "")
      return check.msg + " >> " + check.newText.replace(/[\r\n]+/gm,"|");
    else
      return "";
  },

  FixError: function(CurrentSub, PreviousSub, NextSub) {
    var check = this.checkIt(CurrentSub);
    if (check.msg != "")
      CurrentSub.Text = check.newText;
  },

  // --- generic check

  // because the g switch is used, replace MUST be executed if a match is found
  checkIt: function(Sub) {

    var tagText = Sub.Text;

    // fix all: replace repeatedly, stopping at the first exception
    if (this.Param_AllAtOnce.Value) {
      var msg = "";
      for (i=0; i < this.Rules.length; i++) {
        if (this.Rules[i].re.test(tagText)) {
          var fix = tagText.replace(this.Rules[i].re, this.Rules[i].replaceby);
          if (this.Rules[i].exception) break;
          tagText = fix;
          if (msg == "")
            msg = this.Rules[i].msg;
          else if (msg != this.Rules[i].msg)
            msg = "Ponctuation";
        }
      }
      return { newText: tagText, msg: msg };;
    }

    // fix the first one: return the first modified text
    else {
      for (i=0; i < this.Rules.length; i++) {
        if ((this.Rules[i].replaceby != null) && (this.Rules[i].re.test(tagText))) {
          fix = tagText.replace(this.Rules[i].re, this.Rules[i].replaceby);
          if (!this.Rules[i].exception)
            return { newText: fix, msg: this.Rules[i].msg };
        }
      }
      return { newText: tagText, msg: "" };
    }

  }

}
