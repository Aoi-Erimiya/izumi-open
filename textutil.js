/**
 *  textutil.js
 *
 *  Copyright (c) 2018 Hiroaki Wada
 *
 *  This software is released under the MIT License.
 *  http://opensource.org/licenses/mit-license.php
 */
/**
 * JSに無いテキスト関数を扱う
 */

/**
 * 文字列中の数字を取得する
 *
 * @param {string} 検索文字列
 * @return {number} 抽出文字列
 */
function getNum(str) {
  var reg = /[0-9]+/;
  var resultArray = reg.exec(str);

  if (!resultArray) {
    return null;
  }
  return Number(resultArray[0]);
}

/**
 * スプレッドシート中の指定列を検索し
 * 条件に一致する行数を返却する
 * ※最初に条件に一致した1行のみ
 *
 * @param {sheet} 対象シート
 * @param {string} 検索値
 * @param {string} 指定列
 * @return {number} 一致行(ない場合は0)
 */
function findRow(sheet, val, col) {
  var dat = sheet.getDataRange().getValues(); //受け取ったシートのデータを二次元配列に取得

  for (var i = 1; i < dat.length; i++) {
    if (dat[i][col - 1] === val) {
      return i + 1;
    }
  }
  return 0;
}

/**
 * 小文字を大文字に変換する
 *
 * @param {string} 変換文字列
 * @return {string} 大文字文字列
 */
function HalfToFull(str) {
  if (str === '') {
    return str;
  }
  return String(str).replace(/[A-Za-z0-9]/g, function(s) {
    return String.fromCharCode(s.charCodeAt(0) + 65248);
  });
}

/**
 * MM月DD日の形式で文字列を生成する
 *
 * @param {date} 日付クラス
 * @return {string} MM月DD日
 */
function formatDay(dt) {
  return dt.getMonth() + 1 + '月' + dt.getDate() + '日';
}

/**
 * YYYY年MM月DD日の形式で文字列を生成する
 *
 * @param {date} 日付クラス
 * @return {string} YYYY年MM月DD日
 */
function formatFullDay(dt) {
  return (
    dt.getFullYear() + '年' + (dt.getMonth() + 1) + '月' + dt.getDate() + '日'
  );
}

/**
 * YYYY,MM,DDに相当する文字列を置換して返す
 *
 * @param {date} 日付クラス
 * @param {string} 変換文字列
 * @return {string} 置換後文字列
 */
function format(dt, str) {
  var YYYY = dt.getFullYear();
  var MM = dt.getMonth() + 1;
  var DD = dt.getDate();
  return str
    .replace(/YYYY/g, YYYY)
    .replace(/MM/g, MM)
    .replace(/DD/g, DD);
}

/**
 * 文字列をISO2022形式に変換する
 * ※メール用
 *
 * @param {string} 変換文字列
 * @return {string} iso-2022-jp文字列
 */
function convISO2022(str) {
  return Utilities.newBlob('')
    .setDataFromString(str, 'iso-2022-jp')
    .getDataAsString();
}

/**
 * 文字列末尾に任意の文字を付与
 *
 * @param {string} 付与対象文字列
 * @param {string} 指定文字
 * @param {number} 指定文字の追加数
 * @return {string} 空白詰文字列
 */
function RPad(value, str, len) {
  var padStr = '';
  var addlen = 0;

  if (value == null) {
    addlen = len;
  } else {
    addlen = parseInt(len) - parseInt(String(value).length);
    padStr = String(value);
  }

  for (var i = 0; i < addlen; i++) {
    padStr = '' + padStr + str;
  }
  return padStr;
}

/**
 * 文字列先頭に任意の文字を付与
 *
 * @param {string} 付与対象文字列
 * @param {string} 指定文字
 * @param {number} 指定文字の追加数
 * @return {string} 空白詰文字列
 */
function LPad(value, str, len) {
  var padStr = '';
  var addlen = 0;

  if (value == null) {
    addlen = len;
  } else {
    addlen = parseInt(len) - parseInt(String(value).length);
    padStr = String(value);
  }

  for (var i = 0; i < addlen; i++) {
    padStr = '' + str + padStr;
  }
  return padStr;
}

/**
 * 指定範囲の乱数を返す(by.MDN)
 *
 * @param {number} ～以上
 * @param {number} ～未満
 * @return {string} 空白詰文字列
 */
function getRandomInt(min, max) {
  var min = Math.ceil(min);
  var max = Math.floor(max);
  //The maximum is exclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * 条件に一致するハッシュ値を取得する
 * 該当なしの場合、nullが返却される
 *
 * @param {hash} 検索条件が含まれるハッシュ
 * @param {string} 受信メッセージ
 * @return {string} ハッシュ値
 */
function findHashKey(targetHash, userMessage) {
  var hashKey = '';
  var regKeys = RegExp(enableKeyToString(targetHash).replace(/、/g, '|'), 'g');
  var matchingKeys = regKeys.exec(userMessage);

  if (matchingKeys === null) {
    hashKey = null;
  } else {
    // 複数Hitしても、先頭のみ採用
    hashKey = targetHash[matchingKeys[0]];
  }

  return hashKey;
}

/**
 * ハッシュキーの一覧を取得する
 *
 * @param {hash} 検索条件が含まれるハッシュ
 * @return {string} キー一覧(、区切り)
 */
function enableKeyToString(targetHash) {
  var enableKeys = '';
  for (var key in targetHash) {
    enableKeys += key + '、';
  }
  return enableKeys.slice(0, -1);
}

/**
 * 指定URLのWebページを取得
 *
 * @param {string} URL
 * @return {string} 取得結果の配列(改行区切り)
 */
function fetchURL(url) {
  var result = UrlFetchApp.fetch(url, {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    method: 'get'
  });
  return result.toString().split('\n');
}

/**
 * 指定URLのWebページを取得
 *
 * @param {string} URL
 * @return {string} 取得結果の配列(改行区切り)
 */
function fetchURLfromEUC(url) {
  var result = UrlFetchApp.fetch(url, {
    headers: {
      'Content-Type': 'application/json; charset=euc-jp'
    },
    method: 'get'
  }).getContentText('euc-jp');
  return result.toString().split('\n');
}
