/**
 *  webhookeventobject.js
 *
 *  Copyright (c) 2018 Hiroaki Wada
 *
 *  This software is released under the MIT License.
 *  http://opensource.org/licenses/mit-license.php
 */
/**
 * Lineからの戻りJSONクラス
 *
 * @param {string} パース前のJSONデータ
 */
WebhookEventObject = function(unparsedRequestData) {
  this.parsedRequestData = JSON.parse(
    unparsedRequestData.postData.contents
  ).events[0];
  this.replyToken = this.parsedRequestData.replyToken;
  this.messageType = this.parsedRequestData.type;
  this.sourceType = this.parsedRequestData.source.type;
};

WebhookEventObject.prototype.getUserId = function() {
  return this.parsedRequestData.source.userId;
};

WebhookEventObject.prototype.getGroupId = function() {
  return this.parsedRequestData.source.groupId;
};

WebhookEventObject.prototype.isValidReplyToken = function() {
  if (typeof this.replyToken === 'undefined') {
    return false;
  }
  return true;
};

WebhookEventObject.prototype.getReplyToken = function() {
  return this.replyToken;
};

WebhookEventObject.prototype.isUserSource = function() {
  return this.sourceType === 'user';
};

WebhookEventObject.prototype.isGroupSource = function() {
  return this.sourceType === 'group';
};

WebhookEventObject.prototype.isMessageEvent = function() {
  return this.messageType === 'message';
};

WebhookEventObject.prototype.isJoinEvent = function() {
  return this.messageType === 'join';
};

WebhookEventObject.prototype.isFollowEvent = function() {
  return this.messageType === 'follow' || this.messageType === 'unfollow';
};

WebhookEventObject.prototype.isTextMessage = function() {
  return this.parsedRequestData.message.type === 'text';
};

WebhookEventObject.prototype.isStampMessage = function() {
  return this.parsedRequestData.message.type === 'sticker';
};

WebhookEventObject.prototype.isLocationMessage = function() {
  return this.parsedRequestData.message.type === 'location';
};

WebhookEventObject.prototype.getUserMessage = function() {
  return this.parsedRequestData.message.text;
};
