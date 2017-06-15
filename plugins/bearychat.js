var log = require('../core/log');
var moment = require('moment');
var _ = require('lodash');
var config = require('../core/util').getConfig();
var bearychat = config.bearychat;
var utc = moment.utc;
const https = require('https');

var Actor = function() {
  _.bindAll(this);

  this.advice = 'Dont got one yet :(';
  this.adviceTime = utc();

  this.price = 'Dont know yet :(';
  this.priceTime = utc();
}

Actor.prototype.processCandle = function(candle, done) {
  this.price = candle.close;
  this.priceTime = candle.start;

  // if(bearychat.enabled)
  // this.emitPrice();

  done();
};

Actor.prototype.processAdvice = function(advice) {
  if (advice.recommendation == "soft" && bearychat.muteSoft) return;
  this.advice = advice.recommendation;
  this.adviceTime = utc();

  if(bearychat.enabled)
  this.emitAdvice();
};

// sent advice over to the IRC channel
Actor.prototype.emitAdvice = function() {
  var data = {};
  data.text = 'NewAdvice';

  data.attachments = [{}];
  data.attachments[0].color = '#ffa500';
  data.attachments[0].title = this.advice;
  data.attachments[0].text = [
    'Advice for ',
    config.watch.exchange,
    ' ',
    config.watch.currency,
    '/',
    config.watch.asset,
    ' using ',
    config.tradingAdvisor.method,
    ' at ',
    config.tradingAdvisor.candleSize,
    ' minute candles, is:\n',
    this.advice,
    ' ',
    config.watch.asset,
    ' (from ',
      this.adviceTime.fromNow(),
    ')'
  ].join('');

  this.say(data);
};

// sent price over to the IRC channel
Actor.prototype.emitPrice = function() {
  var data = {};
  data.text = 'NewPrice';

  data.attachments = [{}];
  data.attachments[0].color = '#2dbe60';
  data.attachments[0].title = this.price;
  data.attachments[0].text = [
    'Current price at ',
    config.watch.exchange,
    ' ',
    config.watch.currency,
    '/',
    config.watch.asset,
    ' is ',
    this.price,
    ' ',
    config.watch.currency,
    ' (from ',
      this.priceTime.fromNow(),
    ')'
  ].join('');

  if (this.priceTime.fromNow().match('minutes') || this.priceTime.fromNow().match('hour')) return;
  this.say(data);
};

Actor.prototype.say = function(data) {
  const options = {
    hostname: 'hook.bearychat.com',
    port: 443,
    path: '/=bwAI7/incoming/2d4ce246e600143c34f5c7417c9bcb7f',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {

    res.setEncoding('utf8');
    res.on('data', (d) => {
    });
  });

  req.on('error', (e) => {
    console.error(e);
  });
  req.write(JSON.stringify(data));
  req.end();
}

module.exports = Actor;
