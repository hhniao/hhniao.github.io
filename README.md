# DropLoader
drop to load data

//注意事项，如果有改变元素高度的行为，必须调用calculationDomHeight方法

//function upCallBack(){}

    var loader = new DropLoader({
        //滑动的元素id
        selectorId:'main',
        //滑动加载提示元素id
        upNoticeId:'up-loading';
        downNoticeId:'down-loading';
        //窗口 id,默认可以不用配置
        windowSelectorId;
        //加载数据阈值,触发callback阈值
        loadDataTranslate:30; 

        //锁定不请求数据
        downLock:false; //下拉锁定
        upLock:false; //上拉锁定
        //最大偏移值，实际要除以 reduce，此处作用是偏移时有迟缓感
        maxTranslateY:400; 
        reduce:8;

        //提示内容
        upNotice:{
            touchmove: '上拉加载',
            touchend: '松开立即加载',
            loading: '加载中...',
            noMore: '加载完成'
        };
        downNotice:{
            touchmove: '上拉加载',
            touchend: '松开立即加载',
            loading: '加载中...',
            noMore: '加载完成'
        };

        //上拉回调函数
        upCallback;
        //下拉回调函数
        downCallback;
    });
