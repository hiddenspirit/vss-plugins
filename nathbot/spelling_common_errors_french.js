// Spelling common errors: French
// by Nathbot

var DebugMode = false;

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'Spelling common errors: French',
  Description : 'Fixes common French spelling errors.',
  Color : 0xAAFF00,
  Message : 'Spelling error:',
  
  // We use a table of rules to define the typography
  // Each rule is defined by those field :
  //   - re : a regular expression
  //   - msg : a message to display when the text match
  //   - replaceby (optional) : a replace expression use to fix the error
  //   - exception (optional) : if set to true the processing will stop on
  //     this rule and no replacement will be made (msg can be used for debugging)
	Rules : new Array(
		{ re : /(\b)(Ca)(\b)/mg, msg : "'Ca' --> 'Ça'", replaceby: "$1Ça$3"},
		{ re : /^(A)(\s)/mg, msg : "'A' --> 'À' (début de phrase et de ligne)", replaceby: "À$2"},
		{ re : /^(<i>)(A)(\s)/mg, msg : "'A' --> 'À' (début de phrase et de ligne)", replaceby: "$1À$3"},
		{ re : /^(-\s)(A)(\s)/mg, msg : "'A' --> 'À' (début de phrase et de ligne)", replaceby: "$1À$3"},
		{ re : /([.?!]{1}\s)(A)(\s)/mg, msg : "'A' --> 'À' (début de phrase)", replaceby: "$1À$3"},
		{ re : /Ecoute/mg, msg : "Ecoute --> Écoute ", replaceby: "Écoute"},
		{ re : /Etiez/mg, msg : "Etiez --> Étiez ", replaceby: "Étiez"},
		{ re : /Evid/mg, msg : "Evid... --> Évid ", replaceby: "Évid"},
		{ re : /Et bien/mg, msg : "Et bien... --> Eh bien ", replaceby: "Eh bien"},
		{ re : /Etre/mg, msg : "Etre --> Être ", replaceby: "Être"},
		{ re : /Otez/mg, msg : "Otez --> Ôtez ", replaceby: "Ôtez"},
		{ re : /Enorm/mg, msg : "Enorm... --> Énorm... ", replaceby: "Énorm"},
		{ re : /Etat/mg, msg : "Etat --> État ", replaceby: "État"},
		{ re : /Episode/mg, msg : "Episode --> Épisode ", replaceby: "Épisode"},
		{ re : /oeu/mg, msg : "oeu --> œu ", replaceby: "œu"},
		{ re : /oeil/mg, msg : "oeil --> œil ", replaceby: "œil"},
		{ re : /acceuil/mg, msg : "acceuil --> accueil ", replaceby: "accueil"},
		{ re : /ACCEUIL/mg, msg : "ACCEUIL --> ACCUEIL ", replaceby: "ACCUEIL"},
		{ re : /(\b)(mn)(\b)/mg, msg : "mn --> min ", replaceby: "$1min$3"},
		{ re : /(\b)(Mrs)([^\.]\b)/mg, msg : "Mrs --> Mme ", replaceby: "$1Mme$3"},
		{ re : /(\b)(Ms)([^\.]\b)/mg, msg : "Ms --> Mlle ", replaceby: "$1Mlle$3"},
		{ re : /(\b)(Mr)([^\.]\b)/mg, msg : "Mr --> M. ", replaceby: "$1M.$3"},
		{ re : /Mrs./mg, msg : "Mrs. --> Mme ", replaceby: "Mme"},
		{ re : /Ms./mg, msg : "Ms. --> Mlle ", replaceby: "Mlle"},
		{ re : /Mr./mg, msg : "Mr. --> M. ", replaceby: "M."},
		{ re : /weekend/mg, msg : "weekend --> week-end ", replaceby: "week-end"},
		{ re : /quelque soit/mg, msg : "quelque soit --> quel que soit ", replaceby: "quel que soit"},
		{ re : /quoique ce soit/mg, msg : "quoique ce soit --> quoi que ce soit ", replaceby: "quoi que ce soit"},
		{ re : /\bplait\b/mg, msg : "plait --> plaît ", replaceby: "plaît"},
		{ re : /((en)|(une)|(la)|(ta)|(ma)|(leur)|(En)|(Une)|(La)|(Ta)|(Ma)|(Leur))\s(\bboite\b)/mg, msg : "boite --> boîte ", replaceby: "$1 boîte"},
		{ re : /Hey/mg, msg : "Hey --> Hé (songez à supprimer)", replaceby: "Hé"},
		{ re : /grand chose/mg, msg : "grand chose --> grand-chose ", replaceby: "grand-chose"},
		{ re : /Eloigne/mg, msg : "Eloigne --> Éloigne ", replaceby: "Éloigne"}
	),
	
  // ----- HasError method called for each subtitle during the error checking -----
  // If there is an error on CurrentSub return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null
  HasError : function(CurrentSub, PreviousSub, NextSub) {
  	var SubText = CurrentSub.Text;
  	var StrippedSubText = CurrentSub.StrippedText;
  	for(i=0; i < this.Rules.length; i++) {
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
  	var StrippedSubText = CurrentSub.StrippedText;
  	for(i=0; i < this.Rules.length; i++) {
  		if((this.Rules[i].replaceby != null) && (this.Rules[i].re.test(SubText))) {
  		  if(!this.Rules[i].exception) {
				  CurrentSub.Text = SubText.replace(this.Rules[i].re, this.Rules[i].replaceby);
				}
  			return;
  		}
  	}
  }
}
