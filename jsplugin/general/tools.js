/*
  Tools used by other plugins
  this file MUST be saved as UTF8 with BOM

  14 Nov 2008   refactored by thyresias at gmail dot com (www.calorifix.net)
*/

// ---------------------------------------------------------------------------
//  Reading speed definitions
// ---------------------------------------------------------------------------

// reading speeds must be compared after rounding to 1 decimal (to match what the user sees)
var RS_MIN = 5;   // min authorized speed
var RS_MAX = 35;  // max authorized speed

// parameters for a "pro" distribution
var RS_MEAN = 20;
var RS_STD = 4.6;

// note: max is excluded from the rating range, min is included
// these objects are updated at the end of this file,
// once the ncdf() function has been defined.
var RS_RATINGS = [
  { index: 0, max_per_s: 5,        symbol: '!---', text: 'TOO SLOW!'},
  { index: 1, max_per_s: 10,       symbol: '---',  text: 'Slow, acceptable.'},
  { index: 2, max_per_s: 13,       symbol: '--',   text: 'A bit slow.'},
  { index: 3, max_per_s: 15,       symbol: '-',    text: 'Good.'},
  { index: 4, max_per_s: 23,       symbol: '=',    text: 'Perfect.'},
  { index: 5, max_per_s: 27,       symbol: '+',    text: 'Good.'},
  { index: 6, max_per_s: 31,       symbol: '++',   text: 'A bit fast.'},
  { index: 7, max_per_s: 35.1,     symbol: '+++',  text: 'Fast, acceptable.'},
  { index: 8, max_per_s: Infinity, symbol: '!+++', text: 'TOO FAST!'}
];

// characters for observed & expected on histograms
var OBS = "■"; // ░ ▒ ▓ █
var EXP = "□"; // ■ □

// max width of output in the log window
var MAX_LOG_WIDTH = 100;

// ---------------------------------------------------------------------------
//  Utility objects
// ---------------------------------------------------------------------------

function Duration(milliseconds) {
  this.exact_ms = Math.round(milliseconds);
  this.rounded_s = round1(milliseconds / 1000);
}

function Speed(length, duration_ms) {
  this.exact_per_ms = length / duration_ms;
  this.rounded_per_s = round1(this.exact_per_ms * 1000);
}

// HLS object for the color with the specified RGB color (integer).
// The hue is in the range [0, 360[
// The saturation & lightness are in the range [0, 1]
function HLSColor(rgb) {

  var red   = (rgb & 0xFF0000) >> 16;
  var green = (rgb & 0x00FF00) >> 8;
  var blue  = (rgb & 0x0000FF);

  var r = red / 255;
  var g = green / 255;
  var b = blue / 255;

  // lightness
  var max = r > g ? r : g;
  if (b > max) max = b;
  var min = r < g ? r : g;
  if (b < min) min = b;

  var l = (max + min) / 2;

  // hue & saturation
  var h, s;

  if (max == min) {
    // red = green = blue: a shade of grey
    s = 0;
    h = 0; // actually undefined
  }
  else {
    var delta = max - min;
    // saturation
    if (l <= 0.5)   s = delta / (max + min);
    else            s = delta / (2 - max - min);
    // hue
    if (r == max)       h = (g - b) / delta;
    else if (g == max)  h = (b - r) / delta + 2;
    else                h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
    if (h >= 360) h -= 360;
  }

  this.hue = h;
  this.lightness = l;
  this.saturation = s;

}

// Returns the RGB color (integer) of an HLS color object.
HLSColor.prototype.toRGB = function() {
  var s = this.saturation;
  var l = this.lightness;
  var r, g, b;
  if (s == 0) {
    r = Math.round(l * 255);
    g = Math.round(l * 255);
    b = Math.round(l * 255);
  }
  else {
    var v2 = l < 0.5 ? l * (1 + s) : l + s - s * l;
    var v1 = 2 * l - v2;
    var h = this.hue;
    r = hrgb(v1, v2, h + 120);
    g = hrgb(v1, v2, h);
    b = hrgb(v1, v2, h - 120);
  }
  return (r << 16) | (g << 8) | b;
}

// utility function
function hrgb(v1, v2, v3) {
  v3 /= 360;
  if (v3 < 0) v3 += 1;
  if (v3 > 1) v3 -= 1;
  var c;
  if (6*v3 < 1)       c = v1 + (v2 - v1) * 6 * v3;
  else if (2*v3 < 1)  c = v2;
  else if (3*v3 < 2)  c = v1 + (v2 - v1 ) * (2/3 - v3) * 6;
  else                c = v1;
  return Math.round(c * 255);
}

// ---------------------------------------------------------------------------
//  Global functions
// ---------------------------------------------------------------------------

// Round a number to 1 decimal
// e.g., 1.23 => 1.2
function round1(aValue) {
  return Math.round(aValue * 10) / 10;
}

// pad a string on the right up to the given length, with the given character
function padRight(string, length, pad) {
  while (string.length < length)
    string += pad;
  return string;
}

