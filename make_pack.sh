#!/usr/bin/env bash
rm *.7z
cd ../trunk
7zr a -t7z -mx9 ../branches/spirit/vss_addons jsplugin/*.js jsplugin/*.txt jsplugin/*/*.js jsplugin/*/*.txt presets/*.ini dict/*.dic dict/*.aff dict/*.txt readme*.txt -x!jsplugin/all_to.js
cd ../branches/spirit
7zr a -t7z -mx9 vss_addons presets/*.ini jsplugin/*.js jsplugin/*/*.js -x!jsplugin/obsolete/* -x!jsplugin/experimental/*
