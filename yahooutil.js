/**
 *  yahooutil.js
 *
 *  Copyright (c) 2018 Hiroaki Wada
 *
 *  This software is released under the MIT License.
 *  http://opensource.org/licenses/mit-license.php
 */

/**
 * Yahoo占いで使う12星座のセット
 */
var Astro12 = {
  おひつじ: 'aries',
  おうし: 'taurus',
  ふたご: 'gemini',
  かに: 'cancer',
  しし: 'leo',
  おとめ: 'virgo',
  てんびん: 'libra',
  さそり: 'scorpio',
  いて: 'sagittarius',
  やぎ: 'capricorn',
  みずがめ: 'aquarius',
  うお: 'pisces'
};

/**
 * 星座占い情報を返却
 *
 * @return {string} 本日の星座占い情報
 */
function get12AstroDivination(message) {
  // 星座解析
  var astroCd = findHashKey(Astro12, message);
  if (!astroCd) {
    return null;
  }
  return fetchParseAstro12('https://fortune.yahoo.co.jp/12astro/' + astroCd);
}

/**
 * 星座占い情報を取得
 *
 * @return {string} 抽出文字列
 */
function fetchParseAstro12(url) {
  var splitedArray = fetchURLfromEUC(url);
  var splitedArrayLength = splitedArray.length;
  var resultArray = [];
  // ほしい情報のみ抽出
  for (var i = 0; i < splitedArrayLength; i++) {
    if (
      splitedArray[i].indexOf('og:title') > -1 ||
      splitedArray[i].indexOf('og:description') > -1
    ) {
      resultArray.push(splitedArray[i]);
    }
    // 2行取れればいいので、あとは無視
    if (resultArray.length > 1) {
      break;
    }
  }

  var resultString = '';
  var resultArrayLength = resultArray.length;
  for (var i = 0; i < resultArrayLength; i++) {
    resultString += resultArray[i]
      .replace('">', '')
      .replace('<meta property="og:title" content="', '')
      .replace('<meta property="og:description" content="', '')
      .trim();
    resultString += '\n';
  }

  return resultString.trim();
}
