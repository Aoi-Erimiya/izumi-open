/**
 *  work.js
 *
 *  Copyright (c) 2018 Hiroaki Wada
 *
 *  This software is released under the MIT License.
 *  http://opensource.org/licenses/mit-license.php
 */
/**
 * 行動パターン基底クラス
 * ※そのまま利用しない
 *
 */
Work = function(regPattern) {
  // 正規表現パターン
  this.regPattern = regPattern;
};

// パターンに一致するか確認
Work.prototype.isMatch = function(webhookEvent) {
  var userMessage = webhookEvent.getUserMessage();
  return this.regPattern.test(userMessage);
};

// パターン一致時の処理(オーバーライドする事)
Work.prototype.action = function(webhookEvent) {
  return '';
};

// パターン一致する場合に処理実施
Work.prototype.run = function(webhookEvent) {
  if (!this.isMatch(webhookEvent)) {
    return false;
  }
  this.action(webhookEvent);
  return true;
};

// LineUtilityを返す
Work.prototype.getLineUtility = function(webhookEvent) {
  return new LineUtility(webhookEvent.getReplyToken());
};

/**
 * 天気予報を返す
 *
 */
WeatherWork = function() {};

WeatherWork.prototype = new Work(/[帝都|大阪]の天気/);

WeatherWork.prototype.action = function(webhookEvent) {
  if (/帝都/.test(webhookEvent.getUserMessage())) {
    this.getLineUtility(webhookEvent).reply(getWeather(CITYCODE_TEITO));
  } else {
    this.getLineUtility(webhookEvent).reply(getWeather());
  }
};

/**
 * 時刻表を抽出して返す
 *
 */
DiagramWork = function() {};

DiagramWork.prototype = new Work(STATION_NAME_REG);

DiagramWork.prototype.action = function(webhookEvent) {
  var userMessage = webhookEvent.getUserMessage();
  //時刻指定があれば設定
  var hour = getNum(userMessage);
  this.getLineUtility(webhookEvent).reply(
    getDiagramSpreadSheet(getStationNm(userMessage), hour)
  );
};

/**
 * 経理シートに記載する
 *
 */
InsertHouseholdAccountBookWork = function() {};

InsertHouseholdAccountBookWork.prototype = new Work(/経理/);

InsertHouseholdAccountBookWork.prototype.action = function(webhookEvent) {
  //半角SP変換
  var userMessage = webhookEvent.getUserMessage().replace('　', ' ');
  var kind = userMessage.split(' ');
  var place = getNum(userMessage);
  insertHouseholdAccountBook(kind[1], place);
  this.getLineUtility(webhookEvent).reply(
    kind[1] + ':' + place + ' 記載完了です！'
  );
};

/**
 * 経理シートを集計して返す
 *
 */
SelectHouseholdAccountBookWork = function() {};

SelectHouseholdAccountBookWork.prototype = new Work(/月集計/);

SelectHouseholdAccountBookWork.prototype.action = function(webhookEvent) {
  var userMessage = webhookEvent.getUserMessage();
  var month = getNum(userMessage);
  var res = selectHouseholdAccountBook(month);
  var replyMessage = '';
  if (!typeof res.rows) {
    replyMessage = '集計データがありませんでした！';
  } else {
    replyMessage = month + '月の集計結果は' + res.rows[0][0] + 'です！';
  }
  this.getLineUtility(webhookEvent).reply(replyMessage);
};

/**
 * 方言を登録する(DocomoAPI依存)
 *
 */
ChangeDialectWork = function() {};

ChangeDialectWork.prototype = new Work(/でしゃべって|で話して/);

ChangeDialectWork.prototype.action = function(webhookEvent) {
  var userId = webhookEvent.getUserId();
  var userMessage = webhookEvent.getUserMessage();
  var replyMessage = '';
  var diarectCd = findHashKey(dialects, userMessage);
  if (!diarectCd) {
    replyMessage =
      '知らない方言かな(＞＜;)\n次のうちどれかで試してみて！\n' +
      enableKeyToString(dialects);
  } else {
    registDialect(userId, diarectCd);
    replyMessage = getCharacterConvertMessage(userId, 'わかった');
  }
  this.getLineUtility(webhookEvent).reply(replyMessage);
};

/**
 * 現状設定されている方言コードを返す(DocomoAPI依存)
 * ※開発用
 *
 */
NowDialectWork = function() {};

NowDialectWork.prototype = new Work(/今は何の方言？/);

NowDialectWork.prototype.action = function(webhookEvent) {
  var userId = webhookEvent.getUserId();
  this.getLineUtility(webhookEvent).reply('dialectCd:' + registDialect(userId));
};

/**
 * 自然会話・キャラクタ変換登録情報を返却(DocomoAPI依存)
 * ※開発用
 *
 */
CheckDocomoIdWork = function() {};

CheckDocomoIdWork.prototype = new Work(/ドコモのID教えて/);

CheckDocomoIdWork.prototype.action = function(webhookEvent) {
  var userId = webhookEvent.getUserId();
  this.getLineUtility(webhookEvent).reply(
    'chat:' +
      registUserInfoChatting(userId) +
      '\n' +
      'conv:' +
      registUserInfoCharaConv(userId)
  );
};

