// debug字段，防止突然选课
var OK_OR_CANCEL = "Cancel";
// 详情是一个固定的字段
var className = "绑腿跑 详情";
// 配合内置的搜索功能
var identification = "绑腿跑";
// ========================跟随设备参数=========================
// 隐藏点的刷新按键的位置
var dots = [929, 102, 1080, 232];
/**
 * (96, 1197, 1005, 1272)
 * (228, 1353, 570, 1404)
 * [228, 156, 570, 132]
 * 时间栏第一条与className的相对距离
 */
var raletiveTime = [228, 156, 570, 132];
/**
 * (96, 1197, 1005, 1272)
 * (882, 1464, 1005, 1533)
 * [882, 267, 1005, 261]
 * 按钮与className的相对距离
 */
var raletiveButton = [882, 267, 1005, 261];
var windowTop = 246;
var windowBottom = 2307;
// 刷新按钮
var refreshButton = "Refresh";
// 查找功能的按钮
var searchButton = "Search Within Page";
// =======================跟随设备参数=========================

// 刷新后的延迟时间，不能再小了，不然会出bug
var refreshSleep = 800;

// =================微信软件跟新可能会变动的参数================
// 参与的按钮
var joinIn = "参与";
// 输入框
var inputBoxId = "l3";
// 关闭输入框按钮
var closeButtonId = "eh9";
// 下一个匹配项按钮
var nextItemButtonId = "fkn";
// =================微信软件跟新可能会变动的参数================

// 时间过滤列表，采用的是正则达式的方式，'^'争取不要省略防止出错
var blackList = [
    // "^2019/04/22",
];

/**
 * 刷新页面
 */
function refresh() {
    var dots = this.dots;
    var dots = bounds(dots[0], dots[1], dots[2], dots[3]).clickable().click();
    // 唤醒抽屉的刷新时间
    sleep(100);
    var reFresh = text(refreshButton).findOne();
    var reFresh_button = reFresh.parent();
    reFresh_button.click();
    sleep(refreshSleep);
}

/**
 * 可选的时间过滤功能
 * 
 * 如果blackList为空，就不会电击按钮之前过滤时间选项，可以提速
 * @param {当前的课程名称所在的位置} currentClassNamePosition 
 */
function timeCheck(currentClassNamePosition) {
    for (var i = 0; i < blackList.length; ++i) {
        var timeUiSelector = bounds(raletiveTime[0], currentClassNamePosition.top+raletiveTime[1], raletiveTime[2], currentClassNamePosition.bottom+raletiveTime[3]);
        var timeCellection = timeUiSelector.find();
        if(timeCellection.isEmpty()) {return true;}
        var time = timeCellection[0].text();
        
        /** 正则表达式匹配时间 */
        var pattern = new RegExp(blackList[i]);

        if (pattern.test(time)) {
            return false;
        } else {
            return true;
        }
    }

    return true;
}

/**
 * 根据当前课程名称的位置选择要不要电击参与按钮
 * @param {当前课程名称所在的位置} currentClassNamePosition 
 */

function buttonCheck(currentClassNamePosition) {
    var buttonUiselector = bounds(raletiveButton[0], currentClassNamePosition.top+raletiveButton[1], raletiveButton[2], currentClassNamePosition.bottom+raletiveButton[3]);
    var buttonCellection = buttonUiselector.find();
    if (buttonCellection.isEmpty()) {
        return;
    }
    var button = buttonCellection[0];
    if ((button.text() == joinIn) ) {
        button.click();
        sleep(100);
        text(OK_OR_CANCEL).findOne().click();
        log("find one");
        return true;
    }
}

/**
 * 完整的一次课程参与功能
 * @param {配合内置搜索功能的标识} identification 
 * @param {课程的名称} className 
 * 
 * 详细描述：使用内置的搜索功能，在屏幕中找到每一节课
 *          判断当前的课是不是可选状态（主要就是防止误退选课），可以结合timeCheck()实现时间的过滤
 */
function search(identification, className) {
    
    var titleCellection = text(className).find();

    /** 如果当前的课还没有更新，就放弃后面的搜索，直接刷新 */
    if (titleCellection.isEmpty()) {
        log("no class");
        return;
    }

    var dots = this.dots;
    var dots = bounds(dots[0], dots[1], dots[2], dots[3]).clickable().click();
    // 唤醒抽屉的刷新时间
    sleep(100);
    /** 此处的reFresh指的是刷新页面的按钮 */
    var reFresh = text(searchButton).findOne();
    var reFresh_button = reFresh.parent();
    reFresh_button.click();
    var input = id(inputBoxId);
    input.setText(identification);
    var close = id(closeButtonId);
    click(540, windowTop);
    var nextButton = id(nextItemButtonId);
    for( var i = 0; i < titleCellection.length; ++i) {
        // var buttonCellection = text(button).find();
        var classCellection = text(className).find();

        for (var j = 0; j < titleCellection.length; ++j) {
            var uiObject = classCellection.get(j);
            var currentBounds = uiObject.bounds().top;
            if(currentBounds <= windowTop) {continue;}
            if (currentBounds >= windowBottom) {break;}
            
            if (buttonCheck(uiObject.bounds())) {
                close.click();
                return true;
            }
        }
        nextButton.click();
        
    }
}

/**
 * 程序的主入口
 * 
 * 默认是签两节课，因为一天之内只能约两节课
 */
 sleep(1000);
refresh();
var flag = 0;
while (flag < 2) {
    if (search(identification, className)) {
        flag++;
    }
    refresh();
}