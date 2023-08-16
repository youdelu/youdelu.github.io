(function(window){
    "use strict";
    var u = {};
    u.isApp = function(){
        try {
            if (self.frameElement && self.frameElement.tagName == "IFRAME") {
                return (parent.exec!=undefined);
            }else{
                return (exec !=undefined&&exec instanceof Function);
            }
        }catch (e) {
        }
       return false;
    }
    var methods = new Map();
    u.onReady=function(f){
        methods.set('onReady',f.toString());
        var html = '<div id="win_bg_dialog" onclick="$api.hideWin();" class="hide"></div>' +
            '<div id="dialog" class="aui-dialog hide"></div>' +
            '<div id="window" class="aui-win"></div><div id="tips"></div>';
        html+='<div class="aui-tips aui-tips-info hide" id="tipsmessage">' +
            '    <div class="aui-tips-content">' +
            '        <div class="aui-col-xs-12">' +
            '            <div class="aui-col-xs-11">' +
            '                <i class="aui-iconfont aui-icon-info"></i>' +
            '                <span id="tip_msg"></span>' +
            '            </div>' +
            '            <div id="closeTips" onclick="hideTips();">' +
            '                <i class="aui-iconfont aui-icon-close"></i>' +
            '            </div>' +
            '        </div>' +
            '    </div>' +
            '</div>';
        $api.append(u.dom("body"),html);
        //不在app内直接初始化
        if(!u.isApp()){
            f&&f();
        }
    }
    //如果已存在重载
    u.showWinOrReload=function(id,title,data){
        u.showWinPop(id,title,data,true);
    };
    //如果已存在会叠加
    u.showWin=function(id,title,data){
        u.showWinPop(id,title,data,false);
    };
    u.showWinPop=function(id,title,data,isReload){
        var win = data!=undefined?u.template(id,data):u.byId(id).innerHTML;
        if(title){
            win='<div class="aui-win-header">'+title +
                '<div class="aui-win-close" onclick="$api.hideWin();"><i class="aui-iconfont aui-icon-close"></i></div></div>' +
                '<div class="aui-win-body">'+win+'</div>';
        }
        if(win){
            var dom = u.byId('window');
            if(u.winCount>0){
                if(isReload){
                    u.html(dom,win);
                }else{
                    u.append(dom,'<div class="attendWin"  id="window_'+u.winCount+'">'+win+'</div>');
                    u.winCount++;
                }
            }else{
                u.html(dom,win);
                u.animate_sideup(dom);
                u.autoShowBg();
                u.winCount++;
            }
        }
    }
    u.showDialog=function(id,data){
        var win  = data!=undefined?u.template(id,data):u.byId(id).innerHTML;
        if(win){
            if(u.winCount>0){
                var dom = u.byId('dialog');
                u.append(dom,'<div class="attendWin" id="window_'+u.winCount+'">'+win+'</div>');
            }else{
                var dom = u.byId('dialog');
                u.html(dom,win);
                u.animate_sideup(dom);
                u.autoShowBg();
            }
        }
    }
    u.winCount = 0 ;
    u.autoShowBg = function(){
        if(u.winCount>1){
            return;
        }
        var bg = u.byId("win_bg_dialog");
        if(!u.hasCls(bg,'hide')){
                u.addCls(bg,'hide');
        }else{
                u.removeCls(bg,'hide');
                u.disableWin = false;
        }
    }
    u.disableWin = false;
    u.hideWin = function(){
        if(!u.disableWin){
            u.winCount--;
            if(u.winCount>0){
                var dom = u.byId('window_'+u.winCount);
                u.remove(dom);
            }else{
                u.animate_sidedown(u.byId('dialog'));
                u.animate_sidedown(u.byId('window'));
                u.autoShowBg();
            }
        }
    };
    u.animate_sidedown = function(dom){
        if(u.hasCls(dom,'aui-animation-slideup')){
            u.removeCls(dom,'aui-animation-slideup')
        }
        u.addCls(dom,'aui-animation-slidedown');
    }
    u.animate_sideup = function(dom){
        if(u.hasCls(dom,'aui-animation-slidedown')){
            u.removeCls(dom,'aui-animation-slidedown')
        }
        u.addCls(dom,'aui-animation-slideup');
    }
    u.showTips = function(id,tips){
        u.html(u.byId(id),tips);
    }
    u.call = function(method,data,func){
        var d,f;
        if(func!=undefined&&func instanceof Function){
           d = data;
           f = func;
        }else if(func==undefined){
            if(data instanceof  Function){
                f = data;
                d = false;
            }else{
                f = false;
                d = data;
            }
        }else if(data ==undefined){
             f=false;
             d=false;
        }
        if(f){
            methods.set(method,f.toString());
        }
        //如果是对象或数组 转json
        if(d){
            if(d instanceof Object|| d instanceof Array){
                d = JSON.stringify(d);
            }
        }else{
            d="";
        }
        if(u.isApp()){
                if (self.frameElement && self.frameElement.tagName == "IFRAME") {
                    parent.exec(method,d);
                }else{
                    exec(method,d);
                }
        }else{
            console.info("请到应用内执行原生方法:"+method);
        }
    }
    u.callback = function(method,data){
        if(methods.has(method)){
            var d = u.strToJson(data);
            var str= methods.get(method);
            str="u.fn = "+str;
            try {
                eval(str);
                if(u.fn){
                    if(d.code==200){
                        //成功
                        u.fn(d.data,false);
                    }else{
                        //失败
                        u.fn(false,d);
                    }
                }
            }catch (e) {
                console.error("执行出错:"+e);
            }
        }
    }
    u.templateToDom = function(tempId,domId,data){
        var html = $api.template(tempId,data);
        $api.html($api.byId(domId),html);
    } ;
    u.template = function(tempId,data){
        var html = '';
        try{
            var layout = u.byId(tempId).innerHTML;
            html=doT.template(layout)(data);
        }catch(e){
            tips("出错:"+e);
        }
        return html;
    }

    var uzStorage = function(){
        try {
            return window.localStorage;
        }catch (e) {

        }
       return false ;
    };
    u.trim = function(str){
        if(String.prototype.trim){
            return str == null ? "" : String.prototype.trim.call(str);
        }else{
            return str.replace(/(^\s*)|(\s*$)/g, "");
        }
    };
    u.trimAll = function(str){
        return str.replace(/\s*/g,'');
    };
    u.isElement = function(obj){
        return !!(obj && obj.nodeType == 1);
    };
    u.isArray = function(obj){
        if(Array.isArray){
            return Array.isArray(obj);
        }else{
            return obj instanceof Array;
        }
    };
    u.isEmptyObject = function(obj){
        if(JSON.stringify(obj) === '{}'){
            return true;
        }
        return false;
    };
    u.addEvt = function(el, name, fn, useCapture){
        if(!u.isElement(el)){
            return;
        }
        useCapture = useCapture || false;
        if(el.addEventListener) {
            el.addEventListener(name, fn, useCapture);
        }
    };
    u.rmEvt = function(el, name, fn, useCapture){
        if(!u.isElement(el)){
            return;
        }
        useCapture = useCapture || false;
        if (el.removeEventListener) {
            el.removeEventListener(name, fn, useCapture);
        }
    };
    u.one = function(el, name, fn, useCapture){
        if(!u.isElement(el)){
            return;
        }
        useCapture = useCapture || false;
        var that = this;
        var cb = function(){
            fn && fn();
            that.rmEvt(el, name, cb, useCapture);
        };
        that.addEvt(el, name, cb, useCapture);
    };
    u.dom = function(el, selector){
        if(arguments.length === 1 && typeof arguments[0] == 'string'){
            if(document.querySelector){
                return document.querySelector(arguments[0]);
            }
        }else if(arguments.length === 2){
            if(el.querySelector){
                return el.querySelector(selector);
            }
        }
    };
    u.domAll = function(el, selector){
        if(arguments.length === 1 && typeof arguments[0] == 'string'){
            if(document.querySelectorAll){
                return document.querySelectorAll(arguments[0]);
            }
        }else if(arguments.length === 2){
            if(el.querySelectorAll){
                return el.querySelectorAll(selector);
            }
        }
    };
    //获取所有表单数据
    u.getFormData=function(formId){
        var d = u.byId(formId);
        if(d==undefined){
            return null;
        }
        var data = {};
        var eles = d.querySelectorAll("input,textarea");
        if(eles.length==0){
            return null;
        }
        for (var i = 0; i < eles.length; i++) {
                var id = eles[i].id;
                var key = id;
                var le = key.indexOf("-");
                if(le!=-1){
                    key = key.substring(le+1);
                }
                data[key] = u.valById(id);
        }
        return data;
    };
    u.valById=function(id){
      return u.val(u.byId(id));
    };
    u.byId = function(id){
        return document.getElementById(id);
    };
    u.first = function(el, selector){
        if(arguments.length === 1){
            if(!u.isElement(el)){
                return;
            }
            return el.children[0];
        }
        if(arguments.length === 2){
            return this.dom(el, selector+':first-child');
        }
    };
    u.last = function(el, selector){
        if(arguments.length === 1){
            if(!u.isElement(el)){
                return;
            }
            var children = el.children;
            return children[children.length - 1];
        }
        if(arguments.length === 2){
            return this.dom(el, selector+':last-child');
        }
    };
    u.eq = function(el, index){
        return this.dom(el, ':nth-child('+ index +')');
    };
    u.not = function(el, selector){
        return this.domAll(el, ':not('+ selector +')');
    };
    u.prev = function(el){
        if(!u.isElement(el)){
            return;
        }
        var node = el.previousSibling;
        if(node.nodeType && node.nodeType === 3){
            node = node.previousSibling;
            return node;
        }
    };
    u.next = function(el){
        if(!u.isElement(el)){
            return;
        }
        var node = el.nextSibling;
        if(node.nodeType && node.nodeType === 3){
            node = node.nextSibling;
            return node;
        }
    };
    u.closest = function(el, selector){
        if(!u.isElement(el)){
            return;
        }
        var doms, targetDom;
        var isSame = function(doms, el){
            var i = 0, len = doms.length;
            for(i; i<len; i++){
                if(doms[i].isEqualNode(el)){
                    return doms[i];
                }
            }
            return false;
        };
        var traversal = function(el, selector){
            doms = u.domAll(el.parentNode, selector);
            targetDom = isSame(doms, el);
            while(!targetDom){
                el = el.parentNode;
                if(el != null && el.nodeType == el.DOCUMENT_NODE){
                    return false;
                }
                traversal(el, selector);
            }

            return targetDom;
        };

        return traversal(el, selector);
    };
    u.contains = function(parent,el){
        var mark = false;
        if(el === parent){
            mark = true;
            return mark;
        }else{
            do{
                el = el.parentNode;
                if(el === parent){
                    mark = true;
                    return mark;
                }
            }while(el === document.body || el === document.documentElement);

            return mark;
        }

    };
    u.remove = function(el){
        if(el && el.parentNode){
            el.parentNode.removeChild(el);
        }
    };
    u.attr = function(el, name, value){
        if(!u.isElement(el)){
            return;
        }
        if(arguments.length == 2){
            return el.getAttribute(name);
        }else if(arguments.length == 3){
            el.setAttribute(name, value);
            return el;
        }
    };
    u.removeAttr = function(el, name){
        if(!u.isElement(el)){
            return;
        }
        if(arguments.length === 2){
            el.removeAttribute(name);
        }
    };
    u.hasCls = function(el, cls){
        if(!u.isElement(el)){
            return;
        }
        if(el.className.indexOf(cls) > -1){
            return true;
        }else{
            return false;
        }
    };
    u.addCls = function(el, cls){
        if(!u.isElement(el)){
            return;
        }
        if('classList' in el){
            el.classList.add(cls);
        }else{
            var preCls = el.className;
            var newCls = preCls +' '+ cls;
            el.className = newCls;
        }
        return el;
    };
    u.removeCls = function(el, cls){
        if(!u.isElement(el)){
            return;
        }
        if('classList' in el){
            el.classList.remove(cls);
        }else{
            var preCls = el.className;
            var newCls = preCls.replace(cls, '');
            el.className = newCls;
        }
        return el;
    };
    u.toggleCls = function(el, cls){
        if(!u.isElement(el)){
            return;
        }
       if('classList' in el){
            el.classList.toggle(cls);
        }else{
            if(u.hasCls(el, cls)){
                u.removeCls(el, cls);
            }else{
                u.addCls(el, cls);
            }
        }
        return el;
    };
    u.val = function(el, val){
        if(!u.isElement(el)){
            return;
        }
        if(arguments.length === 1){
            switch(el.tagName){
                case 'SELECT':
                    var value = el.options[el.selectedIndex].value;
                    return value;
                    break;
                case 'INPUT':
                    return el.value;
                    break;
                case 'TEXTAREA':
                    return el.value;
                    break;
            }
        }
        if(arguments.length === 2){
            switch(el.tagName){
                case 'SELECT':
                    el.options[el.selectedIndex].value = val;
                    return el;
                    break;
                case 'INPUT':
                    el.value = val;
                    return el;
                    break;
                case 'TEXTAREA':
                    el.value = val;
                    return el;
                    break;
            }
        }

    };
    u.prepend = function(el, html){
        if(!u.isElement(el)){
            return;
        }
        el.insertAdjacentHTML('afterbegin', html);
        return el;
    };
    u.append = function(el, html){
        if(!u.isElement(el)){
            return;
        }
        el.insertAdjacentHTML('beforeend', html);
        return el;
    };
    u.before = function(el, html){
        if(!u.isElement(el)){
            return;
        }
        el.insertAdjacentHTML('beforebegin', html);
        return el;
    };
    u.after = function(el, html){
        if(!u.isElement(el)){
            return;
        }
        el.insertAdjacentHTML('afterend', html);
        return el;
    };
    u.html = function(el, html){
        if(!u.isElement(el)){
            return;
        }
        if(arguments.length === 1){
            return el.innerHTML;
        }else if(arguments.length === 2){
            el.innerHTML = html;
            return el;
        }
    };
    u.text = function(el, txt){
        if(!u.isElement(el)){
            return;
        }
        if(arguments.length === 1){
            return el.textContent;
        }else if(arguments.length === 2){
            el.textContent = txt;
            return el;
        }
    };
    u.offset = function(el){
        if(!u.isElement(el)){

            return;
        }
        var sl = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
        var st = Math.max(document.documentElement.scrollTop, document.body.scrollTop);

        var rect = el.getBoundingClientRect();
        return {
            l: rect.left + sl,
            t: rect.top + st,
            w: el.offsetWidth,
            h: el.offsetHeight
        };
    };
    u.css = function(el, css){
        if(!u.isElement(el)){
            return;
        }
        if(typeof css == 'string' && css.indexOf(':') > 0){
            el.style && (el.style.cssText += ';' + css);
        }
    };
    u.cssVal = function(el, prop){
        if(!u.isElement(el)){
            return;
        }
        if(arguments.length === 2){
            var computedStyle = window.getComputedStyle(el, null);
            return computedStyle.getPropertyValue(prop);
        }
    };
    u.jsonToStr = function(json){
        if(typeof json === 'object'){
            return JSON && JSON.stringify(json);
        }
    };
    u.strToJson = function(str){
        if(typeof str === 'string'){
            try {
                return JSON && JSON.parse(str);
            }catch (e) {
                console.error("解析发生异常:"+e);
            }
        }
        return str;
    };
    u.setStorage = function(key, value,fn){
        if(arguments.length === 2||arguments.length === 3){
            var ls = uzStorage();
            if(ls){
                var v = value;
                if(typeof v == 'object'){
                    v = JSON.stringify(v);
                    v = 'obj-'+ v;
                }else{
                    v = 'str-'+ v;
                }
                ls.setItem(key, v);
            }else{
                if(typeof value == 'object') {
                    value = JSON.stringify(value);
                }
                u.call('addHistory',{'key':key,'value':value},fn);
            }
        }
    };
    //获取记录
    u.getStorage = function(key,fn){
        var ls = uzStorage();
        if(ls){
            var v = ls.getItem(key);
            if(!v){return;}
            if(v.indexOf('obj-') === 0){
                v = v.slice(4);
                return JSON.parse(v);
            }else if(v.indexOf('str-') === 0){
                return v.slice(4);
            }
        }else{
            u.call('getLastHistory',key,fn);
        }
    };
    //删除记录
    u.rmStorage = function(key,fn){
        var ls = uzStorage();
        if(ls){
            if(key){
                ls.removeItem(key);
            }
        }else{
            u.call('removeHistory',key,fn);
        }
    };
    //清除记录
    u.clearStorage = function(fn){
        var ls = uzStorage();
        if(ls){
            ls.clear();
        }else{
            u.call('removeHistory',fn);
        }
    };
    u.ajax = function(url,type,data,dataType,func){
        ajax({
            url: url,
            type: type,
            data: data,
            dataType: dataType,
            success: function (response) {
                if(dataType=='json'){
                    response = eval("(" + response + ")");
                }
                func&&func(response,false);
            },
            fail: function (status) {
                func&&func(false,status);
            }
        });
    }
    function ajax(options){
        options = options || {};
        options.type = (options.type || "GET").toUpperCase();
        options.dataType = options.dataType || "json";
        var params = formatParams(options.data);
        if (window.XMLHttpRequest) {
            var xhr = new XMLHttpRequest();
        } else {
            var xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                var status = xhr.status;
                if (status >= 200 && status < 300) {
                    options.success && options.success(xhr.responseText);
                } else {
                    options.fail && options.fail(status);
                }
            }
        }
        if (options.type == "GET") {
            xhr.open("GET", options.url + "?" + params, true);
            xhr.send(null);
        } else if (options.type == "POST") {
            xhr.open("POST", options.url, true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            var time = Math.floor(new Date().getTime()/1000);
            xhr.setRequestHeader('mcode', missjson(time+""));
            xhr.send(params);
        }

    }
    function missjson(input) {
        var keyStr = "ABCDEFGHIJKLMNOP" + "QRSTUVWXYZabcdef" + "ghijklmnopqrstuv"   + "wxyz0123456789+/" + "=";
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;
        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2)
                + keyStr.charAt(enc3) + keyStr.charAt(enc4);
            console.log(enc1 +","+ enc2 +","+ enc3 +","+ enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";

            //console.log(i+"/"+input.length+"/"+output+"/"+chr1+"/"+chr2+"/"+chr3);
        } while (i < input.length);

        return output;
    }
    function formatParams(data) {
        var arr = [];
        for (var name in data) {
            arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
        }
        arr.push(("v=" + Math.random()).replace(".",""));
        return arr.join("&");
    }
    window.$api = u;
})(window);
//处理回调
function callback(method,data){
    var frm = $api.byId("frame");
    if(frm!=null){
        //如果存在frame 将回调传递给iframe
        frm.contentWindow.callback(method,data);
    }else{
        $api.callback(method,data);
    }
}

function hideTips(){
    var tip = $api.byId("tipsmessage");
    if(!$api.hasCls(tip,"hide")){
        $api.addCls(tip,"hide");
    }
}
var timeout;
function tips(str){
    if(str instanceof Object){
        str = str.message;
    }
    var msg = $api.byId("tipsmessage");
    if($api.hasCls(msg,'hide')){
        $api.removeCls(msg,"hide");
    }
    $api.html($api.byId("tip_msg"),str);
    if(timeout!=null){
        clearTimeout(timeout);
    }
    timeout = setTimeout(function(){
        hideTips();
    },3000);
}
//获取当前执行方法名
Function.prototype.getName = function(){
    return this.name || this.toString().match(/function\s*([^(]*)\(/)[1];
}
