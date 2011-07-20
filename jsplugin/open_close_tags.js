/*
  Forgotten open/close tags
  thyresias at gmail dot com (www.calorifix.net)
  11 Mar 2006
*/

function checkSub(Sub) {

  // no tag: no error
  if (Sub.Text==Sub.StrippedText)
    return null;

  // look for tags
  var hasOpen = Sub.Text.match(/<i>/mg);
  var hasClose = Sub.Text.match(/<\/i>/mg);
  if (hasOpen)
    if (hasClose)
      return null;
    else
      return Sub.Text + "</i>";
  else
    return Sub.Text.replace(/<\/i>/m, "");

}

VSSPlugin = {

  Name: " Forgotten open/close tags",
  Color: 0x00FF00, // aggressive green
  Message: "Missing tag",
  Description:
    "Looks for <i> without </i>, or </i> without <i>. " +
    "When </i> is missing, the autofix adds it. " +
    "When only </i> is found, the autofix deletes it.",

  // --- error detection/fix

  HasError: function(CurrentSub, PreviousSub, NextSub) {
    var newText = checkSub(CurrentSub);
    if (newText)
      return ">> " + newText.replace(/\r\n/mg, "|");
    else
      return "";
  },

  FixError: function(CurrentSub, PreviousSub, NextSub) {
    var newText = checkSub(CurrentSub);
    if (newText)
      CurrentSub.Text = newText;
  }

}