@echo off
del *.7z
cd ..\trunk
"c:\program files\7-zip\7z.exe" a -t7z -mx9 -r ..\spirit\vss_addons "jsplugin\*.js" "jsplugin\*.txt" "presets\*.ini" "dict\*.dic" "dict\*.aff" "dict\*.txt" "readme*.txt" -x!"jsplugin\all_to.js"
cd ..\spirit
"c:\program files\7-zip\7z.exe" a -t7z -mx9 -r vss_addons "presets\*.ini" "jsplugin\*.js" -x!"jsplugin\obsolete\*" -x!"jsplugin\experimental\*"
