// English typography
// by Nathbot

var DebugMode = false;

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'TYPO - English typography',
  Description : 'Check text against english typography rules.',
  Color : 0x25737D,
  Message : 'Subtitle has typo :',

  // ----- Plugin parameters available from VSS GUI (name must start with "Param") -----
  ParamAuthorizeHyphens : { Value : 0, Unit : '0/1', Description: '0 = Do not authorize double-hyphens as interruption sign - 1 = Authorize double-hyphens' },
  
  // We use a table of rules to define the typography
  // Each rule is defined by those field :
  //   - re : a regular expression
  //   - msg : a message to display when the text match
  //   - replaceby (optional) : a replace expression use to fix the error
  //   - exception (optional) : if set to true the processing will stop on
  //     this rule and no replacement will be made (msg can be used for debugging)
	Rules : new Array(
		{ re : /[ \f\t\u00A0\u2028\u2029]{2,}/mg, msg : "Pas plus d'un espace consécutif", replaceby: " "},
		{ re : /[ \f\t\u00A0\u2028\u2029]+([\r\n])/mg, msg : "Pas d'espace avant une nouvelle ligne", replaceby: "$1"},
		{ re : /([\r\n])[ \f\t\u00A0\u2028\u2029]+/mg, msg : "Pas d'espace après une nouvelle ligne", replaceby: "$1"},
		{ re : /([^-])\s+([.,?!:])/mg, msg : "Pas d'espace avant '.', ',', '?', ':' ou '!'", replaceby: "$1$2"},
		{ re : /^-(\S)/mg, msg : "Un espace après un '-' en début de ligne", replaceby: "- $1"},
		{name:"apostrophe", re : /(\s'\s)|(\s')(?!em|cause|Cause|coz|Coz)|('\s)/mg, msg : "Pas d\'espace avant et après une apostrophe", replaceby: "'"},
		{ re : /^\.\.([^.])/mg, msg : "Signe de ponctuation invalide '..' (1)", replaceby: "... $1"},
		{ re : /([^.])\.\.([^.])/mg, msg : "Signe de ponctuation invalide '..' (2)", replaceby: "$1...$2"},
		{ re : /([^.])\.\.$/mg, msg : "Signe de ponctuation invalide '..' (3)", replaceby: "$1..."},
		{ re : /\.{4,}(\b|\s)/mg, msg : "Points de suspension en trop", replaceby: '... '},		
		{ re : /(…)/mg, msg : "Points de suspension en un seul caractère", replaceby: "..."},
		{ re : /([^\.])\.{3}(<\/i>){0,1}\b/mg, msg : "Un espace après '...'", replaceby: "$1...$2 "},		
		{ re : /^\.{3}\b/mg, msg : "Pas d'espace après '...' en début de ligne", replaceby: '... '},		
		{ re : /(http:\/\/[^\s\)]+)/mg, msg : "Ignorer les point dans les URL (1)", replaceby: "[url1=$1]", exception: true, },
		{ re : /(www.[^\s)]+)/mg, msg : "Ignorer les points dans les URL (2)", replaceby: "[url2=$1]", exception: true},
		{ re : /\b(([A-Z]\.){2,})\B/mg, msg : "Ignorer les points dans les acronymes", replaceby: "[acro=$1]", exception: true},
		//{ re : /([0-9]+[.,])\s+([0-9]+)/mg, msg : "Pas d'espace dans un nombre", replaceby: "$1$2"}, // fonctionne pas pour : "50, 75 kg à peu près."
		{ re : /(\b)(Ok|ok)(\b)/mg, msg : "OK must be uppercase", replaceby: "$1OK$3"},
		{ re : /(’)/mg, msg : "Curly quote --> Regular", replaceby: "'"},
		{ re : /[A-Z]{2,}[a-z]{2,}/mg, msg : "Erreur de majuscule"},
		{ re : /([0-9]+[.,][0-9]+)/mg, msg : "Ignorer points et virgules dans les nombres", replaceby: "[nombre=$1]", exception: true},
		{ re : /([\.,])([A-Za-z]+)/mg, msg : "Un espace après un '.' ou une ','", replaceby: "$1 $2"},
		{ re : /--/mg, msg : "Signe d'interruption '--' doit être '...'", replaceby: "..."}
	),
	
  // ----- HasError method called for each subtitle during the error checking -----
  // If there is an error on CurrentSub return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null
  HasError : function(CurrentSub, PreviousSub, NextSub) {
  	var SubText = CurrentSub.Text;
  	if(this.ParamAuthorizeHyphens.Value == 0) var _max = this.Rules.length;
  	else var _max = this.Rules.length-1;
  	
  	for(i=0; i < _max; i++) {
  		if(this.Rules[i].re.test(SubText)) {
  			if(DebugMode && this.Rules[i].replaceby != null) {
  				ScriptLog(SubText.replace(this.Rules[i].re, this.Rules[i].replaceby));
  				ScriptLog('');
  			} 			
  			return (this.Rules[i].exception) ? '' : this.Rules[i].msg;
  		}
  	}
  	return '';
  },
  
  FixError : function(CurrentSub, PreviousSub, NextSub) {
  	var SubText = CurrentSub.Text;
  	var exception = 0;
  	if(this.ParamAuthorizeHyphens.Value == 0) var _max = this.Rules.length;
  	else var _max = this.Rules.length-1;

  	for(i=0; i < _max; i++) {
  		if((this.Rules[i].replaceby != null) && (this.Rules[i].re.test(SubText))) {
  		  //exception for apostrophe rule...
  		  if(this.Rules[i].name != undefined && this.Rules[i].name == "apostrophe"){
			var exc_regex = /([sn]'\s)/mg;
			if(exc_regex.test(SubText)){
				exception = 1;
			}
  		  }
  		  if(!this.Rules[i].exception && this.Rules[i].replaceby != undefined && exception == 0) {
				  CurrentSub.Text = SubText.replace(this.Rules[i].re, this.Rules[i].replaceby);
				}
  			return;
  		}
  	}
  }
}