// pad to the left (right-align)
function padLeft(string, length, pad) {
  while (string.length < length)
    string = pad + string;
  return string;
}

// output title in the log window
function logTitle(text) {
  ScriptLog(padRight("=== " + text + " ", MAX_LOG_WIDTH, "="));
}

// Returns the duration of the subtitle as a Duration object
function duration(sub) {
  return new Duration(sub.Stop - sub.Start);
}

// Returns the reading speed for the subtitle as a Speed object
function readingSpeed(sub) {
  var readingTime = sub.Stop - sub.Start - 500;
  if (readingTime <= 0) return new Speed(1, 0); // +Infinity
  return new Speed(sub.StrippedText.length, readingTime);
}

// Returns the reading speed rating for this subtitle.
function readingSpeedRating(sub) {
  var rs = readingSpeed(sub).rounded_per_s;
  for (var i = 0; i < RS_RATINGS.length-1; i++)
    if (rs < RS_RATINGS[i].max_per_s)
      return RS_RATINGS[i];
  return RS_RATINGS[RS_RATINGS.length - 1];
}

// Returns the reading speed as an RGB color
// (the same HLS object is reused between calls)

var RS_COLOR = new HLSColor(0x99FF99);  // light green: sets the saturation & lightness
var HUE_FOR_MIN = 240;  // blue
var HUE_FOR_MAX = 0;    // red
var HUE_FACTOR = (HUE_FOR_MAX - HUE_FOR_MIN) / (RS_MAX - RS_MIN);

function readingSpeedColor(sub) {
  var rs = readingSpeed(sub).exact_per_ms * 1000;
  if (rs < RS_MIN) rs = RS_MIN;
  else if (rs > RS_MAX) rs = RS_MAX;
  RS_COLOR.hue = Math.round(HUE_FOR_MIN + (rs - RS_MIN) * HUE_FACTOR);
  return RS_COLOR.toRGB();
}

// Returns the "ideal" duration for a subtitle as a Duration object.
// It corresponds to the ideal reading speed (pro is 17-18) set in the UI.
function idealDuration(sub) {
  return new Duration(Math.round(500 + sub.StrippedText.length / VSSCore.CpsTarget * 1000));
}

// Normal Cumulative Distribution Function
// Returns Probability(X <= z), where X follows a normal (gaussian) law
// with mean = 0 and standard deviation = 1.
function ncdf(z) {

  const p0 = 220.2068679123761;
  const p1 = 221.2135961699311;
  const p2 = 112.0792914978709;
  const p3 = 33.91286607838300;
  const p4 = 6.373962203531650;
  const p5 = .7003830644436881;
  const p6 = .3526249659989109E-01;

  const q0 = 440.4137358247522;
  const q1 = 793.8265125199484;
  const q2 = 637.3336333788311;
  const q3 = 296.5642487796737;
  const q4 = 86.78073220294608;
  const q5 = 16.06417757920695;
  const q6 = 1.755667163182642;
  const q7 = .8838834764831844E-1;

  const cutoff = 7.071;
  const root2pi = 2.506628274631001;

  // |z| > 37

  if (z > 37.0)  return 1;
  if (z < -37.0) return 0;

  // |z| <= 37.

  var zabs = Math.abs(z);
  var expn = Math.exp(-0.5 * zabs * zabs);
  var pdf = expn / root2pi;
  var p;

  // |z| < cutoff = 10/sqrt(2).
  if (zabs < cutoff)
    p = expn *
       ((((((p6  * zabs + p5) * zabs + p4) * zabs + p3) * zabs + p2) * zabs + p1) * zabs + p0) /
       (((((((q7*zabs + q6) * zabs + q5) * zabs + q4) * zabs + q3) * zabs + q2) * zabs + q1) * zabs + q0);
  else
    p = pdf / (zabs + 1 / (zabs + 2 / (zabs + 3 / (zabs + 4 / (zabs + 0.65)))));

  if (z < 0)  return p;
  else        return 1 - p;

}

// ---------------------------------------------------------------------------
//  Update reading speed ratings
// ---------------------------------------------------------------------------

function normalized(rs) {
  return (rs - RS_MEAN) / RS_STD;
}

function addRSProbas() {
  var prev = 0;
  // Probability(min < RS < max)
  for (var i = 0; i < RS_RATINGS.length - 1; i++) {
    var cur = ncdf(normalized(RS_RATINGS[i].max_per_s));
    RS_RATINGS[i].proba = cur - prev;
    prev = cur;
  }
  // Probability(RS > RS_MAX)
  RS_RATINGS[RS_RATINGS.length-1].proba = 1 - prev;
  // move "too slow" & "too fast" to accepted values
  RS_RATINGS[1].proba += RS_RATINGS[0].proba;
  RS_RATINGS[0].proba = 0;
  RS_RATINGS[RS_RATINGS.length-2].proba += RS_RATINGS[RS_RATINGS.length-1].proba;
  RS_RATINGS[RS_RATINGS.length-1].proba = 0;
}

addRSProbas();