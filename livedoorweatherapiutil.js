/**
 *  livedoorweahterapiutil.js
 *
 *  Copyright (c) 2018 Hiroaki Wada
 *
 *  This software is released under the MIT License.
 *  http://opensource.org/licenses/mit-license.php
 */
/**
 * livedoorのお天気APIをコール
 */

var CITYCODE_OSAKA = '270000';
var CITYCODE_TEITO = '130010';

/**
 * 天気情報を取得する
 * cityCode省略時は大阪の天気を取得。
 *
 * @param {string} 地域コード(大阪:270000 帝都:130010)
 * @return {string} 天気予報メッセージ
 */
function getWeather(cityCode) {
  if (!cityCode) {
    cityCode = CITYCODE_OSAKA;
  }

  var url =
    'http://weather.livedoor.com/forecast/webservice/json/v1?city=' + cityCode;

  var response = UrlFetchApp.fetch(url);
  var content = JSON.parse(response.getContentText());

  var weatherMesOrd =
    '今日の天気は、' +
    content.forecasts[0].telop +
    getTemperature(content, 0) +
    '明日の天気は、' +
    content.forecasts[1].telop +
    getTemperature(content, 1) +
    content.description.text;

  //整形する
  var weatherMes = weatherMesOrd
    .replace(/ /g, '')
    .replace(/\r?\n/g, '')
    .replace(/。/g, '。\n');

  return weatherMes;
}

/**
 * 最高気温と最低気温を切り出す
 *
 * @param {string} JSON
 * @param {string} 取得するデータのインデックス(0:今日　1:明日)
 * @return {string} 整形済みメッセージ
 */
function getTemperature(content, index) {
  var tmperatureMes = '';

  if (!content.forecasts[index].temperature.max) {
    return tmperatureMes;
  }

  tmperatureMes =
    '、最高気温' + content.forecasts[index].temperature.max.celsius + '℃';

  if (!content.forecasts[0].temperature.min) {
    return tmperatureMes + '。';
  }

  tmperatureMes =
    '、最低気温' + content.forecasts[index].temperature.min.celsius + '℃。';

  return tmperatureMes;
}
