// Typography plugin for VisualSubSync
// Nathbot <nathbot (at) gmail.com>
// Spirit <hiddenspirit (at) gmail.com>
//
// Based on:
// "French typography" (Toff, Thyresias, Nathbot)
//

LoadScript("common/common.js");
LoadScript("common/difflib.js");

VSSPlugin = {
  Debug : false,

  // Plugin constants
  Name : "Typography",
  Description : "Check text against typography rules.",
  Color : 0xaf0000,
  Message : "Typography",

  // Plugin parameters available from VSS GUI (name must start with "Param")
  ParamLanguage : { Value : "auto", Unit : "(auto/en/fr)", Description :
    "Language used for typography rules.\n" +
    "auto = Autodetect (default)\n" +
    "en = English\n" +
    "fr = French" },

  ParamUseNarrowNoBreakSpace : { Value : 0, Unit : "(0/1)", Description :
    "Use narrow no-break space character (French – Unicode).\n" +
    "0 = Disabled (default)\n" +
    "1 = Enabled" },

  UseSuperscripts : { Value : 0, Unit : "(0/1)", Description :
    "Use subscript characters (French – Unicode).\n" +
    "0 = Disabled (default)\n" +
    "1 = Enabled (not recommended)" },

  // We use a table of rules to define the typography.
  // Each rule is defined by those fields:
  // - re: a regular expression
  // - msg: a message to display when the text matches
  // - replaceby (optional): a replace expression used to fix the error
  // - exception (deprecated): if set to true, the processing will stop on
  //   this rule and no replacement will be made (msg can be used for debugging)
  // - precondition (optional): a function that works as a pre-condition,
  //   returning true to check the rule, or false to skip it
  // - postcondition(text) (optional): a function that works as a post-condition,
  //   returning true to confirm the rule, or false to cancel it
  Rules : {
    // upper_patern : /[A-ZÀ-ÖØ-ÞŒ]/,
    // lower_pattern : /[a-zß-öø-ÿœ]/,
    // word_pattern : /[\wÀ-ÖØ-öø-ɏ]/,
    "fr" : {
        all: [
            {   re: /(…|\.\.\.)\?/mg,
                msg: "Espace manquante : …? --> … ?",
                replaceby: "... ?" },

            {   re: /(…|\.\.\.)\!/mg,
                msg: "Espace manquante : …! --> … !",
                replaceby: "... !" },

            {   re: /\? (…|\.\.\.)/mg,
                msg: "Espace en trop : ? … --> ?…",
                replaceby: "?..." },

            {   re: /\!\s(…|\.\.\.)/mg,
                msg: "Espace en trop : ! … --> !…",
                replaceby: "!..." },

            {   re: /\b(\d+)h\b/mg,
                msg: "'h' (heure) toujours précédé d’une espace",
                replaceby: "$1 h" },

            {   re: /(\d)h\s/mg,
                msg: "'h' toujours précédé et suivi d’une espace",
                replaceby: "$1 h " },

            {   re: /(\d)h(\d{2})/mg,
                msg: "'h' toujours précédé et suivi d’une espace",
                replaceby: "$1 h $2" },

            {   re: /(\d)\s*h(\d{2})/mg,
                msg: "'h' toujours précédé et suivi d’une espace",
                replaceby: "$1 h $2" },

            {   re: /(\d)h\s*(\d{2})/mg,
                msg: "'h' toujours précédé et suivi d’une espace",
                replaceby: "$1 h $2" },

            {   re: /h 00/mg,
                msg: "h 00 --> h",
                replaceby: "h" },

            {   re: /Sécurité Intérieure/mg,
                msg: "Sécurité Intérieure --> Sécurité intérieure",
                replaceby: "Sécurité intérieure" },

            {   re: /\bsénat\b/mg,
                msg: "sénat --> Sénat",
                replaceby: "Sénat" },

            {   re: /(\w[\s'’]+)Ministère\b/mg,
                msg: "Ministère --> ministère (sauf en début de phrase)",
                replaceby: "$1ministère" },

            {   re: /(\w[\s'’]+)Enfer\b/mg,
                msg: "Enfer --> enfer (sauf en début de phrase)",
                replaceby: "$1enfer" },

            {   re: /(\w[\s'’]+)Paradis\b/mg,
                msg: "Paradis --> paradis (sauf en début de phrase)",
                replaceby: "$1paradis" },

            // http://www.larousse.fr/dictionnaires/francais/ciel_cielscieux/15990/difficulte
            // {   re: /(\w[\s'’]+)Ciel\b/mg,
                // msg: "Ciel --> ciel (sauf en début de phrase)",
                // replaceby: "$1ciel" },

            {   re: /(votre Majesté)|(Votre majesté)/mg,
                msg: "Casse incorrecte --> Votre Majesté",
                replaceby: "Votre Majesté" },

            {   re: /(votre Altesse)|(Votre altesse)/mg,
                msg: "Casse incorrecte --> Votre Altesse",
                replaceby: "Votre Altesse" },

            {   re: /(Sa majesté)|(sa Majesté)/mg,
                msg: "Casse incorrecte --> Sa Majesté",
                replaceby: "Sa Majesté" },

            {   re: /(son Altesse)|(Son altesse)/mg,
                msg: "Casse incorrecte --> Son Altesse",
                replaceby: "Son Altesse" },

            {   re: /(\d)\s+sec\b/mg,
                msg: "sec --> s",
                replaceby: "$1 s" },

            {   re: /\bmn\b([^éàèùâêîôûäëïöü]|$)/mg,
                msg: "mn --> min",
                replaceby: "min$1" },

            {   re: /(n[ᵒ°º])(s)?(\d+)/img,
                msg: "Nᵒ toujours suivi d’une espace",
                replaceby: "$1$2 $3" },

            {   re: /[\t\v\f]+/mg,
                msg: "Caractère d’espacement interdit (Tab, VT, FF)",
                replaceby: " " },

            {   re: /^[ \u00a0\u2028\u2029\u202f]+/mg,
                msg: "Pas d’espace en début de ligne",
                replaceby: "" },

            {   re: /[ \u00a0\u2028\u2029\u202f]+$/mg,
                msg: "Pas d’espace en fin de ligne",
                replaceby: "" },

            {   re: /^\r\n|\r\n$/g,
                msg: "Sauf de ligne superflu",
                replaceby: "" },

            {   re: /(\r\n){2,}/g,
                msg: "Sauf de ligne superflu",
                replaceby: "\r\n" },

            {   re: /[ \u00a0\u2028\u2029\u202f]{2,}/mg,
                msg: "Pas plus d’une espace consécutive",
                replaceby: " " },

            {   re: /([^-])\s+\.(?!\d)/mg,
                msg: "Pas d’espace avant « . »",
                replaceby: "$1." },

            {   re: /([^-])\s+,/mg,
                msg: "Pas d’espace avant « , »",
                replaceby: "$1," },

            {   re: /(http:\/\/[^\s\)]+)/mg,
                msg: "Ignorer les points dans les URL (1)",
                replaceby: "[url1=$1]",
                exception: true },

            {   re: /([?!:;]+)(\b)/mg,
                msg: "Espace après « ? », « : », « ; » ou « ! » (1)",
                replaceby: "$1 $2" },

            // {   re: /[\f\t\u2028\u2029]+([?!:;]+)/mg,
                // msg: "Espace avant \"?\", \":\", \";\" ou \"!\" (2)",
                // replaceby: " $1" },

            {   re: /^([-–—])(\S)/mg,
                msg: "Espace après un « – » en début de ligne",
                replaceby: "$1 $2" },

            {   re: /''/mg,
                msg: "Double apostrophe",
                replaceby: "\"" },

            {   re: /(\s'\s)|(\s')|('\s)/mg,
                msg: "Pas d’espace avant et après une apostrophe",
                replaceby: "'" },

            {   re: /"([\wÀ-ÖØ-öø-ɏ]+)"([\wÀ-ÖØ-öø-ɏ])/img,
                msg: "Espace après des guillemets",
                replaceby: "\"$1\" $2" },

            {   re: /([\wÀ-ÖØ-öø-ɏ])"([\wÀ-ÖØ-öø-ɏ]+)"/img,
                msg: "Espace avant des guillemets",
                replaceby: "$1 \"$2\"" },

            {   re: /^\.\.([^.])/mg,
                msg: "Signe de ponctuation invalide « .. » (1)",
                replaceby: "...$1" },

            {   re: /([^.])\.\.([^.])/mg,
                msg: "Signe de ponctuation invalide « .. » (2)",
                replaceby: "$1...$2" },

            {   re: /([^.])\.\.$/mg,
                msg: "Signe de ponctuation invalide « .. » (3)",
                replaceby: "$1." },

            {   re: /\.{4,}/mg,
                msg: "Signe de ponctuation invalide « .... »",
                replaceby: "..." },

            {   re: /(\.{3}|…)\b/mg,
                msg: "Espace après « … »",
                replaceby: "$1 " },

            {   re: /(www.[^\s)]+)/mg,
                msg: "Ignorer les points dans les URL (2)",
                replaceby: "[url2=$1]",
                exception: true },

            {   re: /\b(([A-Z]\.){2,})\B/mg,
                msg: "Ignorer les points dans les acronymes",
                replaceby: "[acro=$1]",
                exception: true },

            // Ne fonctionne pas pour : "50, 75 kg à peu près."
            // {   re: /(\d+[.,])\s+(\d+)/mg,
                // msg: "Pas d’espace dans un nombre",
                // replaceby: "$1$2" },

            // Handled by the "Case" plugin
            // {   re: /[A-Z]{2,}[a-z]{2,}/mg,
                // msg: "Erreur de majuscule" },

            // {   re: /(\d+[.,]\d+)/mg,
                // msg: "Ignorer points et virgules dans les nombres",
                // replaceby: "[nombre=$1]",
                // exception: true },

            {   re: /(.)([.,:])\b(\S+)\b/mg,
                msg: "Espace après un « . », « : » ou « , »",
                replaceby: "$1$2 $3",
                postcondition: function(text) {
                    return !/\.(com|net|org|fr|eu|tv)/.test(text) &&
                        !/([\d\s]+\.\d+|\d+,\d+)/.test(text);
                } },

            {   re: /(\d+)\.(\d{2}\s[$€£¥])/mg,
                msg: "« , » pour le séparateur décimal",
                replaceby: "$1,$2" },

            {   re: /--/mg,
                msg: "Le signe d’interruption doit être « … » au lieu de « -- »",
                replaceby: "..." },

            {   re: /\bMr\.?/mg,
                msg: "Mr/Mr. --> M.",
                replaceby: "M." },

            {   re: /\bDr\./mg,
                msg: "Dr. --> Dr",
                replaceby: "Dr" },

            {   re: /\b1ère(s)?\b/mg,
                msg: "1ère(s) --> 1re(s)",
                replaceby: "1re$1" },

            {   re: /\b2nd(e)?(s)?\b/mg,
                msg: "2nd(e)(s) --> 2d(e)(s)",
                replaceby: "2d$1$2" },

            {   re: /(\d)i?[èe]m(e)(s)?/mgi,
                msg: "2ème(s), 3ème(s), etc. --> 2e(s), 3e(s), etc.",
                replaceby: "$1$2$3" },

            {   re: /(\d)è/mg,
                msg: "2è, 3è, etc. --> 2e, 3e, etc.",
                replaceby: "$1e" },

            {   re: /(\d)È/mg,
                msg: "2È, 3È, etc. --> 2E, 3E, etc.",
                replaceby: "$1E" },

            {   re: /\betc(\.{2,}|…)/mg,
                msg: "etc… --> etc.",
                replaceby: "etc." },

            {   re: /\b([A-ZÀ-ÖØ-ÞŒ]{2,})s\b/mg,
                msg: "sigle ou acronyme invariable",
                replaceby: "$1" },
            {   re: /(\d+)(°[CF]|[mcdk]?[gm])/mg,
                msg: "espace entre un nombre et un symbole de mesure",
                replaceby: "$1 $2" },
        ],

        nonUnicode: [
            {
                re: /(\d)[\u00a0\u202f]*([\$€£¥])/mg,
                msg: "Espace manquante avant un symbole monétaire",
                replaceby: "$1 $2"
            },
            {
                re: /(\d)[\u00a0\u202f]*%/mg,
                msg: "% toujours précédé d’une espace",
                replaceby: "$1 %"
            },
            {
                re: /([\wÀ-ÖØ-öø-ɏ."'’»])([\u00a0\u202f]*)([?!:;]+)/img,
                msg: "Espace normale avant « ? », « ! », « ; » ou « : »",
                replaceby: "$1 $3"
            },
            {
                re: /(…)/mg,
                msg: "… --> ... (trois points)",
                replaceby: "..."
            },
            {   re: /([‘’])/mg,
                msg: "‘ ou ’ (typographique) --> ' (droit)",
                replaceby: "'"
            },
            {
                re: /[«“][\s\u202f]*([^"]+?)[\s\u202f]*[»”]/mg,
                msg: "Guillemets droits",
                replaceby: "\"$1\""
            },
            {
                re: /[«“][\s\u202f]*|[\s\u202f]*[»”]/mg,
                msg: "Guillemet droit",
                replaceby: "\""
            },
            {
                re: /(^.*?)"(?:\s+([^"]+)\s+|\s+([^"]+)\s*|\s*([^"]+)\s+)"/mg,
                msg: "Pas d'espaces à l’intérieur de guillemets droits",
                replaceby: "$1\"$2$3$4\"",
                postcondition: function(text) {
                    var count = 0;
                    for (var i = 0; i < text.length; ++i) {
                        if (text[i] == "\"") {
                            ++count;
                        }
                    }
                    return 0 == count % 2;
                    //TODO: vérifier la suite si false
                }
            },
            {
                re: /^[—–]\s+/mg,
                msg: "Tiret court pour les dialogues",
                replaceby: "- "
            },
            {
                re: /\u202f/mg,
                msg: "Espace fine insécable non permise",
                replaceby: " "
            }
        ],

        unicode: [
            {
                re: /(\d)[ \u202f]*([\$€£¥])/mg,
                msg: "Espace insécable avant un symbole monétaire",
                replaceby: "$1\u00a0$2"
            },
            {
                re: /(\d)[ \u202f]*%/mg,
                msg: "% précédé d’une espace insécable",
                replaceby: "$1\u00a0%"
            },
            {
                re: /([\wÀ-ÖØ-öø-ɏ."'’»$£€¥])([ \u00a0]*)([?!;]+)/img,
                msg: "Espace fine insécable avant « ? », « ! » ou « ; »",
                replaceby: "$1\u202f$3",
                precondition: function() {
                    return VSSPlugin.ParamUseNarrowNoBreakSpace.Value;
                }
            },
            {
                re: /([\wÀ-ÖØ-öø-ɏ."'’»$£€¥])([ \u202f]*)([?!;]+)/img,
                msg: "Espace insécable avant « ? », « ! » ou « ; »",
                replaceby: "$1\u00a0$3",
                precondition: function() {
                    return !VSSPlugin.ParamUseNarrowNoBreakSpace.Value;
                }
            },
            {
                re: /([\wÀ-ÖØ-öø-ɏ."'’»$£€¥])([ \u202f]*)(:)/img,
                msg: "Espace insécable avant « : »",
                replaceby: "$1\u00a0$3"
            },
            {
                re: /\.\.\./mg,
                msg: "Caractère points de suspension",
                replaceby: "…"
            },
            {
                re: /'/mg,
                msg: "Apostrophe typographique",
                replaceby: "’"
            },
            {
                re: /["“]\s*([^"“”]+?)\s*["”]/mg,
                msg: "Guillemets typographiques français",
                replaceby: "«\u202f$1\u202f»",
                precondition: function() {
                    return VSSPlugin.ParamUseNarrowNoBreakSpace.Value;
                }
            },
            {
                re: /["“]\s*([^"“”]+?)/mg,
                msg: "Guillemet typographique français",
                replaceby: "«\u202f$1",
                precondition: function() {
                    return VSSPlugin.ParamUseNarrowNoBreakSpace.Value;
                }
            },
            {
                re: /([^"“”]+?)\s*["”]/mg,
                msg: "Guillemet typographique français",
                replaceby: "$1\u202f»",
                precondition: function() {
                    return VSSPlugin.ParamUseNarrowNoBreakSpace.Value;
                }
            },
            {
                re: /«([ \u00a0]*)([\wÀ-ÖØ-öø-ɏ])/img,
                msg: "Espace fine insécable avec guillemet typographique français",
                replaceby: "«\u202f$2",
                precondition: function() {
                    return VSSPlugin.ParamUseNarrowNoBreakSpace.Value;
                }
            },
            {
                re: /([\wÀ-ÖØ-öø-ɏ.:,;?!…])([ \u00a0]*)»/img,
                msg: "Espace fine insécable avec guillemet typographique français",
                replaceby: "$1\u202f»",
                precondition: function() {
                    return VSSPlugin.ParamUseNarrowNoBreakSpace.Value;
                }
            },
            {
                re: /["“]\s*([^"“”]+?)\s*["”]/mg,
                msg: "Guillemets typographiques français",
                replaceby: "«\u00a0$1\u00a0»",
                precondition: function() {
                    return !VSSPlugin.ParamUseNarrowNoBreakSpace.Value;
                }
            },
            {
                re: /["“]\s*([^"“”]+?)/mg,
                msg: "Guillemet typographique français",
                replaceby: "«\u00a0$1",
                precondition: function() {
                    return !VSSPlugin.ParamUseNarrowNoBreakSpace.Value;
                }
            },
            {
                re: /([^"“”]+?)\s*["”]/mg,
                msg: "Guillemet typographique français",
                replaceby: "$1\u00a0»",
                precondition: function() {
                    return !VSSPlugin.ParamUseNarrowNoBreakSpace.Value;
                }
            },
            {
                re: /«([ \u202f]*)([\wÀ-ÖØ-öø-ɏ])/img,
                msg: "Espace insécable avec guillemet typographique français",
                replaceby: "«\u00a0$2",
                precondition: function() {
                    return !VSSPlugin.ParamUseNarrowNoBreakSpace.Value;
                }
            },
            {
                re: /([\wÀ-ÖØ-öø-ɏ.:,;?!…])([ \u202f]*)»/img,
                msg: "Espace insécable avec guillemet typographique français",
                replaceby: "$1\u00a0»",
                precondition: function() {
                    return !VSSPlugin.ParamUseNarrowNoBreakSpace.Value;
                }
            },
            {
                re: /“(\s)|(\s)”/mg,
                msg: "Pas d’espace à l’intérieur de guillemets anglais",
                replaceby: ""
            },
            {
                re: /^[-—]\s+/mg,
                msg: "Tiret demi-cadratin pour les dialogues",
                replaceby: "– "
            },
            {
                re: /([A-ZÀ-ÖØ-ÞŒ])\u202f([A-ZÀ-ÖØ-ÞŒ])/img,
                msg: "Espace fine insécable non pertinente",
                replaceby: "$1 $2"
            },
            {
                re: /(\d) (\d{3})\b/mg,
                msg: "Espace fine insécable comme séparateur de milliers",
                replaceby: "$1\u202f$2",
                precondition: function() {
                    return VSSPlugin.ParamUseNarrowNoBreakSpace.Value;
                }
            },
            // {
                // re: /(\d+) (h) (\d+)/img,
                // msg: "Espaces insécables avant et après le symbole de l’heure",
                // replaceby: "$1\u00a0$2\u00a0$3"
            // },
            // {
                // re: /(\d+)((?:er|re|e|de?)s?)? ([\wÀ-ÖØ-öø-ɏ°]+)/img,
                // msg: "Espace insécable entre le nombre et le mot auquel il se rapporte",
                // replaceby: "$1$2\u00a0$3"
            // },
            {
                re: /\b(n)([°º])/img,
                msg: "Symbole degré utilisé à tort dans « nᵒ »",
                replaceby: "$1ᵒ",
                precondition: function() {
                    return VSSPlugin.UseSuperscripts.Value;
                }
            },
            {
                re: /\b(n)([ᵒ°º]s)/img,
                msg: "nᵒˢ",
                replaceby: "$1ᵒˢ",
                precondition: function() {
                    return VSSPlugin.UseSuperscripts.Value;
                }
            },
            {
                re: /\b(n)(ᵒˢ?)/img,
                msg: "Utiliser le symbole degré dans « nᵒ »",
                replaceby: "$1°",
                precondition: function() {
                    return !VSSPlugin.UseSuperscripts.Value;
                }
            },
            {
                re: /\b(1)er\b/img,
                msg: "Lettres de l’ordinal en exposant",
                replaceby: "$1ᵉʳ",
                precondition: function() {
                    return VSSPlugin.UseSuperscripts.Value;
                }
            },
            {
                re: /\b(1)ers\b/img,
                msg: "Lettres de l’ordinal en exposant",
                replaceby: "$1ᵉʳˢ",
                precondition: function() {
                    return VSSPlugin.UseSuperscripts.Value;
                }
            },
            {
                re: /\b(1)re\b/img,
                msg: "Lettres de l’ordinal en exposant",
                replaceby: "$1ʳᵉ",
                precondition: function() {
                    return VSSPlugin.UseSuperscripts.Value;
                }
            },
            {
                re: /\b(1)res\b/img,
                msg: "Lettres de l’ordinal en exposant",
                replaceby: "$1ʳᵉˢ",
                precondition: function() {
                    return VSSPlugin.UseSuperscripts.Value;
                }
            },
            {
                re: /\b(\d+)e\b/img,
                msg: "Lettres de l’ordinal en exposant",
                replaceby: "$1ᵉ",
                precondition: function() {
                    return VSSPlugin.UseSuperscripts.Value;
                }
            },
            {
                re: /\b(\d+)es\b/img,
                msg: "Lettres de l’ordinal en exposant",
                replaceby: "$1ᵉˢ",
                precondition: function() {
                    return VSSPlugin.UseSuperscripts.Value;
                }
            },
            {
                re: /\b(2)d\b/mg, // on ne change pas « 2D »
                msg: "Lettres de l’ordinal en exposant",
                replaceby: "$1ᵈ",
                precondition: function() {
                    return VSSPlugin.UseSuperscripts.Value;
                }
            },
            {
                re: /\b(2)ds\b/img,
                msg: "Lettres de l’ordinal en exposant",
                replaceby: "$1ᵈˢ",
                precondition: function() {
                    return VSSPlugin.UseSuperscripts.Value;
                }
            },
            {
                re: /\b(2)de\b/img,
                msg: "Lettres de l’ordinal en exposant",
                replaceby: "$1ᵈᵉ",
                precondition: function() {
                    return VSSPlugin.UseSuperscripts.Value;
                }
            },
            {
                re: /\b(2)des\b/img,
                msg: "Lettres de l’ordinal en exposant",
                replaceby: "$1ᵈᵉˢ",
                precondition: function() {
                    return VSSPlugin.UseSuperscripts.Value;
                }
            },
            {
                re: /ᵈ/mg,
                msg: "Ne pas utiliser de caractère en exposant",
                replaceby: "d",
                precondition: function() {
                    return !VSSPlugin.UseSuperscripts.Value;
                }
            },
            {
                re: /ᵉ/mg,
                msg: "Ne pas utiliser de caractère en exposant",
                replaceby: "e",
                precondition: function() {
                    return !VSSPlugin.UseSuperscripts.Value;
                }
            },
            {
                re: /ʳ/mg,
                msg: "Ne pas utiliser de caractère en exposant",
                replaceby: "r",
                precondition: function() {
                    return !VSSPlugin.UseSuperscripts.Value;
                }
            },
            {
                re: /ˢ/mg,
                msg: "Ne pas utiliser de caractère en exposant",
                replaceby: "s",
                precondition: function() {
                    return !VSSPlugin.UseSuperscripts.Value;
                }
            }
        ]
    },

    "en" : {
        all: [
            {   re: /[\t\v\f]+/mg,
                msg: "Forbidden space character (Tab, VT, FF)",
                replaceby: " " },

            {   re: /[ \f\t\u00a0\u2028\u2029\u202f]{2,}/mg,
                msg: "No more than one consecutive space",
                replaceby: " " },

            {   re : /^[ \u00a0\u2028\u2029\u202f]+/mg,
                msg: "No space before a new line",
                replaceby: "" },

            {   re: /[ \u00a0\u2028\u2029\u202f]+$/mg,
                msg: "No space after a new line",
                replaceby: "" },

            {   re: /^\r\n|\r\n$/g,
                msg: "Trailing newline",
                replaceby: "" },

            {   re: /(\r\n){2,}/g,
                msg: "Consecutive newlines",
                replaceby: "\r\n" },

            {   re: /([^-])[\s\u202f]+([.,?!:])/mg,
                msg: "No space before \".\", \",\", \"?\", \":\" or \"!\"",
                replaceby: "$1$2" },

            {   re: /^(-)(\S)/mg,
                msg: "One space after \"-\" at line start",
                replaceby: "$1 $2"
            },

            {   re: /^([—–])(?: |(\S))/mg,
                msg: "One non-breaking space after \"–\" at line start",
                replaceby: "$1\u00a0$2"
            },

            {   re: /(\w*)(?:\s'\s|\s'(?!em|cause|Cause|coz|Coz|[0-9]{2})|'\s)(\w*)/mg,
                msg: "No space before and after an apostrophe",
                replaceby: "$1'$2",
                postcondition : function(text) {
                    var re = /([sn]'\s(?!t\b))/img;

                    try {
                        return !re.test(text);
                    } finally {
                        re.lastIndex = 0;
                    }
                }
            },

            {   re: /^\.\.([^.])/mg,
                msg: "Invalid punctuation mark \"..\" (1)",
                replaceby: "... $1" },

            {   re: /([^.])\.\.([^.])/mg,
                msg: "Invalid punctuation mark \"..\" (2)",
                replaceby: "$1...$2" },

            {   re: /([^.])\.\.$/mg,
                msg: "Invalid punctuation mark \"..\" (3)",
                replaceby: "$1." },

            {   re: /\.{4,}/mg,
                msg: "Too many suspension points",
                replaceby: "... " },

            {   re: /([^\.])\.{3}(<\/i>){0,1}\b/mg,
                msg: "One space after \"...\"",
                replaceby: "$1...$2 " },

            {   re: /^\.{3}\b/mg,
                msg: "No space after \"...\" at line start",
                replaceby: "... " },

            {   re: /^[ \u00a0\u2028\u2029\u202f]+/mg,
                msg: "No space at line start",
                replaceby: "" },

            {   re: /[ \u00a0\u2028\u2029\u202f]+$/mg,
                msg: "No space at line end",
                replaceby: "" },

            {   re: /(http:\/\/[^\s\)]+)/mg,
                msg: "Ignore dots in URLs (1)",
                replaceby: "[url1=$1]",
                exception: true, },

            {   re: /(www.[^\s)]+)/mg,
                msg: "Ignore dots in URLs (2)",
                replaceby: "[url2=$1]",
                exception: true },

            {   re: /\b(([A-Z]\.){2,})\B/mg,
                msg: "Ignore dots in acronyms",
                replaceby: "[acro=$1]",
                exception: true },

            // Doesn't work for: "50, 75 kg more or less."
            // {   re: /(\d+[.,])\s+(\d+)/mg,
                // msg: "No space in a number",
                // replaceby: "$1$2" },

            {   re: /(\b)(Ok|ok)(\b)/mg,
                msg: "\"OK\" must be uppercase",
                replaceby: "$1OK$3" },

            {   re: /[A-Z]{2,}[a-z]{2,}/mg,
                msg: "Uppercase error" },

            {   re: /(\d+[.,]\d+)/mg,
                msg: "Ignore dots and commas in numbers",
                replaceby: "[nombre=$1]",
                exception: true },

            {   re: /(\w+)?([\.,])(\w+)([\.,])?/mg,
                msg: "One space after a dot or a comma",
                replaceby: "$1$2 $3$4",
                postcondition: function(text) {
                    if (["a.m.", "p.m."].indexOf(text) >= 0) {
                        return false;
                    }

                    if (/\.(com|net|org|fr)([\.,])?$/.test(text)) {
                        return false;
                    }

                    return true;
                }
            }
        ],

        nonUnicode: [
            {
                re: /^[—–]\s+/mg,
                msg: "Hyphen character for dialogues",
                replaceby: "- "
            },
            {
                re: /[“”]/mg,
                msg: "Curly double quotes --> vertical double quotes",
                replaceby: "\""
            },
            {
                re: /(…)/mg,
                msg: "One-character suspension points disallowed",
                replaceby: "..."
            },
            {
                re: /([‘’])/mg,
                msg: "Curly quote --> vertical quote",
                replaceby: "'"
            },
            {
                re: /(^.*?)"(?:\s+([^"]+)\s+|\s+([^"]+)\s*|\s*([^"]+)\s+)"/mg,
                msg: "No space inside vertical double quotes",
                replaceby: "$1\"$2$3$4\"",
                postcondition: function(text) {
                    var count = 0;
                    for (var i = 0; i < text.length; ++i) {
                        if (text[i] == "\"") {
                            ++count;
                        }
                    }
                    return 0 == count % 2;
                    //TODO: vérifier la suite si false
                }
            },
            {
                re: /«[\s\u202f]*([^]*?)[\s\u202f]*»/mg,
                msg: "Guillemets --> double quotes",
                replaceby: "\"$1\""
            }
        ],

        unicode: [
            {
                re: /^[-—]\s+/mg,
                msg: "En dash for dialogues",
                replaceby: "–\u00a0"
            },
            {
                re: /(\s|^)'(\S[^]*\S)'(\s|$)/g,
                msg: "Vertical quotes --> curly quotes",
                replaceby: "$1‘$2’$3"
            },
            {
                re: /(\s|^)"(\S[^]*\S)"/g,
                msg: "Vertical double quotes --> curly double quotes",
                replaceby: "$1“$2”"
            },
            {
                re: /“(?:\s+([^”]+)\s+|\s+([^”]+)|([^”]+)\s+)”/g,
                msg: "No space inside curly double quotes",
                replaceby: "“$1$2$3”"
            },
            {
                re: /\.\.\./mg,
                msg: "One-character suspension points required",
                replaceby: "…"
            },
            {
                re: /'/mg,
                msg: "Vertical apostrophe --> curly apostrophe",
                replaceby: "’"
            },
            {
                re: /(^|\s)"/mg,
                msg: "Vertical double quote --> curly double quote",
                replaceby: "$1“"
            },
            {
                re: /"/mg,
                msg: "Vertical double quote --> curly double quote",
                replaceby: "”"
            },
            {
                re: /«[\s\u202f]*([^]*?)[\s\u202f]*»/mg,
                msg: "Guillemets --> curly double quotes",
                replaceby: "“$1”"
            },
            {
                re: /-{2,3}/mg,
                msg: "Use em dash",
                replaceby: "—"
            }
        ],
    }
  },

  // HasError method called for each subtitle during the error checking
  // If there is an error on CurrentSub
  // return a string containing the error description.
  // Otherwise return an empty string.
  // Don't forget that PreviousSub and NextSub can be null.
  HasError : function(CurrentSub, PreviousSub, NextSub) {
    var rules = this.GetRules();
    var rulesLen = rules.length;
    var strippedText = CurrentSub.StrippedText;

    for (var i = 0; i < rulesLen; ++i) {
        if (undefined !== rules[i].precondition && !rules[i].precondition()) {
            continue;
        }

        if (!rules[i].re.test(strippedText)) {
            continue;
        }

        // Reset the regular expression.
        rules[i].re.lastIndex = 0;

        if (rules[i].exception) {
            return "";
        }

        if (undefined === rules[i].postcondition) {
            return rules[i].msg;
        }

        var match;

        try {
            while (match = rules[i].re.exec(strippedText)) {
                var str = strippedText.substring(match.index,
                    rules[i].re.lastIndex);

                if (rules[i].postcondition(str)) {
                    return rules[i].msg;
                }
            }
        } finally {
            rules[i].re.lastIndex = 0;
        }
    }

    return "";
  },

  FixError : function(CurrentSub, PreviousSub, NextSub) {
    var rules = this.GetRules();
    var rulesLen = rules.length;
    var strippedText = CurrentSub.StrippedText;

    for (var i = 0; i < rulesLen; ++i) {
        if (undefined !== rules[i].precondition && !rules[i].precondition()) {
            continue;
        }

        if (undefined === rules[i].replaceby ||
            !rules[i].re.test(strippedText)) {
            continue;
        }

        // Reset the regular expression.
        rules[i].re.lastIndex = 0;

        if (rules[i].exception) {
            return;
        }

        var newStrippedText = strippedText.replace(rules[i].re,
            undefined === rules[i].postcondition ?
            rules[i].replaceby :
            function(str) {
                return rules[i].postcondition(str) ?
                    str.replace(rules[i].re, rules[i].replaceby) : str;
            });

        if (newStrippedText != strippedText) {
            CurrentSub.Text = difflib.updateText(CurrentSub.Text, strippedText,
                newStrippedText);
            return;
        }
    }
  },

  // Get rules according to the configured language.
  GetRules : function() {
    var rules = this.Rules[this.ParamLanguage.Value] ||
                this.Rules[Common.detectLanguage()],
        result = rules["all"],
        extraRules = (VSSCore.IsUnicode ?
                      rules["unicode"] : rules["nonUnicode"]);

    if (extraRules) {
        result = result.concat(extraRules);
    }

    return result;
  }
};

// ---------------------------------------------------------------------------
// Test
// ---------------------------------------------------------------------------

function assertEqual(ExpectedStr, Str) {
  if (ExpectedStr !== Str) {
    ScriptLog("assertion failed, expected [" + ExpectedStr +
        "] but was [" + Str + "]");
  }
}

function TestFixError(SrcText, ExpectedResult) {
  var DummySubtitle = new Object();
  DummySubtitle.Text = SrcText;
  DummySubtitle.StrippedText = Common.getStrippedText(SrcText);
  VSSPlugin.FixError(DummySubtitle, null, null);
  assertEqual(ExpectedResult, DummySubtitle.Text);
}

function TestHasError(SrcText, ExpectedResult) {
  var DummySubtitle = new Object();
  DummySubtitle.Text = SrcText;
  DummySubtitle.StrippedText = Common.getStrippedText(SrcText);
  assertEqual(ExpectedResult, VSSPlugin.HasError(DummySubtitle, null, null));
}

function TestPlugin() {
  VSSPlugin.ParamLanguage.Value = "fr";

  // Caractère d'espacement interdit (Tab, VT, FF)
  TestFixError("Pas de\ttabulation",
               "Pas de tabulation");

  // Pas d’espace en début ligne
  TestFixError("1 espace\n en début de ligne.",
               "1 espace\nen début de ligne.");

  TestFixError(" 1 espace\nen début de ligne.",
               "1 espace\nen début de ligne.");

  TestFixError("1 espace\n \nen début de ligne.",
               "1 espace\n\nen début de ligne.");

  // Pas d’espace en fin de ligne
  TestFixError("1 espace \nen fin de ligne.",
               "1 espace\nen fin de ligne.");

  TestFixError("1 espace\nen fin de ligne. ",
               "1 espace\nen fin de ligne.");

  // Pas plus d'une espace consécutive
  TestFixError("2  espaces.",
               "2 espaces.");

  // Pas d’espace avant "." ou ","
  TestFixError("1 espace avant . un point.",
               "1 espace avant. un point.");

  TestFixError("1 espace avant un point .",
               "1 espace avant un point.");

  TestFixError("1 espace avant , une virgule.",
               "1 espace avant, une virgule.");

  // Ignorer les points dans les URL (1)
  TestFixError("http://visualsubsync.com",
               "http://visualsubsync.com");

  // Une espace avant "?", ":", ";" ou "!" (1)
  TestFixError("pas d'espace avant deux-points:",
               "pas d'espace avant deux-points :");

  TestFixError("pas d'espace: avant deux-points",
               "pas d'espace : avant deux-points");

  // Une espace après "?", ":", ";" ou "!" (1)
  TestFixError("1 espace :après deux-points",
               "1 espace : après deux-points");

  TestFixError("1 espace après deux-points : ",
               "1 espace après deux-points :");

  // Une espace après un "-" en début de ligne
  TestFixError("-1 espace après un tiret.",
               "- 1 espace après un tiret.");

  // Double apostrophe
  TestFixError("Double ''apostrophe",
               "Double \"apostrophe");

  // Pas d’espace avant et après une apostrophe
  TestFixError("Pas d 'espace avant une apostrophe.",
               "Pas d'espace avant une apostrophe.");

  TestFixError("Pas d' espace après une apostrophe.",
               "Pas d'espace après une apostrophe.");

  // Une espace après des guillemets
  TestFixError("Pas d’espace \"après\"des guillemets.",
               "Pas d’espace \"après\" des guillemets.");

  // Une espace avant des guillemets
  TestFixError("Pas d’espace\"avant\" des guillemets.",
               "Pas d’espace \"avant\" des guillemets.");

  // Signe de ponctuation invalide ".." (1)
  TestFixError(".. manque un point.",
               "... manque un point.");

  // Signe de ponctuation invalide ".." (2)
  TestFixError("manque..un point.",
               "manque...un point.");

  // Signe de ponctuation invalide ".." (3)
  TestFixError("Point en trop..",
               "Point en trop.");

  // Signe de ponctuation invalide "...."
  TestFixError("trop de points....",
               "trop de points...");

  // Une espace après "..."
  TestFixError("espace après...points de suspension",
               "espace après... points de suspension");

  // Ignorer les points dans les URL (2)
  TestFixError("www.visualsubsync.com",
               "www.visualsubsync.com");

  // Ignorer les points dans les acronymes
  TestFixError("F.B.I.",
               "F.B.I.");

  // Points de suspension en un seul caractère
  TestFixError("Points de suspension…",
               "Points de suspension...");

  // Curly quote --> simple quote
  TestFixError("Curly ‘quote’",
               "Curly 'quote'");

  // Erreur de majuscule
  // No fix available, just test if the type of error is detected.
  // TestHasError("Erreur de MAjuscule", "Erreur de majuscule");
  // TestFixError("Erreur de MAjuscule", "Erreur de MAjuscule");

  // Ignorer points et virgules dans les nombres
  TestFixError("10.3",
               "10.3");

  // Une espace après un ".", ":" ou ","
  TestFixError("1 espace après.un point.",
               "1 espace après. un point.");

  TestFixError("1 espace après :deux-points",
               "1 espace après : deux-points");

  ScriptLog("Tests terminés.");
}

// TestPlugin();
