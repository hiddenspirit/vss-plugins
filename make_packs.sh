#!/usr/bin/env bash
if [ ! -d packs ]
then
  mkdir packs
fi
rm packs/*.zip
zip -9 -R packs/SW_NTSC jsplugin/*.js jsplugin/*.txt jsplugin/*/*.js jsplugin/*/*.txt presets/*_NTSC_*.ini dict/_about_dictionaries_.txt dict/perso.dic dict/*fr* dict/*en_US* readme*.txt
zip -9 -R packs/SW_PAL jsplugin/*.js jsplugin/*.txt jsplugin/*/*.js jsplugin/*/*.txt presets/*_PAL_*.ini dict/_about_dictionaries_.txt dict/perso.dic dict/*fr* dict/*en_GB* readme*.txt