/**
 * 当月の惑星の動きを返す
 *
 */
MonthPlanetaryMotionWork = function() {};

MonthPlanetaryMotionWork.prototype = new Work(/惑星の動き/);

MonthPlanetaryMotionWork.prototype.action = function(webhookEvent) {
  this.getLineUtility(webhookEvent).reply(getPlanetaryMotion());
};

/**
 * 当日の天文イベントを返す
 *
 */
TodayAstronomWork = function() {};

TodayAstronomWork.prototype = new Work(/今日の天文イベント/);

TodayAstronomWork.prototype.action = function(webhookEvent) {
  var res = getTodayAstronomEvent();
  if (!res) {
    res = '本日は特別なイベントは何もないようです';
  }
  this.getLineUtility(webhookEvent).reply(res);
};

/**
 * 当月の天文イベントを返す
 *
 */
MonthAstronomWork = function() {};

MonthAstronomWork.prototype = new Work(/今月の天文イベント/);

MonthAstronomWork.prototype.action = function(webhookEvent) {
  this.getLineUtility(webhookEvent).reply(getMonthAstronomEvent());
};

/**
 * 当月の星空画像を返す
 *
 */
MonthStarrySkyWork = function() {};

MonthStarrySkyWork.prototype = new Work(/今月の星空/);

MonthStarrySkyWork.prototype.action = function(webhookEvent) {
  this.getLineUtility(webhookEvent).replyImage(
    makeMonthStarrySkyUrl(),
    makeMonthStarrySkyPreviewUrl()
  );
};

/**
 * 星座占いを取得する(Yahoo依存)
 *
 */
AstroDivinationWork = function() {};

AstroDivinationWork.prototype = new Work(/座の運勢/);

AstroDivinationWork.prototype.action = function(webhookEvent) {
  var userMessage = webhookEvent.getUserMessage();
  var replyMessage = get12AstroDivination(userMessage);
  if (!replyMessage) {
    replyMessage =
      '知らない星座かな(＞＜;)\n次の12星座のどれかで試してみて！\n' +
      enableKeyToString(Astro12);
  }
  this.getLineUtility(webhookEvent).reply(replyMessage);
};

/**
 * 何かしらの応答を返す(DocomoAPI依存)
 *
 */
ReactionTalkWork = function() {};
// すべてにマッチ
ReactionTalkWork.prototype = new Work(/./);

ReactionTalkWork.prototype.action = function(webhookEvent) {
  var userId = webhookEvent.getUserId();
  var userMessage = webhookEvent.getUserMessage();
  this.getLineUtility(webhookEvent).reply(
    getCharacterConvertMessage(userId, getDialogueMessage(userId, userMessage))
  );
};

/**
 * グループ追加された時にメールする
 *
 */
ReportAdminWorkCauseByGroupJoin = function() {};

ReportAdminWorkCauseByGroupJoin.prototype = new Work(
  /ReportAdminWorkCauseByGroupJoin/
);

ReportAdminWorkCauseByGroupJoin.prototype.action = function(webhookEvent) {
  var groupId = webhookEvent.getGroupId();
  PropertiesService.getScriptProperties().setProperty('JOIN_GROUP_ID', groupId);

  sendAdministratorNotifyMail('グループ追加', 'groupID:' + groupId);
};

/**
 * フォロー／アンフォロー時にメールする
 *
 */
ReportAdminWorkCauseByFollowed = function() {};

ReportAdminWorkCauseByFollowed.prototype = new Work(
  /ReportAdminWorkCauseByFollowed/
);

ReportAdminWorkCauseByFollowed.prototype.action = function(webhookEvent) {
  var userId = webhookEvent.getUserId();
  var userName = JSON.parse(getProfile(userId)).displayName;
  sendAdministratorNotifyMail(
    'ユーザー追加',
    'userId:' + userId + '<br />' + 'userName:' + userName
  );
};

/**
 * 1対1(個別トーク)の会話対応
 *
 */
ReceptionWorkOnetoOne = function() {};

ReceptionWorkOnetoOne.prototype = new Work(/ReceptionWorkOnetoOne/);

ReceptionWorkOnetoOne.prototype.action = function(webhookEvent) {
  // テキスト以外は反応しないようにする
  if (webhookEvent.isTextMessage()) {
    selectExecutionWork(makeReceptionOnetoOneWorkPatterns(), webhookEvent);
  } else {
    if (webhookEvent.isStampMessage()) {
      this.getLineUtility(webhookEvent).replyStamp();
    } else if (webhookEvent.isLocationMessage()) {
      this.getLineUtility(webhookEvent).reply('そこに何があるんですか？');
    } else {
      this.getLineUtility(webhookEvent).reply(
        '制限かかってて、画像とか動画とか見れないんです(＞A＜；\n文字で説明してもらえると嬉しいかも！'
      );
    }
  }
};

/**
 * 1対N(グループ)の会話対応
 *
 */
ReceptionWorkOnetoN = function() {};

ReceptionWorkOnetoN.prototype = new Work(/ReceptionWorkOnetoN/);

ReceptionWorkOnetoN.prototype.action = function(webhookEvent) {
  var userMessage = webhookEvent.getUserMessage();
};
