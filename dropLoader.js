//@author liuchunhua
//date 20170314
//注意事项，如果有改变元素高度的行为，必须调用calculationDomHeight方法
//function upCallBack(){}
//new DropLoader({selectorId:'main',upCallback:upCallback,downLock:true,maxTranslateY:50,reduce:1,upNoticeId:'up-notice'});
"use strict";
var DropLoader = function(config) {

    //滑动的元素id
    this.selectorId;
    //滑动加载提示元素id
    this.upNoticeId = 'up-loading';
    this.downNoticeId = 'down-loading';
    //窗口 id,默认可以不用配置
    this.windowSelectorId;
    this.loadDataTranslate = 30; //加载数据阈值

    //锁定不请求数据
    this.downLock = false; //下拉锁定
    this.upLock = false; //上拉锁定


    this.maxTranslateY = 400; //最大偏移值，实际要除以 this.reduce，此处作用是偏移时有迟缓感
    this.reduce = 8;

    //提示内容
    this.upNotice = {
        touchmove: '上拉加载',
        touchend: '松开立即加载',
        loading: '加载中...',
        noMore: '加载完成'
    };
    this.downNotice = {
        touchmove: '上拉加载',
        touchend: '松开立即加载',
        loading: '加载中...',
        noMore: '加载完成'
    };

    //上拉回调函数
    this.upCallback;
    //下拉回调函数
    this.downCallback;


    //偏移值
    var translateX = 0;
    var translateY = 0;
    //窗口高度
    var windowHeight = 0;
    //被滑动的元素高度
    var domHeight = 0;
    //滑动的元素
    var dom;

    //起始触摸点
    var startX;
    var startY;

    //滚动条初始位置
    var startScrollTop = 0;

    //滑动方向
    var isUp = false;
    var isDown = false;

    //当前实例
    var instance;


    //禁止默认滚动
    document.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, {
        passive: false
    });

    this.getWindowHeight = function() {
        return windowHeight;
    };

    this.getDomHeight = function() {
        return domHeight;
    };

    //计算dom高度
    this.calculationDomHeight = function() {
        domHeight = dom.offsetHeight;
    };
    /**
     * 滚动条上下移动,多出来部分用于设置translate
     */
    var moveScrollY = function(y) {

        var maxMove = domHeight - windowHeight < 0 ? 0 : domHeight - windowHeight;
        var realMove = startScrollTop + startY - y;

        if (startY - y > 0) {
            isUp = true;
            isDown = false;
        } else if (startY - y < 0) {
            isDown = true;
            isUp = false;
        }


        if (realMove > maxMove) {
            realMove = maxMove;
        }
        //滚动条在顶部为0, 在底部为maxMove
        if (realMove >= 0 && realMove <= maxMove) {
            document.body.scrollTop = realMove;
        }


        if (isDown && realMove <= 0 && Math.abs(translateY) < instance.maxTranslateY) {
            translateY += 1;
        } else if (isUp && realMove >= maxMove && Math.abs(translateY) < instance.maxTranslateY) {
            translateY--;
        }
    };

    //设置 translate
    var setTranslate = function(x, y) {
        y > instance.maxTranslateY ? y = instance.maxTranslateY : '';
        var move = true;
        y = y / instance.reduce;
        if (instance.upLock == true && y < 0) {
            //上拉锁定
            move = false;
        } else if (instance.downLock == true && y > 0) {
            //下拉锁定
            move = false;
        }
        if (move) {
            dom.style.transform = "translate(" + x + "px," + y + "px)";
        }
    };

    var setLoadingText = function(id, notice) {

        var loadingDom = document.getElementById(id);
        if (loadingDom !== null) {
            loadingDom.innerHTML = notice;
        }
    };

    /**
     * 初始化
     * 列表最大高度
     * 页面最大高度
     */
    var init = function() {
        for (var i in config) {
            instance[i] = config[i];
        }

        dom = document.getElementById(instance.selectorId);
        if (dom === null) {
            throw '错误的selector id!';
        }
        instance.calculationDomHeight();

        if (instance.windowSelectorId !== undefined) {
            var win = document.getElementById(instance.windowSelectorId);

            if (win === null) {
                throw '错误的 window selector id';
            }

            windowHeight = win.offsetHeight;
        } else {
            windowHeight = window.screen.height;
        }

        //触摸开始
        dom.addEventListener('touchstart', function(evt) {
            try {
                // evt.preventDefault();
                var touch = evt.touches[0]; //获取第一个触点
                var x = Number(touch.clientX); //页面触点X坐标
                var y = Number(touch.clientY); //页面触点Y坐标

                startScrollTop = document.body.scrollTop;
                //记录触点初始位置
                startX = x;
                startY = y;
            } catch (e) {
                console.log(e.message);
            }
        }, false);
        //移动
        dom.addEventListener('touchmove', function(evt) {
            try {
                // evt.preventDefault(); //阻止触摸时浏览器的缩放、滚动条滚动等
                var touch = evt.touches[0]; //获取第一个触点
                var x = parseInt(touch.clientX); //页面触点X坐标
                var y = parseInt(touch.clientY); //页面触点Y坐标
                //计算滚动条移动数据，并且移动滚动条
                moveScrollY(y);

                if (isTimeToCallback()) {
                    if (isDown) {
                        setLoadingText(instance.downNoticeId, instance.downNotice.touchend);
                    } else {
                        setLoadingText(instance.upNoticeId, instance.upNotice.touchend);
                    }
                } else {
                    if (isDown) {
                        setLoadingText(instance.downNoticeId, instance.downNotice.touchmove);
                    } else {
                        setLoadingText(instance.upNoticeId, instance.upNotice.touchmove);
                    }
                }
                setTranslate(0, translateY);
            } catch (e) {
                console.log(e.message);
            }
        }, false);
        //移动结束
        dom.addEventListener('touchend', function(evt) {
            try {

                setTimeout(function(){
                    down();
                    up();
                    translateX = translateY = 0;
                    setTranslate(translateX, translateY);
                },500);
            } catch (e) {
                console.log(e.message);
            }
        }, false);
    };

    var down = function() {
        if (translateY <= 0) {
            return false;
        }

        if (typeof instance.downCallback !== 'function') {
            return false;
        }

        if (!isTimeToCallback()) {
            return false;
        }
        setLoadingText(instance.downNoticeId, instance.downNotice.loading, 'touchend');

        if (!instance.downLock) {
            instance.downCallback();
            return true;
        }
        return false;
    };

    var up = function() {
        if (translateY >= 0) {
            return false;
        }
        if (typeof instance.upCallback !== 'function') {
            return false;
        }

        if (!isTimeToCallback()) {
            return false;
        }
        setLoadingText(instance.upNoticeId, instance.upNotice.loading, 'touchend');
        if (isTimeToCallback() && !instance.upLock) {
            instance.upCallback();
            return true;
        }
        return false;
    };

    var isTimeToCallback = function() {
        return Math.abs(translateY / instance.reduce) >= instance.loadDataTranslate;
    };

    instance = this;
    init();
}