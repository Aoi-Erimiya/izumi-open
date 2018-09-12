/**
 *  main.js
 *
 *  Copyright (c) 2018 Hiroaki Wada
 *
 *  This software is released under the MIT License.
 *  http://opensource.org/licenses/mit-license.php
 */
/**
 * Lineからの通知を受け取って応答する
 *
 * @param {string} 受信データ(JSON)
 */
function doPost(event) {
  var izumi = new Izumi();
  izumi.run(event);

  return ContentService.createTextOutput(
    JSON.stringify({
      content: 'post ok'
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 管理者にメール送信
 *
 * @param {string} 件名
 * @param {string} 本文
 */
function sendAdministratorNotifyMail(subject, mailBody) {
  GmailApp.sendEmail(
    PropertiesService.getScriptProperties().getProperty(
      'ADMINISTRATOR_EMAILADRESS'
    ),
    '和泉bot:' + subject,
    mailBody
  );
}

/**
 * 天気情報を自動配信
 *
 * @param {string} 受信データ(JSON)
 */
function postAutoMorning(e) {
  var adminUserId = PropertiesService.getScriptProperties().getProperty(
    'ADMINISTRATOR_USERID'
  );
  push(getWeather(), adminUserId);

  return ContentService.createTextOutput(
    JSON.stringify({
      content: 'post ok'
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 本日の天文イベントを自動配信
 */
function autoPostTodayAstronomEvent() {
  var res = getTodayAstronomEvent();
  if (!res) {
    return;
  }
  var adminUserId = PropertiesService.getScriptProperties().getProperty(
    'ADMINISTRATOR_USERID'
  );
  push(res, adminUserId);
}
