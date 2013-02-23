#!/usr/bin/env bash
if [ ! -d packs ]
then
  mkdir packs
fi
rm packs/*.zip
zip -9 -R packs/SW_US jsplugin/*.js jsplugin/*.txt jsplugin/*/*.js jsplugin/*/*.txt presets/*_US_*.ini dict/_about_dictionaries_.txt dict/perso.dic dict/*fr* dict/*en_US* README*.txt
zip -9 -R packs/SW_UK jsplugin/*.js jsplugin/*.txt jsplugin/*/*.js jsplugin/*/*.txt presets/*_UK_*.ini dict/_about_dictionaries_.txt dict/perso.dic dict/*fr* dict/*en_GB* README*.txt
