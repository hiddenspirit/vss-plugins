@echo off
del "packs\*.zip"
"c:\program files\7-zip\7z.exe" a -tzip -mx9 -r "packs\SW_US" "jsplugin\*.js" "jsplugin\*.txt" "presets\*_US_*.ini" "dict\_about_dictionaries_.txt" "dict\perso.dic" "dict\fr*.aff" "dict\fr*.dic" "dict\*fr*.txt" "dict\en_US*.aff" "dict\en_US*.dic" "dict\*en_US*.txt" "readme*.txt"
"c:\program files\7-zip\7z.exe" a -tzip -mx9 -r "packs\SW_UK" "jsplugin\*.js" "jsplugin\*.txt" "presets\*_UK_*.ini" "dict\_about_dictionaries_.txt" "dict\perso.dic" "dict\fr*.aff" "dict\fr*.dic" "dict\*fr*.txt" "dict\en_GB*.aff" "dict\en_GB*.dic" "dict\*en_GB*.txt" "readme*.txt"
