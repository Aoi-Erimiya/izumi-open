/**
 *  spaceutil.js
 *
 *  Copyright (c) 2018 Hiroaki Wada
 *
 *  This software is released under the MIT License.
 *  http://opensource.org/licenses/mit-license.php
 */
/**
 * NASAのRSSを整形
 *
 * @param {string} パース済みRSS
 * @return {string} 整形済文字列
 */
function cleanUpRSSofNASA(formatedRSSofNASA) {
  // ヘッダの「<channel> 」までを削除
  var channelTag = '<channel> ';
  var channelTagIndex =
    formatedRSSofNASA.indexOf(channelTag) + channelTag.length;
  // <title>の前にくっついてくる「<item> 」を除去
  return formatedRSSofNASA.slice(channelTagIndex).replace(/\<item\> /g, '');
}

/**
 * 国立天文台のATOMを整形
 *
 * @param {string} パース済みATOM
 * @return {string} 整形済文字列
 */
function cleanUpATOMofNAOJ(formatedRSSofNAOJ) {
  var linkTagStartReg = /\<link rel.+ href\=\"/g;
  var linkTagEndReg = /\" \/\>/g;

  // <link rel..>を除去
  // <title>の「 - ニュース」を除去
  return formatedRSSofNAOJ
    .replace(linkTagStartReg, '')
    .replace(linkTagEndReg, '')
    .replace(/ \- ニュース/g, '');
}

/**
 * RSSまたはATOM情報を取得
 * titleとlink情報だけ抽出する
 *
 * @param {string} RSS/ATOMのURL
 * @return {string} 抽出文字列
 */
function fetchParseRSS(url) {
  var splitedArray = fetchURL(url);
  var splitedArrayLength = splitedArray.length;
  var resultArray = [];
  for (var i = 0; i < splitedArrayLength; i++) {
    if (
      splitedArray[i].indexOf('/title') > 0 ||
      splitedArray[i].indexOf('/link') > 0 ||
      splitedArray[i].indexOf('link rel=') > 0
    ) {
      resultArray.push(splitedArray[i]);
    }
  }

  var resultArrayLength = resultArray.length;
  var resultString = '';
  for (var i = 0; i < resultArrayLength; i++) {
    resultString +=
      resultArray[i]
        .replace(/\<title\>|\<\/title\>/g, '')
        .replace(/\<link\>|\<\/link\>/g, '')
        .trim() + '\n';
    if (resultArray[i].indexOf('/link') > 0) {
      resultString += '\n';
    }
  }
  return resultString;
}

/**
 * 当年当月の天文情報URLを返却
 *
 * @return {string} 天文情報URL
 */
function makeMonthAstroSkyUrl() {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;

  return (
    'https://www.nao.ac.jp/astro/sky/' +
    year +
    '/' +
    LPad(month, 0, 2) +
    '.html'
  );
}

/**
 * 当月の星空画像URLを返却
 *
 * @return {string} 星空画像URL
 */
function makeMonthStarrySkyUrl() {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  return (
    'https://www.nao.ac.jp/contents/astro/sky/' +
    year +
    '/' +
    LPad(month, 0, 2) +
    '/sky-m.jpg'
  );
}

/**
 * 星空画像(プレビュー用)URLを返却
 *
 * @return {string} 星空画像URL
 */
function makeMonthStarrySkyPreviewUrl() {
  return 'https://lh4.googleusercontent.com/Yhjz5d5pr6Y6CIEyD4QhWTgUD2trylUYQIgYD2YFoYH2yTDbBEPtBdORPanmLFwrcXxgMKmTmEawrMsp5I7Q=w1360-h646';
}

/**
 * 当日の天文イベントを返却
 * イベントがない場合はnullを返却する
 *
 * @return {string} 当日の天体情報
 */
function getTodayAstronomEvent() {
  var todayAstronomEvent = fetchParseCalenderOfNAOJ(makeMonthAstroSkyUrl())[
    new Date().getDate()
  ];
  if (!todayAstronomEvent) {
    return null;
  }

  return '本日は' + todayAstronomEvent;
}

/**
 * 当月の天文イベントを返却
 *
 * @return {string} 当月の天体情報
 */
function getMonthAstronomEvent() {
  var astronomEventHash = fetchParseCalenderOfNAOJ(makeMonthAstroSkyUrl());
  var resultString = '';
  for (var day = 1; day <= 31; day++) {
    var todayAstronomEvent = astronomEventHash[day];
    if (!todayAstronomEvent) {
      continue;
    }
    resultString += todayAstronomEvent;
  }
  return resultString;
}

/**
 * 当月の天文イベントを取得
 *
 * @return {object} 日付をキーとした連想配列
 */
function fetchParseCalenderOfNAOJ(url) {
  var splitedArray = fetchURL(url);
  var splitedArrayLength = splitedArray.length;
  var resultArray = [];
  // td情報のみ抽出
  for (var i = 0; i < splitedArrayLength; i++) {
    if (splitedArray[i].indexOf('/td') > 0) {
      resultArray.push(splitedArray[i]);
    }
  }

  var resultHash = {};
  var resultArrayLength = resultArray.length;
  for (var i = 0; i < resultArrayLength; i++) {
    // 参照リンクがある場合は、URLのみ残して除去する
    var resultString =
      resultArray[i]
        .replace('<td class="cell-date">', '本日は')
        .replace(/\<td\>/g, '')
        .replace('</td>', '、')
        .replace('</td>', 'となります。')
        .replace(/\<a href\=\"/g, '')
        .replace(/\".+\<\/a\>/g, '')
        .trim() + '\n';
    resultHash[getNum(resultString)] = resultString;
  }
  return resultHash;
}

/**
 * 当月の惑星の動き情報を返却
 *
 * @return {string} 当月の惑星の動き情報
 */
function getPlanetaryMotion() {
  return fetchParsePlanetaryMotion(makeMonthAstroSkyUrl());
}

/**
 * 当月の惑星の動き情報を取得
 *
 * @return {string} 抽出文字列
 */
function fetchParsePlanetaryMotion(url) {
  var splitedArray = fetchURL(url);
  var splitedArrayLength = splitedArray.length;
  var resultArray = [];
  // dt,dd情報のみ抽出
  for (var i = 0; i < splitedArrayLength; i++) {
    if (
      splitedArray[i].indexOf('<dt>') > 0 ||
      splitedArray[i].indexOf('<dd>') > 0
    ) {
      resultArray.push(splitedArray[i]);
    }
  }

  var resultString = '';
  var resultArrayLength = resultArray.length;
  for (var i = 0; i < resultArrayLength; i++) {
    resultString += resultArray[i]
      .replace('<dt>', '')
      .replace('</dt>', 'は、')
      .replace('<dd>', '')
      .replace('</dd>', '')
      .trim();

    if (resultArray[i].indexOf('</dd>') > 0) {
      resultString += '\n\n';
    }
  }

  return resultString.trim();
}
