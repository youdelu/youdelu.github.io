
//=================================================MADC计算公式

var calcEMA,calcDIF,calcDEA,calcMACD;

/*
 * 计算EMA指数平滑移动平均线，用于MACD
 * @param {number} n 时间窗口
 * @param {array} data 输入数据
 * @param {string} field 计算字段配置
 */
calcEMA=function(n,data,field){
    var i,l,ema,a;
    a=2/(n+1);
    if(field){
        //二维数组
        ema=[data[0][field]];  
        for(i=1,l=data.length;i<l;i++){
            ema.push((a*data[i][field]+(1-a)*ema[i-1]).toFixed(2));
        }
    }else{
        //普通一维数组
        ema=[data[0]];
        for(i=1,l=data.length;i<l;i++){
            ema.push((a*data[i]+(1-a)*ema[i-1]).toFixed(3) );
        }
    } 
    return ema;
};

/*
 * 计算DIF快线，用于MACD
 * @param {number} short 快速EMA时间窗口
 * @param {number} long 慢速EMA时间窗口
 * @param {array} data 输入数据
 * @param {string} field 计算字段配置
 */
calcDIF=function(short,long,data,field){
    var i,l,dif,emaShort,emaLong;
    dif=[];
    emaShort=calcEMA(short,data,field);
    emaLong=calcEMA(long,data,field);
    for(i=0,l=data.length;i<l;i++){
        dif.push((emaShort[i]-emaLong[i]).toFixed(3));
    }
    return dif;
};

/*
 * 计算DEA慢线，用于MACD
 * @param {number} mid 对dif的时间窗口
 * @param {array} dif 输入数据
 */
calcDEA=function(mid,dif){
    return calcEMA(mid,dif);
};

/*
 * 计算MACD
 * @param {number} short 快速EMA时间窗口
 * @param {number} long 慢速EMA时间窗口
 * @param {number} mid dea时间窗口
 * @param {array} data 输入数据
 * @param {string} field 计算字段配置
 */
calcMACD=function(short,long,mid,data,field){
    var i,l,dif,dea,macd,result;
    result={};
    macd=[];
    dif=calcDIF(short,long,data,field);
    dea=calcDEA(mid,dif);
    for(i=0,l=data.length;i<l;i++){
        macd.push(((dif[i]-dea[i])*2).toFixed(3));
    }
    result.dif=dif;
    result.dea=dea;
    result.macd=macd;
    return result;
};
 
 
 //=================================================MADC计算公式 end