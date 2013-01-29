@echo off
del "packs\*.zip"
"c:\program files\7-zip\7z.exe" a -tzip -mx9 -r "packs\SW_NTSC" "jsplugin\*.js" "jsplugin\*.txt" "presets\*_NTSC_*.ini" "dict\_about_dictionaries_.txt" "dict\perso.dic" "dict\fr*.aff" "dict\fr*.dic" "dict\*fr*.txt" "dict\en_US*.aff" "dict\en_US*.dic" "dict\*en_US*.txt" "readme*.txt"
"c:\program files\7-zip\7z.exe" a -tzip -mx9 -r "packs\SW_PAL" "jsplugin\*.js" "jsplugin\*.txt" "presets\*_PAL_*.ini" "dict\_about_dictionaries_.txt" "dict\perso.dic" "dict\fr*.aff" "dict\fr*.dic" "dict\*fr*.txt" "dict\en_GB*.aff" "dict\en_GB*.dic" "dict\*en_GB*.txt" "readme*.txt"
