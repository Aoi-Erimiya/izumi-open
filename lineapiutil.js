/**
 *  lineapiutil.js
 *
 *  Copyright (c) 2018 Hiroaki Wada
 *
 *  This software is released under the MIT License.
 *  http://opensource.org/licenses/mit-license.php
 */
/**
 * LineApiを扱うクラス
 */
var LINE_CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty(
  'LINE_CHANNEL_ACCESS_TOKEN'
);

/**
 * ユーザー情報を取得する
 *
 * @param {string} userId(groupIdは不可)
 * @return {JSON} API呼び出し結果
 */
function getProfile(userId) {
  var userProfile = UrlFetchApp.fetch(
    'https://api.line.me/v2/bot/profile/' + userId,
    {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        Authorization: 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
      },
      method: 'get'
    }
  );

  return userProfile;
}

/**
 * 能動的にトークを送信する
 *
 * @param {string} 送信メッセージ
 * @param {string} 送信先のuserIdまたはgroupId
 * @return {TextOutput} API呼び出し結果
 */
function push(msg, sendId) {
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
    },
    method: 'post',
    payload: JSON.stringify({
      to: sendId,
      messages: [
        {
          type: 'text',
          text: msg
        }
      ]
    })
  });

  return ContentService.createTextOutput(
    JSON.stringify({
      content: 'post ok'
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * リプライ用クラス
 *
 * @param {string} リプライトークン
 */
LineUtility = function(replyToken) {
  this.replyToken = replyToken;
};

/**
 * 受信トークに返信する
 *
 * @param {string} 送信メッセージ
 * @return {TextOutput} API呼び出し結果
 */
LineUtility.prototype.reply = function(msg) {
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
    },
    method: 'post',
    payload: JSON.stringify({
      replyToken: this.replyToken,
      messages: [
        {
          type: 'text',
          text: msg
        }
      ]
    })
  });

  return ContentService.createTextOutput(
    JSON.stringify({
      content: 'post ok'
    })
  ).setMimeType(ContentService.MimeType.JSON);
};

/**
 * 受信トークにランダムにスタンプを返す
 *
 * @return {TextOutput} API呼び出し結果
 */
LineUtility.prototype.replyStamp = function() {
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
    },
    method: 'post',
    payload: JSON.stringify({
      replyToken: this.replyToken,
      messages: [
        {
          type: 'sticker',
          packageId: '3',
          stickerId: getRandomInt(180, 220)
        }
      ]
    })
  });

  return ContentService.createTextOutput(
    JSON.stringify({
      content: 'post ok'
    })
  ).setMimeType(ContentService.MimeType.JSON);
};

/**
 * 受信トークに画像を返す
 *
 * @param {string} 表示用画像URL(1024*1024,1MB以下)
 * @param {string} プレビュー用画像URL(240*240,1MB以下)
 * @return {TextOutput} API呼び出し結果
 */
LineUtility.prototype.replyImage = function(
  originalContentUrl,
  previewImageUrl
) {
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
    },
    method: 'post',
    payload: JSON.stringify({
      replyToken: this.replyToken,
      messages: [
        {
          type: 'image',
          originalContentUrl: originalContentUrl,
          previewImageUrl: previewImageUrl
        }
      ]
    })
  });

  return ContentService.createTextOutput(
    JSON.stringify({
      content: 'post ok'
    })
  ).setMimeType(ContentService.MimeType.JSON);
};
