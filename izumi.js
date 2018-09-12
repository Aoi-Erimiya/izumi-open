/**
 *  izumi.js
 *
 *  Copyright (c) 2018 Hiroaki Wada
 *
 *  This software is released under the MIT License.
 *  http://opensource.org/licenses/mit-license.php
 */
/**
 * Botプログラム
 */
Izumi = function() {};

/**
 * 受信イベントを受け取って処理する
 *
 * @param {string} 受信データ(JSON)
 */
Izumi.prototype.run = function(event) {
  try {
    var webhookEvent = this.listen(event);
    var actionPattern = this.think(webhookEvent);
    this.action(actionPattern, webhookEvent);
  } catch (exception) {
    this.reportAdministratorCauseByError(exception);
  }
};

/**
 * 受信イベントを受け取って処理する
 *
 * @param {string} 受信データ(JSON)
 * @return {WebhookEventObject} Line形式のオブジェクト
 */
Izumi.prototype.listen = function(event) {
  return new WebhookEventObject(event);
};

/**
 * WebhookEventObjectを元に、とるべき対応を判断する
 *
 * @param {WebhookEventObject} Line形式のオブジェクト
 * @return {Work} 行動パターンオブジェクト
 */
Izumi.prototype.think = function(webhookEvent) {
  if (!webhookEvent.isValidReplyToken()) {
    return;
  }

  if (webhookEvent.isMessageEvent() && webhookEvent.isUserSource()) {
    return new ReceptionWorkOnetoOne();
  } else if (webhookEvent.isMessageEvent() && webhookEvent.isGroupSource()) {
    return new ReceptionWorkOnetoN();
  } else if (webhookEvent.isJoinEvent() && webhookEvent.isGroupSource()) {
    return new ReportAdminWorkCauseByGroupJoin();
  } else if (webhookEvent.isFollowEvent()) {
    return new ReportAdminWorkCauseByFollowed();
  }
  return null;
};

/**
 * 行動パターンを実行する
 *
 * @param {Work} 行動パターンオブジェクト
 * @param {WebhookEventObject} Line形式のオブジェクト
 */
Izumi.prototype.action = function(actionPattern, webhookEvent) {
  if (!actionPattern) {
    return;
  }
  actionPattern.action(webhookEvent);
};

/**
 * エラー発生を通知する
 *
 * @param {exception} 例外
 */
Izumi.prototype.reportAdministratorCauseByError = function(exception) {
  sendAdministratorNotifyMail(
    'エラー',
    'message:' + exception.message + '\nstack:' + exception.stack
  );
};

/**
 * 条件に一致する対応パターンを実行する
 *
 * @param {Array} 対応パターンリスト
 * @param {WebhookEventObject} Line形式のオブジェクト
 */
function selectExecutionWork(workPatterns, webhookEvent) {
  var workPatternsLength = workPatterns.length;
  for (var index = 0; index < workPatternsLength; index++) {
    var result = workPatterns[index].run(webhookEvent);
    if (result) {
      break;
    }
  }
}

/**
 * 1対1の会話用対応パターンリストを作成する
 *
 */
function makeReceptionOnetoOneWorkPatterns() {
  var workPatterns = [];
  workPatterns.push(new WeatherWork());
  workPatterns.push(new DiagramWork());
  workPatterns.push(new InsertHouseholdAccountBookWork());
  workPatterns.push(new SelectHouseholdAccountBookWork());
  workPatterns.push(new ChangeDialectWork());
  workPatterns.push(new NowDialectWork());
  workPatterns.push(new CheckDocomoIdWork());
  workPatterns.push(new MonthPlanetaryMotionWork());
  workPatterns.push(new TodayAstronomWork());
  workPatterns.push(new MonthAstronomWork());
  workPatterns.push(new MonthStarrySkyWork());
  workPatterns.push(new AstroDivinationWork());
  // 100%マッチするので必ず最後にpushする
  workPatterns.push(new ReactionTalkWork());

  return workPatterns;
}
