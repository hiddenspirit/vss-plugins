﻿/* Adapted by spirit <hiddenspirit (at) gmail.com> for VisualSubSync plugins */

/***
This is part of jsdifflib v1.0. <http://snowtide.com/jsdifflib>

Copyright (c) 2007, Snowtide Informatics Systems, Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice, this
        list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice,
        this list of conditions and the following disclaimer in the documentation
        and/or other materials provided with the distribution.
    * Neither the name of the Snowtide Informatics Systems nor the names of its
        contributors may be used to endorse or promote products derived from this
        software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
DAMAGE.
***/
/* Author: Chas Emerick <cemerick@snowtide.com> */
/* Modified by: Jonathan R. Wallace <jonathan.wallace@gmail.com>, http://github.com/wallace/jsdifflib */
__whitespace = {" ":true, "\t":true, "\n":true, "\f":true, "\r":true};

difflib = {
    DEBUG: false,

    defaultJunkFunction: function (c) {
        return c in __whitespace;
    },

    stripLinebreaks: function (str) { return str.replace(/^[\n\r]*|[\n\r]*$/g, ""); },

    stringAsLines: function (str) {
        var lfpos = str.indexOf("\n");
        var crpos = str.indexOf("\r");
        var linebreak = ((lfpos > -1 && crpos > -1) || crpos < 0) ? "\n" : "\r";

        var lines = str.split(linebreak);
        for (var i = 0; i < lines.length; i++) {
            lines[i] = difflib.stripLinebreaks(lines[i]);
        }

        return lines;
    },

    // iteration-based reduce implementation
    __reduce: function (func, list, initial) {
        if (initial != null) {
            var value = initial;
            var idx = 0;
        } else if (list) {
            var value = list[0];
            var idx = 1;
        } else {
            return null;
        }

        for (; idx < list.length; idx++) {
            value = func(value, list[idx]);
        }

        return value;
    },

    // comparison function for sorting lists of numeric tuples
    __ntuplecomp: function (a, b) {
        var mlen = Math.max(a.length, b.length);
        for (var i = 0; i < mlen; i++) {
            if (a[i] < b[i]) return -1;
            if (a[i] > b[i]) return 1;
        }

        return a.length == b.length ? 0 : (a.length < b.length ? -1 : 1);
    },

    __calculate_ratio: function (matches, length) {
        return length ? 2.0 * matches / length : 1.0;
    },

    // returns a function that returns true if a key passed to the returned function
    // is in the dict (js object) provided to this function; replaces being able to
    // carry around dict.has_key in python...
    __isindict: function (dict) {
        return function (key) { return key in dict; };
    },

    // replacement for python's dict.get function -- need easy default values
    __dictget: function (dict, key, defaultValue) {
        return key in dict ? dict[key] : defaultValue;
    },

    SequenceMatcher: function (a, b, isjunk) {
        this.set_seqs = function (a, b) {
            this.set_seq1(a);
            this.set_seq2(b);
        }

        this.set_seq1 = function (a) {
            if (a == this.a) return;
            this.a = a;
            this.matching_blocks = this.opcodes = null;
        }

        this.set_seq2 = function (b) {
            if (b == this.b) return;
            this.b = b;
            this.matching_blocks = this.opcodes = this.fullbcount = null;
            this.__chain_b();
        }

        this.__chain_b = function () {
            var b = this.b;
            var n = b.length;
            var b2j = this.b2j = {};
            var populardict = {};
            for (var i = 0; i < b.length; i++) {
                var elt = b[i];
                if (elt in b2j) {
                    var indices = b2j[elt];
                    if (n >= 200 && indices.length * 100 > n) {
                        populardict[elt] = 1;
                        delete b2j[elt];
                    } else {
                        indices.push(i);
                    }
                } else {
                    b2j[elt] = [i];
                }
            }

            for (len = populardict.length, idx = 0; idx < len; ++idx) {
                elt = populardict[idx];
                delete b2j[elt];
            }

            var isjunk = this.isjunk;
            var junkdict = {};
            if (isjunk) {
                for (len = populardict.length, idx = 0; idx < len; ++idx) {
                    elt = populardict[idx];
                    if (isjunk(elt)) {
                        junkdict[elt] = 1;
                        delete populardict[elt];
                    }
                }
                for (len = populardict.length, idx = 0; idx < len; ++idx) {
                    elt = populardict[idx];
                    if (isjunk(elt)) {
                        junkdict[elt] = 1;
                        delete b2j[elt];
                    }
                }
            }

            this.isbjunk = difflib.__isindict(junkdict);
            this.isbpopular = difflib.__isindict(populardict);
        }

        this.find_longest_match = function (alo, ahi, blo, bhi) {
            var a = this.a;
            var b = this.b;
            var b2j = this.b2j;
            var isbjunk = this.isbjunk;
            var besti = alo;
            var bestj = blo;
            var bestsize = 0;
            var j = null;

            var j2len = {};
            var nothing = [];
            for (var i = alo; i < ahi; i++) {
                var newj2len = {};
                var jdict = difflib.__dictget(b2j, a[i], nothing);
                for (len = jdict.length, jkey = 0; jkey < len; ++jkey) {
                    j = jdict[jkey];
                    if (j < blo) continue;
                    if (j >= bhi) break;
                    newj2len[j] = k = difflib.__dictget(j2len, j - 1, 0) + 1;
                    if (k > bestsize) {
                        besti = i - k + 1;
                        bestj = j - k + 1;
                        bestsize = k;
                    }
                }
                j2len = newj2len;
            }

            while (besti > alo && bestj > blo && !isbjunk(b[bestj - 1]) && a[besti - 1] == b[bestj - 1]) {
                besti--;
                bestj--;
                bestsize++;
            }

            while (besti + bestsize < ahi && bestj + bestsize < bhi &&
                    !isbjunk(b[bestj + bestsize]) &&
                    a[besti + bestsize] == b[bestj + bestsize]) {
                bestsize++;
            }

            while (besti > alo && bestj > blo && isbjunk(b[bestj - 1]) && a[besti - 1] == b[bestj - 1]) {
                besti--;
                bestj--;
                bestsize++;
            }

            while (besti + bestsize < ahi && bestj + bestsize < bhi && isbjunk(b[bestj + bestsize]) &&
                  a[besti + bestsize] == b[bestj + bestsize]) {
                bestsize++;
            }

            return [besti, bestj, bestsize];
        }

        this.get_matching_blocks = function () {
            if (this.matching_blocks != null) return this.matching_blocks;
            var la = this.a.length;
            var lb = this.b.length;

            var queue = [[0, la, 0, lb]];
            var matching_blocks = [];
            var alo, ahi, blo, bhi, qi, i, j, k, x;
            while (queue.length) {
                qi = queue.pop();
                alo = qi[0];
                ahi = qi[1];
                blo = qi[2];
                bhi = qi[3];
                x = this.find_longest_match(alo, ahi, blo, bhi);
                i = x[0];
                j = x[1];
                k = x[2];

                if (k) {
                    matching_blocks.push(x);
                    if (alo < i && blo < j)
                        queue.push([alo, i, blo, j]);
                    if (i+k < ahi && j+k < bhi)
                        queue.push([i + k, ahi, j + k, bhi]);
                }
            }

            matching_blocks.sort(difflib.__ntuplecomp);

            var i1 = j1 = k1 = block = 0;
            var non_adjacent = [];
            for (len = matching_blocks.length, idx = 0; idx < len; ++idx) {
                block = matching_blocks[idx];
                i2 = block[0];
                j2 = block[1];
                k2 = block[2];
                if (i1 + k1 == i2 && j1 + k1 == j2) {
                    k1 += k2;
                } else {
                    if (k1) non_adjacent.push([i1, j1, k1]);
                    i1 = i2;
                    j1 = j2;
                    k1 = k2;
                }
            }

            if (k1) non_adjacent.push([i1, j1, k1]);

            non_adjacent.push([la, lb, 0]);
            this.matching_blocks = non_adjacent;
            return this.matching_blocks;
        }

        this.get_opcodes = function () {
            if (this.opcodes != null) return this.opcodes;
            var i = 0;
            var j = 0;
            var answer = [];
            this.opcodes = answer;
            var block, ai, bj, size, tag;
            var blocks = this.get_matching_blocks();
            for (len = blocks.length, idx = 0; idx < len; ++idx) {
                block = blocks[idx];
                ai = block[0];
                bj = block[1];
                size = block[2];
                tag = '';
                if (i < ai && j < bj) {
                    tag = 'replace';
                } else if (i < ai) {
                    tag = 'delete';
                } else if (j < bj) {
                    tag = 'insert';
                }
                if (tag) answer.push([tag, i, ai, j, bj]);
                i = ai + size;
                j = bj + size;

                if (size) answer.push(['equal', ai, i, bj, j]);
            }

            return answer;
        }

        // this is a generator function in the python lib, which of course is not supported in javascript
        // the reimplementation builds up the grouped opcodes into a list in their entirety and returns that.
        this.get_grouped_opcodes = function (n) {
            if (!n) n = 3;
            var codes = this.get_opcodes();
            if (!codes) codes = [["equal", 0, 1, 0, 1]];
            var code, tag, i1, i2, j1, j2;
            if (codes[0][0] == 'equal') {
                code = codes[0];
                tag = code[0];
                i1 = code[1];
                i2 = code[2];
                j1 = code[3];
                j2 = code[4];
                codes[0] = [tag, Math.max(i1, i2 - n), i2, Math.max(j1, j2 - n), j2];
            }
            if (codes[codes.length - 1][0] == 'equal') {
                code = codes[codes.length - 1];
                tag = code[0];
                i1 = code[1];
                i2 = code[2];
                j1 = code[3];
                j2 = code[4];
                codes[codes.length - 1] = [tag, i1, Math.min(i2, i1 + n), j1, Math.min(j2, j1 + n)];
            }

            var nn = n + n;
            var groups = [];
            for (len = codes.length, idx = 0; idx < len; ++idx) {
                code = codes[idx];
                tag = code[0];
                i1 = code[1];
                i2 = code[2];
                j1 = code[3];
                j2 = code[4];
                if (tag == 'equal' && i2 - i1 > nn) {
                    groups.push([tag, i1, Math.min(i2, i1 + n), j1, Math.min(j2, j1 + n)]);
                    i1 = Math.max(i1, i2-n);
                    j1 = Math.max(j1, j2-n);
                }

                groups.push([tag, i1, i2, j1, j2]);
            }

            if (groups && groups[groups.length - 1][0] == 'equal') groups.pop();

            return groups;
        }

        this.ratio = function () {
            matches = difflib.__reduce(
                            function (sum, triple) { return sum + triple[triple.length - 1]; },
                            this.get_matching_blocks(), 0);
            return difflib.__calculate_ratio(matches, this.a.length + this.b.length);
        }

        this.quick_ratio = function () {
            var fullbcount, elt;
            if (this.fullbcount == null) {
                this.fullbcount = fullbcount = {};
                for (var i = 0; i < this.b.length; i++) {
                    elt = this.b[i];
                    fullbcount[elt] = difflib.__dictget(fullbcount, elt, 0) + 1;
                }
            }
            fullbcount = this.fullbcount;

            var avail = {};
            var availhas = difflib.__isindict(avail);
            var matches = numb = 0;
            for (var i = 0; i < this.a.length; i++) {
                elt = this.a[i];
                if (availhas(elt)) {
                    numb = avail[elt];
                } else {
                    numb = difflib.__dictget(fullbcount, elt, 0);
                }
                avail[elt] = numb - 1;
                if (numb > 0) matches++;
            }

            return difflib.__calculate_ratio(matches, this.a.length + this.b.length);
        }

        this.real_quick_ratio = function () {
            var la = this.a.length;
            var lb = this.b.length;
            return _calculate_ratio(Math.min(la, lb), la + lb);
        }

        this.isjunk = isjunk ? isjunk : difflib.defaultJunkFunction;
        this.a = this.b = null;
        this.set_seqs(a, b);
    },


  // Update text from stripped text.
  updateText: function(text, strippedText, newStrippedText) {
    // this.debugLog(newStrippedText);

    if (text == strippedText) {
        return newStrippedText;
    }

    var unstrip_opcodes = new difflib.SequenceMatcher(strippedText,
        text).get_opcodes();
    var update_opcodes = new difflib.SequenceMatcher(strippedText,
        newStrippedText).get_opcodes();
    var new_opcodes = new Array();

    // Decompose update_opcodes for new_opcodes.
    this.debugLog(update_opcodes);
    for (var i = 0; i < update_opcodes.length; ++i) {
        var update_opcode = update_opcodes[i];

        switch (update_opcode[0]) {
            case "replace":
                var j = update_opcode[1];
                var k = update_opcode[3];
                var len1 = update_opcode[2] - j;
                var len2 = update_opcode[4] - k;

                if (len1 < len2) {
                    for (; j < update_opcode[2]; ++j, ++k) {
                        new_opcodes.push(["replace", j, j + 1, k, k + 1]);
                    }
                    for (; k < update_opcode[4]; ++k) {
                        new_opcodes.push(["insert", j, j, k, k + 1]);
                    }
                } else {
                    for (; k < update_opcode[4]; ++j, ++k) {
                        new_opcodes.push(["replace", j, j + 1, k, k + 1]);
                    }
                    for (; j < update_opcode[2]; ++j) {
                        new_opcodes.push(["delete", j, j + 1, k, k]);
                    }
                }
                break;
            case "delete":
                for (var j = update_opcode[1], k = update_opcode[3];
                    j < update_opcode[2]; ++j) {
                    new_opcodes.push(["delete", j, j + 1, k, k]);
                }
                break;
            case "insert":
                for (var j = update_opcode[2], k = update_opcode[3];
                    k < update_opcode[4]; ++k) {
                    new_opcodes.push(["insert", j, j, k, k + 1]);
                }
                break;
            case "equal":
                break;
            default:
                ScriptLog("Unexpected opcode in difflib.updateText() (1): " +
                    update_opcode);
        }
    }
    this.debugLog(new_opcodes);

    var original_indexes = new Array(new_opcodes.length);
    for (var i = 0; i < new_opcodes.length; ++i) {
        original_indexes[i] = new_opcodes[i][2];
    }

    // Displace new_opcodes according to unstrip_opcodes.
    for (var i = 0; i < unstrip_opcodes.length; ++i) {
        var unstrip_opcode = unstrip_opcodes[i];
        switch (unstrip_opcode[0]) {
            case "insert":
                for (var j = new_opcodes.length - 1;
                    original_indexes[j] > unstrip_opcode[2]; --j) {
                    var d = (unstrip_opcode[4] - unstrip_opcode[3]) -
                        (unstrip_opcode[2] - unstrip_opcode[1]);
                    new_opcodes[j][1] += d;
                    new_opcodes[j][2] += d;
                }
                break;
            case "equal":
                break;
            default:
                ScriptLog("Unexpected opcode in difflib.updateText() (2): " +
                    unstrip_opcode);
        }
    }
    this.debugLog(new_opcodes);

    // Apply new_opcodes to text.
    for (var i = 0, d = 0; i < new_opcodes.length; ++i) {
        var new_opcode = new_opcodes[i];
        switch (new_opcode[0]) {
            case "delete":
            case "insert":
            case "replace":
                text = text.slice(0, new_opcode[1] + d) +
                    newStrippedText.slice(new_opcode[3], new_opcode[4]) +
                    text.slice(new_opcode[2] + d);
                d += (new_opcode[4] - new_opcode[3]) -
                    (new_opcode[2] - new_opcode[1]);
                break;
            case "equal":
                break;
            default:
                ScriptLog("Unexpected opcode in difflib.updateText() (3): " +
                    new_opcode);
        }
    }

    // Postprocessing
    text = text.replace(/(<\w[^>]*>)(\s+)/, "$2$1");
    text = text.replace(/(\s+)(<\/[^>]*>)/, "$2$1");
    text = text.replace(/(\S)(<\/[^>]*>|\{[^}]*\})(\S+)/, "$1$3$2");

    return text;
  }
}

difflib.debugLog = difflib.DEBUG ? ScriptLog : function() {};
