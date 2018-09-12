/**
 *  docomoapiutil.js
 *
 *  Copyright (c) 2018 Hiroaki Wada
 *
 *  This software is released under the MIT License.
 *  http://opensource.org/licenses/mit-license.php
 */
/**
 * DocomoDeveloperApiを扱うクラス
 */
var DOCOMO_DEVELOPER_API_KEY = PropertiesService.getScriptProperties().getProperty(
  'DOCOMO_DEVELOPER_API_KEY'
);

/**
 * キャラクタ変換APIで使う方言コードのセット
 */
var dialects = {
  愛媛弁: 'ehime3',
  関西弁: 'kansai',
  博多弁: 'hakata',
  福島弁: 'fukushima',
  三重弁: 'mie',
  舞妓風: 'maiko',
  お嬢様風: 'ojo',
  武士風: 'bushi',
  ギャル風: 'gyaru',
  標準語: ''
};

/**
 * 自然対話用ユーザ登録を行う
 * ※登録済の場合はPropertiesサービスから取得
 *
 * @param {string} ユーザID(ユニークキー)
 * @return {string} ユーザID(DOCOMO発行：自然対話用)
 */
function registUserInfoChatting(userId) {
  var propsRegistkey = userId + 'Chatting';
  var props = PropertiesService.getScriptProperties();
  var userAppId = props.getProperty(propsRegistkey);
  if (userAppId) {
    return userAppId;
  }

  //登録がなければAppId発行
  var apiUrl =
    'https://api.apigw.smt.docomo.ne.jp/naturalChatting/v1/registration?APIKEY=' +
    DOCOMO_DEVELOPER_API_KEY;
  var payload = {
    botId: 'Chatting',
    appKind: userId
  };

  var options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };

  var response = UrlFetchApp.fetch(apiUrl, options);
  var content = JSON.parse(response.getContentText());
  Logger.log(content.appId);

  props.setProperty(propsRegistkey, content.appId);
  return content.appId;
}

/**
 * 自然対話APIを呼び出す
 *
 * @param {string} ユーザID(ユニークキー)
 * @param {string} 送信メッセージ
 * @return {string} 応答メッセージ
 */
function getDialogueMessage(userId, userMessage) {
  var appId = registUserInfoChatting(userId);

  var dialogueUrl =
    'https://api.apigw.smt.docomo.ne.jp/naturalChatting/v1/dialogue?APIKEY=' +
    DOCOMO_DEVELOPER_API_KEY;

  var payload = {
    language: 'ja-JP',
    botId: 'Chatting',
    appId: appId,
    voiceText: userMessage,
    appRecvTime: Utilities.formatDate(
      new Date(),
      'Asia/Tokyo',
      'yyyyMMdd HH:mm:ss'
    ),
    appSendTime: Utilities.formatDate(
      new Date(),
      'Asia/Tokyo',
      'yyyyMMdd HH:mm:ss'
    )
  };

  var options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };

  var response = UrlFetchApp.fetch(dialogueUrl, options);
  var content = JSON.parse(response.getContentText());
  return content.systemText.expression;
}

/**
 * キャラクタ変換用ユーザ登録を行う
 * ※登録済の場合はPropertiesサービスから取得
 *
 * @param {string} ユーザID(ユニークキー)
 * @return {string} ユーザID(DOCOMO発行：キャラクタ変換用)
 */
function registUserInfoCharaConv(userId) {
  var propsRegistkey = userId + 'CharaConv';
  var props = PropertiesService.getScriptProperties();
  var userAppId = props.getProperty(propsRegistkey);
  if (userAppId) {
    return userAppId;
  }

  //登録がなければAppId発行
  var apiUrl =
    'https://api.apigw.smt.docomo.ne.jp/naturalCharaConv/v1/registration?APIKEY=' +
    DOCOMO_DEVELOPER_API_KEY;
  var payload = {
    botId: 'CharaConv',
    appKind: userId
  };

  var options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };

  var response = UrlFetchApp.fetch(apiUrl, options);
  var content = JSON.parse(response.getContentText());
  Logger.log(content.appId);

  props.setProperty(propsRegistkey, content.appId);
  return content.appId;
}

/**
 * キャラクタ変換APIを呼び出す
 *
 * @param {string} ユーザID(ユニークキー)
 * @param {string} 送信メッセージ
 * @return {string} 変換済メッセージ
 */
function getCharacterConvertMessage(userId, userMessage) {
  var appId = registUserInfoCharaConv(userId);

  var charaConvUrl =
    'https://api.apigw.smt.docomo.ne.jp/naturalChatting/v1/dialogue?APIKEY=' +
    DOCOMO_DEVELOPER_API_KEY;

  // 方言コードの取得
  var propsRegistkey = userId + 'CharaConvDialect';
  var props = PropertiesService.getScriptProperties();
  var dialectCd = props.getProperty(propsRegistkey);
  if (dialectCd === null) {
    dialectCd = '';
  }

  var payload = {
    language: 'ja-JP',
    botId: 'CharaConv',
    appId: appId,
    voiceText: userMessage,
    clientData: {
      option: {
        t: dialectCd
      }
    },
    appRecvTime: Utilities.formatDate(
      new Date(),
      'Asia/Tokyo',
      'yyyyMMdd HH:mm:ss'
    ),
    appSendTime: Utilities.formatDate(
      new Date(),
      'Asia/Tokyo',
      'yyyyMMdd HH:mm:ss'
    )
  };

  var options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };

  var response = UrlFetchApp.fetch(charaConvUrl, options);
  var content = JSON.parse(response.getContentText());
  return content.systemText.expression;
}

/**
 * キャラクタ変換APIで使う方言コードを登録する
 *
 * @param {string} ユーザID(ユニークキー)
 * @param {string} 方言コード
 * @return {string} 登録(済)方言コード
 */
function registDialect(userId, dialectCode) {
  var propsRegistkey = userId + 'CharaConvDialect';
  var props = PropertiesService.getScriptProperties();

  var registedDialectCode = props.getProperty(propsRegistkey);
  if (registedDialectCode) {
    if (registedDialectCode === dialectCode) {
      return registedDialectCode;
    }
  } else {
    if (!dialectCode) {
      return '';
    }
  }

  props.setProperty(propsRegistkey, dialectCode);
  return props.getProperty(propsRegistkey);
}
