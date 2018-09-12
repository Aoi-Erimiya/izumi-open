/**
 *  diagramutil.js
 *
 *  Copyright (c) 2018 Hiroaki Wada
 *
 *  This software is released under the MIT License.
 *  http://opensource.org/licenses/mit-license.php
 */
/**
 * SpreadSheetに記載した時刻表を扱うクラス
 */

var STATION_NAME_REG = /京橋|大阪|天王寺/;

/**
 * スプレッドシートから時刻表を取得する
 * 時刻指定がなければ現在時刻で取得
 *
 * @param {string} 駅名
 * @param {number} 時間(オプション)
 * @return {string} 指定時間の時刻表
 */
function getDiagramSpreadSheet(stationNm, hour) {
  var spreadsheet = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties().getProperty(
      'DIAGRAM_SPREADSHEET_ID'
    )
  );
  var dt = new Date();
  if (!hour) {
    hour = dt.getHours();
  }
  var sheetNm = convStNm(stationNm) + getDiagramKind(dt);
  var sheet = spreadsheet.getSheetByName(sheetNm);

  //時刻行を取得
  var rowNum = findRow(sheet, hour, 1);
  if (rowNum === 0) {
    return '指定時刻の列車はないみたいです。';
  }

  //Z以降(1h中に26本以上の列車はない前提)
  var range = sheet.getRange(rowNum, 2, 2, 26);
  var values = range.getValues();

  var dia = convStNm(stationNm) + '方面の' + hour + '時の時刻表です。\n';
  for (var i = 1; i < 26; i++) {
    for (var j = 0; j < 2; j++) {
      if (values[j][i] != null) {
        dia += values[j][i];
      }
    }
  }
  return dia;
}

/**
 * 駅によって上り下りを判断して付与
 * ※シート名の仕様に合わせる
 *
 * @param {string} 駅名
 * @return {string} シート名
 */
function convStNm(stationNm) {
  if (stationNm === '京橋' || stationNm === '天王寺') {
    stationNm += '(下)';
  } else {
    stationNm += '(上)';
  }

  return stationNm;
}

/**
 * 駅名を取得する
 *
 * @param {string} 検索対象文字列
 * @return {string} 抽出した駅名
 */
function getStationNm(str) {
  var resultArray = STATION_NAME_REG.exec(str);

  if (!resultArray) {
    return '';
  }
  return resultArray[0];
}

/**
 * ダイヤ種別を取得する
 * 休日用は「土」で統一
 *
 * @param {date} 日付クラス
 * @return {string} ダイヤ種別
 */
function getDiagramKind(dt) {
  //曜日
  //日曜が0、土曜日が6。配列を使い曜日に変換する。
  var dateT = ['土', '平', '平', '平', '平', '平', '土'];
  return dateT[dt.getDay()];
}
