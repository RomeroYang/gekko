// This is a basic example strategy for Gekko.
// For more information on everything please refer
// to this document:
//
// https://gekko.wizb.it/docs/strategies/creating_a_strategy.html
//
// The example below is pretty bad investment advice: on every new candle there is
// a 10% chance it will recommend to change your position (to either
// long or short).

var log = require('../core/log');
// var ta = require('./ta/my');
var ss = require('./ta/super_short');

// Let's create our own strat
var strat = {};

// Prepare everything our method needs
strat.init = function() {
  this.currentTrend = 'long';
  this.requiredHistory = 0;

  this.addIndicator('rsi', 'RSI', {interval: 14})
  // this.addIndicator('dema', 'DEMA', {short: 10, long: 21})
  // this.addIndicator('ppo', 'PPO', {short: 12, long: 26, signal: 9})
  this.addIndicator('macd', 'MACD', {short: 14, long: 21, signal: 9})
}

// What happens on every new candle?
strat.update = function(candle) {
  candle.rsi = this.indicators.rsi.rsi;
  // var dema = this.indicators.dema;
  // var ppo = this.indicators.ppo;
  candle.macd = this.indicators.macd.result;
  // var trend = ta.update({rsi, dema, ppo, macd});
  var trend = ss.update(candle);

  // this.currentTrend = trend;
  if (trend == 'none') {
    this.toUpdate = false;
    return;
  }
  // console.log('trend:'+trend+'currentTrend:'+this.currentTrend)
  if (trend != this.currentTrend) {
    console.log('toUpdate:'+trend)
    this.toUpdate = true;
  } else {
    this.toUpdate = false;
  }
}

// For debugging purposes.
strat.log = function() {
  log.debug('currentTrend:');
  log.debug('\t', this.currentTrend);
}

// Based on the newly calculated
// information, check if we should
// update or not.
strat.check = function() {

  // Only continue if we have a new update.
  if(!this.toUpdate)
    return;

  if(this.currentTrend === 'long') {

    // If it was long, set it to short
    this.currentTrend = 'short';
    this.advice('short');

  } else {

    // If it was short, set it to long
    this.currentTrend = 'long';
    this.advice('long');

  }

  // if (this.currentTrend === 'none') {
  //   return;
  // } else {
  //   this.advice(this.currentTrend);
  // }
}

module.exports = strat;