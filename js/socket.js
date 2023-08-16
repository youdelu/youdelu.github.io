(function(window){
    "use strict";
	var callbacks = new Map();
    var u = {};
	var socketUrl = "192.168.3.103:8080";
	var socket;
	var conncet = false;
	/**
	 * 初始化
	 * @param {*} fn 
	 */
	u.init = function(fn){
		try{
			socket = io("wss://"+socketUrl);
			socket.on('connect', function() {
				conncet = true;
				fn&&fn(true,"连接成功"); 
			});
			socket.on('connecting', function() {
				conncet = false;
				fn&&fn(false,"正在连接..."); 
			});
			socket.on('disconnect', function() {
				conncet=false;
				fn&&fn(false,"断开连接"); 
			});
			socket.on('connect_failed', function() {
				conncet = false;
				fn&&fn(false,"连接失败"); 
			});
			socket.on('error', function() {
				conncet = false;
				fn&&fn(false,"连接出错"); 
			});
			socket.on('reconnect_failed', function() {
				conncet = false;
				fn&&fn(false,"重连失败"); 
			});
			socket.on('reconnect', function() {
				conncet = true;
				fn&&fn(true,"重连成功"); 
			});
			socket.on('reconnecting', function() {
				conncet = false;
				fn&&fn(false,"正在重连..."); 
			});
		}catch(e){
			conncet = false;
			fn&&fn(false,"连接出错:"+e); 
		}
	}
	/**
	 * 监听消息
	 * @param {Object} fn
	 */
	u.message = function(fn){
		if(!socket){
			console.log("请先调用init方法");
			return;
		}
		socket.on('message',function(data){ 
			 if(data.action){
				 if(callbacks.size>0&&callbacks.has(data.action)){
					 //有回调的走回调
					 var str = callbacks.get(data.action);
					 str="u.callbackFn = "+str; 
					  try {
						 eval(str);
						 if(u.callbackFn){
							u.callbackFn&&u.callbackFn(true,data);
						 }
					 }catch (e) {
						 console.error("执行出错:"+e);
					 }
					 if(data.complete){
						callbacks.delete(data.action);
					 }
					 return;
				 }
			 }
		     fn&&fn(data);
		});
	}
	/**
	 * 发送消息
	 * @param {Object} data
	 */
	u.get = function(action,param,fn){ 
		if(!socket){ 
			fn&&fn(false,"请先调用init方法");
			return;
		}
		if(!conncet){ 
			fn&&fn(false,"未连接成功,取消发送");
			return;
		}
		var data = {};
		data.action = action;
		if(param){
			data.param = param;
		}
		var s = socket.emit('server_message', JSON.stringify(data));
		if(s.id){
			console.log("发送成功,id="+s.id);
			console.log(data); 
			callbacks.set(action,fn.toString());
		}else{
			fn&&fn(false,"发送失败");  
		}
	}
	window.$socket = u;
})(window);