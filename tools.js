/*******************设置单击事件函数****************************/
function checkbtn(btnStr, fun){
    var btn = document.getElementById(btnStr);
    btn.onclick = fun;
}

/******************获取元素的当前显示样式*******************/
function getStyle(obj, name){
    if(window.getComputedStyle)
        //正常浏览器的方式(具有getComputedStyle方法)
        return getComputedStyle(obj,null)[name];
    else    
        //IE8的方式（没有getComputedStyle方法）
        return obj.currentStyle[name];
}

/*******************事件的多重绑定**************************
- 参数：1. obj：要绑定事件的对象；
        2. eventStr: 事件的字符串(不带on)；
        3. callback：回调函数；   *************************/
function bind(obj, eventStr, callback){
    if(obj.addEventListener)
    //大部分浏览器的兼容方式
        return obj.addEventListener(eventStr, callback, false);
    else
        //IE8的兼容方式    
        return obj.attachEvent("on"+eventStr, function(){
            callback.call(obj);
        });    
}

/*********************拖拽元素****************************/
function drag(obj){
    //1.当鼠标在被拖拽元素上按下时，开始拖拽
    obj.onmousedown = function(event){
        /*拖拽异常处理 方法二(IE8及以下) 步骤1: 
            当调用一个元素的setCapture()方法后，这个元素将会把下一次所有鼠标
            按下相关的事件都捕获到自己身上；
            这种方法只有IE支持，在火狐中不会报错，而在Chrome中调用会报错,
            所以作如下兼容性调整*/
        obj.setCapture && obj.setCapture();
        event = event || window.event;
        //鼠标被按下的同时，求出鼠标指针和obj偏移量的距离
        var ol = event.clientX  - obj.offsetLeft;
        var ot = event.clientY - obj.offsetTop;
    //2.当鼠标移动时，被拖拽元素跟随鼠标一起移动
        document.onmousemove = function(event){
            event = event || window.event;
            //获取鼠标坐标
            /* 修改obj的偏移量(当前鼠标的坐标位置减去先前求出的距离，
                可以保证鼠标在obj任何地方按下的同时，都不会改变obj的位置) */
            var left = event.clientX - ol;
            var top = event.clientY - ot;   
            obj.style.left = left + "px";
            obj.style.top = top + "px";
    //3.当鼠标松开时，被拖拽元素固定在当前位置
    /*(为document绑定，如果给obj绑定的话，box2会挡住obj) */
            document.onmouseup = function(){
                //取消document的onmousemove事件，就可以保证鼠标不动了
                document.onmousemove = null;
                //取消document的onmouseup事件，因为鼠标松开之后，这两个事件已经没有意义了
                document.onmouseup = null;
    /* 拖拽异常处理 方法二(IE8及以下) 步骤2:  当鼠标松开时，取消对其他事件的捕获*/  
                obj.releaseCapture && obj.releaseCapture();
            };
        };    
    /* 当拖拽一个网页的内容时，浏览器会默认搜索引擎中的拖拽内容，会导致拖拽异常 */
    /* 拖拽异常处理 方法一(正常浏览器)：
        通过 return false 的方式取消该默认行为 */   
        //return false;
    };
}

/********************识别不同的浏览器*******************************/
function disceBrow(){
    var ua = navigator.userAgent;
        if(/firefox/i.test(ua))
            alert("你是火狐");
        else if(/chrome/i.test(ua))
            alert("你是Chrome");
        else if(/msie/i.test(ua))
            alert("你是旧版IE");    
        else if("ActiveXObject" in window)
            alert("你是IE11");
}

/************************创建改变obj样式的函数****************************
参数
- obj: 要执行动画的对象；
- attr: 要执行动画的样式；
- target: 执行动画的目标位置；
- speed: 移动速度;
- callback: 回调函数，在动画执行完毕后执行**********************************/
function move(obj, attr, target, speed, callback){
    //关闭上一个定时器
    clearInterval(obj.timer);
    //获取当前的left值
    var current = parseInt(getStyle(obj, attr));
    /*判断速度的正负：如果从0向800移动，则速度为正值；
                    如果从800向0移动，则速度为负值 */
    if(current > target)
        speed = -speed;
    /* 如果在全局作用域中定义timer，则所有正在执行的定时器都在timer中保存，
        这就导致timer不会同时在多个对象中执行，基于此，我们向执行动画的对象中
        添加timer属性，用于保存自身的定时器标识，这样不同的对象都拥有自己了的定时器 */    
    obj.timer = setInterval(function(){
        var oldValue = parseInt(getStyle(obj, attr));
        var newValue = oldValue + speed;
        /* 向左移动时，判断newValue是否小于target(依据是速度小于0);
            向右移动时，判断newValue是否大于target(依据是速度大于0) */
        if((speed<0 && newValue<target) || (speed>0 && newValue>target))
            newValue = target;
        obj.style[attr] = newValue + "px";
        if(newValue == target){
            clearInterval(obj.timer);
            /*(1)动画执行完毕后，调用回调函数;
                (2)一定要确认动画结束时调用，即在if语句中;
                (3)满足用户需求，如果有回调函数就传，如果没有就不传；*/
            callback && callback();    
        }
    }, 30);
}

//创建函数：判断是否有某个类
function hasClass(obj, cn){
    var reg = new RegExp("\\b"+cn+"\\b");
    return reg.test(obj.className);    
}
//创建函数：用于增加一个类
function addClass(obj, cn){
    if(!hasClass(obj, cn))
        obj.className += " " + cn;
}
//创建函数：用于删除某个类
function removeClass(obj, cn){
    var reg = new RegExp("\\b"+cn+"\\b");
    obj.className = obj.className.replace(reg, "");
}
//创建函数：用于切换类（如果有该类则删除，没有就切换）
function toggleClass(obj, cn){
    if(hasClass(obj, cn))
        removeClass(obj, cn);
    else
        addClass(obj, cn);    
}