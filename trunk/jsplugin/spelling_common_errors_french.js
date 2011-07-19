// Spelling common errors: French
// by Nathbot

var DebugMode = false;
LoadScript("common/difflib.js");

VSSPlugin = {
  // ----- Plugin constant -----
  Name : 'Spelling common errors: French',
  Description : 'Fixes common French spelling errors.',
  Color : 0xAAFF00,
  Message : 'Spelling',

  // We use a table of rules to define the typography
  // Each rule is defined by those field :
  //   - re : a regular expression
  //   - msg : a message to display when the text match
  //   - replaceby (optional) : a replace expression use to fix the error
  //   - exception (optional) : if set to true the processing will stop on
  //     this rule and no replacement will be made (msg can be used for debugging)
    Rules : new Array(

        { re : /(P|p)ourquoi faire \?/mg,
        msg : "Pourquoi faire ? --> Pour quoi faire ?",
        replaceby: "$1our quoi faire ?"},

        { re: /(l|L)à-même/mg,
        msg: "là-même -> là même",
        replaceby: "$1à même" },

        /*{ re : /(?<!toi|Toi|moi|Moi|soi|Soi|vous|Vous|nous|Nous)-même/mg,
        msg : "-même --> pas de trait d'union",
        replaceby: " même"}*/

        /*{ re : /(?<!Par-ci|par-ci,? )(P|p)ar-là/mg,
        msg : "Par-là --> Par là",
        replaceby: "$1ar là"}*/

        { re : /(P|p)resqu['’](un|en)/mg,
        msg : "Presqu’ --> Presque",
        replaceby: "$1resque $2"},

        { re : /(\b)(R|r)emord(\b)/mg,
        msg : "Remord --> remords",
        replaceby: "$1$2emords$3"},

        { re : /-espion(s?)/mg,
        msg : "-espion(s) : pas de trait d’union",
        replaceby: " espion$1"},

        { re : /-limite(s?)/mg,
        msg : "-limite(s) : pas de trait d’union",
        replaceby: " limite$1"},

        { re : /-témoin(s?)/mg,
        msg : "-témoin(s) : pas de trait d’union",
        replaceby: " témoin$1"},

        { re : /-clé(s?)/mg,
        msg : "-clé(s) : pas de trait d’union",
        replaceby: " clé$1"},

        { re : /(E|e)n tous temps/mg,
        msg : "En tous temps --> En tout temps",
        replaceby: "$1n tout temps"},

        { re : /(Q|q)uelques temps/mg,
        msg : "Quelques temps --> Quelque temps",
        replaceby: "$1uelque temps"},

        { re : /(S|s)oi-disants/mg,
        msg : "Soi-disants --> Soi-disant",
        replaceby: "$1oi-disant"},

        { re : /(S|s)oit-disant/mg,
        msg : "Soit-disant --> Soi-disant",
        replaceby: "$1oi-disant"},

        { re : /\b(Un|un|Le|le|Mon|mon|Ton|ton|Son|son|Notre|notre|Votre|votre|Leur|leur) chez (moi|toi|soi)\b/mg,
        msg : "chez soi --> chez-soi",
        replaceby: "$1 chez-$2"},

        { re : /(Q|q)u['’]oui/mg,
        msg : "Qu’oui --> Que oui",
        replaceby: "$1ue oui"},

        { re : /\b(S|s)i il(s)?\b/mg,
        msg : "Si il(s) --> S’il(s)",
        replaceby: "$1'il$2"},

        { re : /([^-]|^)\b(M|m)oi qui a\b/mg,
        msg : "Moi qui a --> Moi qui ai",
        replaceby: "$1$2oi qui ai"},

        { re : /(T|t)oi qui a\b/mg,
        msg : "Toi qui a --> Toi qui as",
        replaceby: "$1oi qui as"},

        { re : /(P|p)armis/mg,
        msg : "Parmis --> Parmi",
        replaceby: "$1armi"},

        { re : /(Q|q)uelques un(e?)s/mg,
        msg : "Quelques un(e)s --> Quelques-un(e)s",
        replaceby: "$1uelques-un$2s"},

        { re : /(E|e)n publique/mg,
        msg : "En publique --> En public",
        replaceby: "$1n public"},

        { re : /(Le|le|La|la|Un|un|Une|une) quasi /mg,
        msg : "quasi --> quasi-",
        replaceby: "$1 quasi-"},

        { re : /(P|p)allier à /mg,
        msg : "Pallier à --> Pallier",
        replaceby: "$1allier "},

        { re : /(\b)(Ok|ok)(\b)/mg,
        msg : "OK (ou O.K.) en capitales",
        replaceby: "$1OK$3"},

        { re : /(\b)(Ca)(\b)([^éàèùâêîôûäëïöü]|$)/mg,
        msg : "Ca --> Ça",
        replaceby: "$1Ça$3$4"},

        { re : /^([-–—]?\s*["«]?[\s\u202f]*)A(\s)(?!\s*(capella|contrario|fortiori|latere|minima|pari|posteriori|priori|tempera)\b)/mg,
        msg : "A --> À (début de phrase et de ligne)",
        replaceby: "$1À$2"},

        { re : /([.?!]\s|:\s["«]?[\s\u202f]*)(A)(\s)(?!\s*(capella|contrario|fortiori|latere|minima|pari|posteriori|priori|tempera)\b)/mg,
        msg : "A --> À (début de phrase)",
        replaceby: "$1À$3"},

        { re : /Ecoute/mg,
        msg : "Ecoute --> Écoute",
        replaceby: "Écoute"},

        { re : /Etiez/mg,
        msg : "Etiez --> Étiez",
        replaceby: "Étiez"},

        { re : /Evid/mg,
        msg : "Evid… --> Évid",
        replaceby: "Évid"},

        { re : /Et bien\b(?!\s\w)/mg,
        msg : "Et bien --> Eh bien",
        replaceby: "Eh bien"},

        { re : /Etre/mg,
        msg : "Etre --> Être",
        replaceby: "Être"},

        { re : /Otez/mg,
        msg : "Otez --> Ôtez",
        replaceby: "Ôtez"},

        { re : /Enorm/mg,
        msg : "Enorm… --> Énorm…",
        replaceby: "Énorm"},

        { re : /Etat/mg,
        msg : "Etat --> État",
        replaceby: "État"},

        { re : /Episode/mg,
        msg : "Episode --> Épisode",
        replaceby: "Épisode"},

        { re : /oeu/mg,
        msg : "oeu --> œu",
        replaceby: "œu"},

        { re : /oeil/mg,
        msg : "oeil --> œil",
        replaceby: "œil"},

        { re : /O(e|E)(u|U|il|IL)/mg,
        msg : "Oe --> Œ",
        replaceby: "Œ$2"},

        { re : /acceuil/mg,
        msg : "acceuil --> accueil",
        replaceby: "accueil"},

        { re : /ACCEUIL/mg,
        msg : "ACCEUIL --> ACCUEIL",
        replaceby: "ACCUEIL"},

        { re : /(\b)(Mrs)([^\.]\b)/mg,
        msg : "Mrs --> Mme",
        replaceby: "$1Mme$3"},

        { re : /(\b)(Ms)([^\.]\b)/mg,
        msg : "Ms --> Mlle",
        replaceby: "$1Mlle$3"},

        { re : /Mrs./mg,
        msg : "Mrs. --> Mme",
        replaceby: "Mme"},

        { re : /Ms./mg,
        msg : "Ms. --> Mlle",
        replaceby: "Mlle"},
        
        // Typography
        // { re : /(\b)(Mr)([^\.]\b)/mg,
        // msg : "Mr --> M.",
        // replaceby: "$1M.$3"},
        
        // { re : /Mr./mg,
        // msg : "Mr. --> M.",
        // replaceby: "M."},
        
        { re : /weekend/mg,
        msg : "weekend --> week-end",
        replaceby: "week-end"},

        { re : /quelque soit/mg,
        msg : "quelque soit --> quel que soit",
        replaceby: "quel que soit"},

        { re : /quoique ce soit/mg,
        msg : "quoique ce soit --> quoi que ce soit",
        replaceby: "quoi que ce soit"},

        { re : /\bplait\b/mg,
        msg : "plait --> plaît",
        replaceby: "plaît"},

        { re : /((en)|(une)|(la)|(ta)|(ma)|(leur)|(En)|(Une)|(La)|(Ta)|(Ma)|(Leur))\s(\bboite\b)/mg,
        msg : "boite --> boîte",
        replaceby: "$1 boîte"},

        { re : /Hey/mg,
        msg : "Hey --> Hé (songez à supprimer)",
        replaceby: "Hé"},

        { re : /grand chose/mg,
        msg : "grand chose --> grand-chose",
        replaceby: "grand-chose"},

        { re : /Eloigne/mg,
        msg : "Eloigne --> Éloigne",
        replaceby: "Éloigne"},

        { re : /(p|P)ar derrière/mg,
        msg : "par derrière --> par-derrière",
        replaceby: "$1ar-derrière"},

        { re : /(p|P)ar devant/mg,
        msg : "par devant --> par-devant",
        replaceby: "$1ar-devant"},

        { re : /(p|P)ar dessus/mg,
        msg : "par dessus --> par-dessus",
        replaceby: "$1ar-dessus"},

        { re : /(D|d)(['’])ici-là/mg,
        msg : "D’ici-là --> D’ici là",
        replaceby: "$1$2ici là"},

        { re : /(E|e)n-dessous/mg,
        msg : "En-dessous --> En dessous",
        replaceby: "$1n dessous"},

        { re : /(B|b)âiller aux corneilles/mg,
        msg : "Bâiller aux corneilles --> Bayer",
        replaceby: "$1ayer aux corneilles"},

        // { re : /(S|s)alle de bain\b/mg,
        // msg : "Salle de bain --> Salle de bains",
        // replaceby: "$1alle de bains"},

        { re : /(Ç|ç)à(?! et là)/mg,
        msg : "Çà --> ça",
        replaceby: "$1a"},

        { re : /(J|j)usque là/mg,
        msg : "Jusque là --> Jusque-là",
        replaceby: "$1usque-là"},

        // { re : /(S|s)ur le champ\b/mg,
        // msg : "Sur le champ --> Sur-le-champ (si ça signifie immédiatement)",
        // replaceby: "$1ur-le-champ"},

        { re : /(D|d)emie-heure/mg,
        msg : "Demie-heure --> Demi-heure",
        replaceby: "$1emi-heure"},

        { re : /heure(s)? et demi\b/mg,
        msg : "heure(s) et demi --> heure(s) et demie",
        replaceby: "heure$1 et demie"},

        { re : /(E|e)ntre autre\b/mg,
        msg : "Entre autre --> Entre autres",
        replaceby: "$1ntre autres"},

        { re : /(V|v)a-t-en\b/mg,
        msg : "Va-t-en --> Va-t’en",
        replaceby: "$1a-t'en"},

        { re : /(Y|y)['’](a|en)\b/mg,
        msg : "Y’a, y’en --> Y a, y en",
        replaceby: "$1 $2"},

        { re : /(E|e)ntre de bonnes mains/mg,
        msg : "Entre de bonnes mains --> En (de) bonnes mains (corriger manuellement) "},

        { re : /(M|m)ain forte/mg,
        msg : "Main forte --> Main-forte",
        replaceby: "$1ain-forte"},

        { re : /(C|c)hef d’œuvre/mg,
        msg : "Chef d’œuvre --> Chef-d’œuvre",
        replaceby: "$1hef-d’œuvre"},

        { re : /(^|\W)(Ô|ô),/mg,
        msg : "Ô, --> Ô",
        replaceby: "$1$2"},

        { re : /\b(soi|moi|toi|lui|elles|nous|vous|eux)\s(mêmes?)\b/img,
        msg : "Trait d'union entre le pronom et \"même\"",
        replaceby: "$1-$2"},

        { re : /-(lui|nous|vous|leur)\s+(y)\b/img,
        msg : "Trait d'union avec l'impératif",
        replaceby: "-$1-$2"},

        { re : /-(les?|la)\s+(moi|toi|lui|nous|vous|leur)\b(?!-)/img,
        msg : "Trait d'union avec l'impératif",
        replaceby: "-$1-$2"},

        { re : /([\wÀ-ÖØ-öø-ɏ]+)(e|ons|ez|is|ds|ts)-(ça)\b/img,
        msg : "Pas de trait d'union avant \"ça\"",
        replaceby: "$1$2 $3"}
    ),

  // ----- HasError method called for each subtitle during the error checking -----
  // If there is an error on CurrentSub return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    var strippedText = CurrentSub.StrippedText;

    for (i = 0; i < this.Rules.length; ++i) {
        if (this.Rules[i].re.test(strippedText)) {
            this.Rules[i].re.lastIndex = 0;

            if (DebugMode && this.Rules[i].replaceby != null) {
                ScriptLog(
                    strippedText.replace(this.Rules[i].re,
                    this.Rules[i].replaceby));
                ScriptLog('');
            }

            return this.Rules[i].exception ? '' : this.Rules[i].msg;
        }
    }

    return '';
  },

  FixError : function(CurrentSub, PreviousSub, NextSub) {
    var strippedText = CurrentSub.StrippedText;

    for (i = 0; i < this.Rules.length; ++i) {
        if (this.Rules[i].replaceby != null &&
            this.Rules[i].re.test(strippedText)) {

            this.Rules[i].re.lastIndex = 0;

            if (!this.Rules[i].exception) {
                CurrentSub.Text = difflib.updateText(
                    CurrentSub.Text, strippedText,
                    strippedText.replace(
                        this.Rules[i].re, this.Rules[i].replaceby));
            }

            return;
        }
    }
  }
}
