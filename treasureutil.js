/**
 *  treasureutil.js
 *
 *  Copyright (c) 2018 Hiroaki Wada
 *
 *  This software is released under the MIT License.
 *  http://opensource.org/licenses/mit-license.php
 */
/**
 * 家計簿テーブルを集計する
 *
 * @param {number} 集計月
 * @return {object} 集計結果
 */
function selectHouseholdAccountBook(month) {
  //月初を取得
  var startDt = new Date();
  startDt.setMonth(month - 1);
  startDt.setDate(1);

  //月末を取得
  var endDt = new Date();
  endDt.setDate(1);
  endDt.setMonth(month);
  endDt.setDate(0);

  var sql =
    'SELECT SUM(Place) FROM ' +
    PropertiesService.getScriptProperties().getProperty(
      'TREASURE_SPREADSHEET_ID'
    ) +
    " WHERE Date >= '" +
    startDt.toISOString() +
    "' AND Date <= '" +
    endDt.toISOString() +
    "';";
  return FusionTables.Query.sqlGet(sql);
}

/**
 * 家計簿テーブルに登録する
 *
 * @param {string} 分類名
 * @param {number} 価格
 */
function insertHouseholdAccountBook(kind, place) {
  //日付
  var dt = new Date();
  var sql =
    'INSERT INTO ' +
    PropertiesService.getScriptProperties().getProperty(
      'TREASURE_SPREADSHEET_ID'
    ) +
    " (Date,Kind,Place) VALUES ('" +
    dt.toISOString() +
    "', '" +
    kind +
    "', " +
    place +
    ')';
  FusionTables.Query.sql(sql);
}
