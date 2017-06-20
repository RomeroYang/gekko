var ss = {}
var his = []
const wnd = 10
let signal_buy = 0
let signal_sell = 0
let position = ''
let holding = ''
let holding_price = 0

ss.update = candle => {
    const {high, low, close, macd, rsi} = candle
    let item = {high, low, close, macd, rsi}
    his[his.length] = item

    // console.log(`high${high.toFixed(2)}low${low.toFixed(2)}close${close.toFixed(2)}macd${macd.toFixed(2)}`)
    if (his.length > wnd) {
        his.shift()
    } else {
        return 'none'
    }
    // console.log(his.length)

    const ma = calcAverage(his)
    const std = calcStd(his, ma)
    const boll = calcBollIndex(his, ma, std)

    // console.log(`ma:${ma} std:${std} boll_u:${boll.up} boll_d:${boll.down} boll_std:${boll.std_ratio}`)
    if (boll.ratio > boll.std_ratio) {
    // if (boll.ratio > boll.std_ratio && rsi > 80) {
        console.log(`price in high: diff-ratio-${(boll.ratio).toFixed(4)}`)
        position = 'high'
    } else if (boll.ratio < (0-boll.std_ratio)) {
    // } else if (boll.ratio < (0-boll.std_ratio) && rsi < 30) {
        console.log(`price in low: diff-ratio-${(boll.ratio).toFixed(4)}`)
        position = 'low'
    } else {
        if (Math.abs(boll.ratio) > 0.002) {
            if (position === 'high' && rsi > 80) {
            // if (position === 'high') {
                console.log(`find short point: diff-ratio-${(boll.ratio).toFixed(4)}`)
                signal_sell ++
                signal_buy = 0
                if (signal_sell > 1) {
                    signal_sell = 0
                    holding = 'short'
                    return holding
                }
            }
            if (position === 'low' && rsi < 30) {
            // if (position === 'low') {
                console.log(`find long point: diff-ratio-${(boll.ratio).toFixed(4)}`)
                signal_buy ++
                signal_sell = 0
                if (signal_buy > 0) {
                    signal_buy = 0
                    holding = 'long'
                    holding_price = close
                    return holding
                }
            }
        }
    }
    // console.log(`boll_ratio:${boll.ratio}`)

    // risk manage
    // if (holding === 'long' && (close/holding_price)-1<-0.01) {
    //     // price dicreased too much
    //     holding = 'short'
    //     return holding
    // }

    // const h30 = his.reduce((a, b) => {
    //     return a>b.high?a:b.high
    // }, 0)
    // const l30 = his.reduce((a, b) => {
    //     return a<b.low?a:b.low
    // }, 0)
    // const macd30h = his.reduce((a, b) => {
    //     return a.macd>b.macd?a:b
    // })['macd']
    // const macd30l = his.reduce((a, b) => {
    //     return a.macd<b.macd?a:b
    // })['macd']
    // if (macd30h == his[his.length - 2]['macd']) {
    //     return 'short'
    // }
    // if (macd30l == his[his.length - 2]['macd']) {
    //     return 'long'
    // }

    return 'none'
}

const calcAverage = his => {
    return his.reduce((a, b) => a+(b.close-0), 0) / his.length
}
const calcStd = (his, average) => {
    return Math.sqrt(his.map(item => Math.pow(item.close-average, 2)).reduce((a, b) => a+(b-0), 0) / his.length)
}
const calcBollIndex = (his, ma, std) => {
    let boll = {}
    boll.up = ma + (std * 2)
    boll.down = ma - (std * 2)
    boll.std_ratio = (std * 2) / ma
    boll.ratio = his[his.length - 1].close / ma -1
    return boll
}

const checkRSI = rsi => {
    const h = 75
    const l = 33
    if (rsi.rsi > h) return 'short'
    if (rsi.rsi < l) return 'long'
    return 'none'
}

module.exports = ss;