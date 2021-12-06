---
theme: vue-pro
---
## 有这么个需求

有这么一个需求, **摇晃手机移动小球给小猫描个边**. 

拉了一堆人评估, 看看具体怎么去实现.

看到这需求确实愣了下, 然后仔细想了想, 好像也不是全没有办法.

一个很久没有用到的功能出现在我脑海里, **「陀螺仪」**.

**什么是陀螺仪**

它是一种**方向传感器**, 在接收到方向改变的时候, 获得一些数据. 

方向改变事件指的是手机等移动设备反转的时候触发的事件.

移动端具备的陀螺仪功能能够做的事情很多. 他在我们web中存在一个API.

**window**对象中可以监听**deviceorientation**事件, 来调用移动端的陀螺仪传感器.

但是我们本文主要使用它来进行方向的判断.


就是给这只猫描个边. 规则 --- 只能摇晃手机


![WechatIMG388.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2a153cba6c524707b945f1046b59eb71~tplv-k3u1fbpfcp-watermark.image?)


## 分析一波

首先, 摇晃手机, 移动画笔描边. 字越少, 事越大.

我们通过陀螺仪固然能拿到方向, 但是如何去描边呢?

试想一下, 我们可不可以事先绘制好路径, 然后移动画笔绘制路径呢?

貌似可以, 但是问题又来了, 

如何绘制这一条路径呢? 

这条路径我们需要怎么存储下来呢?

通过摇晃手机如何判断路径移动方向呢?

**实践是检验代码的唯一标准**

我们首先来制作一个画板工具, 可以手动给猫猫描边.


## 制作一个简易版画板工具

首先, 我们需要一块画板, 来绘制描边路径.

这里我选用**react + pixijs**来搭建画板.

项目结构我就不多赘述了, 直接开始. 我们先来看下完成后的画板.

![WechatIMG376.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d694a67c083e46078df691c24a82d9c3~tplv-k3u1fbpfcp-watermark.image?)

功能介绍:

1. 设置画笔宽度✅
2. 设置画笔颜色✅
3. 绘制底图支持网络图片和本地图片拖拽✅
4. 展示并复制路径数组✅
5. 撤销✅
6. 清除✅
7. 演示✅

### 搭建舞台

使用**react**搭建页面, 同时搭建画布舞台.我们需要在舞台上绘制路径.

有兴趣的同学可以查看[源码](https://github.com/xdq1553/gyroPro)

这里我为了适配移动端, 使用`750*1624`的舞台尺寸.

```js
/** 初始化舞台 */
onInitStage = () => {
    const _c = this.stageCancas.current;
    //设计稿宽高
    const width = 750;
    const height = 1624;
    const app = new PIXI.Application(width, height, {
        view: _c,
        backgroundColor: 0x1099bb
    });
    app.ticker.add((deltaTime) => {

    });
    this.stage = app.stage;

    //底图
    const barrel = this.stage.addChild(PIXI.Sprite.from("./barrel.png"));
    barrel.interactive = true;
    this.barrel = barrel;

    //球
    this.ball = this.stage.addChild(PIXI.Sprite.from("./ball.png"));
    this.ball.anchor.set(this.ball.width / 2, this.ball.height / 2)

    this.onAddEvents(barrel);

    //绘制线
    this.line = new PIXI.Graphics();
    this.stage.addChild(this.line);
}

```
### 在画布上绘制路径

通过监听鼠标的按下、移动和抬起事件, 在画布上绘制不同的路径.

**鼠标按下**的时候记录第一步的第一个笔触.

```js
this.line.lineStyle(this.state.lineWidth, this.state.color.replace("#", "0x"), 1);
this.line.moveTo(_x, _y);

//第一个点
this.currentPoints = [];
this.currentPoints.push({ x: _x, y: _y });
```

**鼠标移动**的时候,存储每一个点位, 这里我们可以设置稀疏或者密集采集点位.

```js
//是否绘制点
let disX = Math.abs(point.x - this.lastPoint.x);
let disY = Math.abs(point.y - this.lastPoint.y);
let dis = Math.sqrt(disX * disX + disY * disY);

if (dis >= 2) {
    this.line.lineStyle(this.state.lineWidth, this.state.color.replace("#", "0x"), 1);
    this.line.lineTo(point.x, point.y);

    this.lastPoint = point;
    this.currentPoints.push({
        x: Math.floor(point.x),
        y: Math.floor(point.y)
    });
}
```

在**鼠标抬起**的时候, 我们就完成了一步命令的绘制,存储这一步绘制命令的所有点位.

```js
//每一步
this.step++;
this.stepPoints[this.step] = this.currentPoints;
```

然后输出所有绘制步骤的所有点位, 放在code标签中展示. 

```js
/**输出数组 */
onGetOutPutArr = () => {
    let outArr = [];
    for (let item in this.stepPoints) {
        outArr = [...outArr, ...this.stepPoints[item]]
    }
    this.setState({
        listTextArea: outArr.length > 0 ? JSON.stringify(outArr) : "路径数组..."
    });
}
```

这样子, 我们就可以一通过鼠标在画板上随意绘画了, 并且每一条路径都有记录. 

可以方便我们后面在正式项目中绘制.

### 给画版添加一些功能

1. 添加笔触宽度
2. 添加笔触颜色

```js
state = {
        listTextArea: "路径数组...",
        color: "#ffffff", //画笔颜色
        lineWidth: 8 //画笔宽度
    }
```

这里我使用`react-color`来搭建颜色拾取器.

```js
import { ChromePicker } from 'react-color';
```

效果真不错.

3. 添加复制路径功能

通过`execCommand`功能来实现复制.
```html
<input type="text" readOnly="readonly" ref={this._select} value={listTextArea} />
```

```js
this._select.current.select();
document.execCommand("Copy");
```

4. 添加撤销功能

通过控制步骤`step`来控制命令撤销.

删除对象中对应的步骤, 然后再重新使用画笔绘制路径.

```js
/** 撤销 */
onUndoLastStep = () => {
    delete this.stepPoints[this.step];
    this.step--;
    //重新绘制
    this.line.clear();
    for (let item in this.stepPoints) {
        let lineList = this.stepPoints[item];
        if (lineList && lineList.length > 0) {
            this.line.lineStyle(this.state.lineWidth, this.state.color.replace("#", "0x"), 1);
            this.line.moveTo(lineList[0].x, lineList[0].y);
            lineList.forEach(it => {
                this.line.lineTo(it.x, it.y);
            })
        }
    }
    this.onGetOutPutArr();
}
```

5. 添加清除功能

这里直接使用`clear()`方法.

同时记得清除步骤和坐标点.

```js
 /** 清除 */
onClickClear = () => {
    this.line.clear();
    this.stepPoints = {};
    this.currentPoints = [];
    this.onGetOutPutArr();
}
```

6. 添加演示功能

这里我用一个小球沿着路径运动.

```js
/** 演示 */
onShowDemo = () => {
    let count = 0;
    this.stage.addChild(this.ball);
    let outArr = [];
    for (let item in this.stepPoints) {
        outArr = [...outArr, ...this.stepPoints[item]]
    }
    let timer = setInterval(() => {
        move();
    }, 30);
    //移动
    const move = () => {
        count++;
        if (count >= outArr.length) {
            clearInterval(timer);
            return;
        }
        this.ball.position.set(outArr[count].x, outArr[count].y)
    }
}

```

7. 添加拖拽本地图片功能

这里我们使用`onDragEnter onDragOver onDrop`这三个触发事件进行拖拽.

将本地图片拖拽入画板之后, 我们将图片渲染到舞台中.

```js
/** 处理渲染图片文件 */
processFiles = (files) => {
    var file = files[0];
    var reader = new FileReader();
    let self = this;
    reader.onload = function (e) {
        let bg = new Image();
        bg.src = e.target.result;
        //绘制
        self.barrel.texture = PIXI.Texture.from(bg);
    };
    //读取图片
    reader.readAsDataURL(file);
}
```

这样子我们的建议画板就搭建好了.

我们来看下效果.我在画板中写了个「猫」


![WechatIMG378.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ad4ae89d81c14dddbf62ea2853257f6e~tplv-k3u1fbpfcp-watermark.image?)


## 移动端开发

前戏太长, 接下来才是主要需求.

首先绘制一张背景图, 背景图上带有一只猫.

需求需要我们摇晃手机, 移动小球给小猫描边.

为了方便演示, 我给路径先绘制一条**虚线**.

```js
this.realLine = new PIXI.Graphics();
this.realLine.lineStyle(8, 0xf4813e, 1);
this.realLine.moveTo(firstList[0].x, firstList[0].y);
app.stage.addChild(this.realLine);

firstList.forEach((item, index) => {
    if (index % 3 == 0) {
        if (index > 1)
            this.line.moveTo(firstList[index - 1].x, firstList[index - 1].y)
        this.line.lineTo(item.x, item.y);
    }
});
```

接着绘制一个小球.

后面会移动这个小球进行运动.

### 使用陀螺仪

在移动端H5页面中使用陀螺仪, 获取小球移动方向.

> 注意 <br/>
> 陀螺仪在ios中调用需要授权.<br/>
> 同时我们需要点击去触发授权弹窗.

下面是陀螺仪授权的一种兼容写法:

```js
// iOS 13+
if (window.DeviceOrientationEvent !== undefined && typeof window.DeviceOrientationEvent.requestPermission === 'function') {
    window.DeviceOrientationEvent.requestPermission()
        .then(function (response) {
            if (response == 'granted') {
                this.onTestGyro();
            }else{

            }
        }).catch(function (error) {
            console.log("error", error);
        });

} else {
    console.log("启动")
    this.onTestGyro();
}
```
授权成功之后, 我们就就可以获得**方向数据**了.

> 注意<br/>
> 陀螺仪会返回三个参数.<br/>
> alpha 绕z轴旋转 beta 绕x轴旋转 gamma 绕y轴旋转.

我这里只处理四个方向.

```js
/** 方向 右上 左上 右下 左下 */
const DIR = {
    RT: "RT",
    LT: "LT",
    LB: "LB",
    RB: "RB"
}
```
通过**beta**和**gamma**来确认方向, 因为只需要平面移动, 并不需要3d运动. 故只选择**beta和gamma.**

当`e.beta`在[-180,0]范围的时候, 方向为**top**, 否则**bottom**;

当`e.gamma`在[-180,0]范围的时候, 方向为**left**, 否则**right**;

使用代码判断如下:

```js
window.addEventListener("deviceorientation", (e) => {
    let _dir = "";
    if (e.beta >= -180 && e.beta <= 0) {
        _dir = _dir + "T";
    } else {
        _dir = _dir + "B";
    }
    if (e.gamma >= -180 && e.gamma <= 0) {
        _dir = "L" + _dir;

    } else {
        _dir = "R" + _dir;
    }
    // console.info("陀螺仪", `x: ${e.alpha}, y: ${e.beta}, z: ${e.gamma}`, _dir);
    this.curerentDir = DIR[_dir];
}, false);
```

这样就可以得到实时方向的变化了.


### 移动小球去给猫描边

我们要怎么去移动小球呢, 这里需要将我们的路径数组做成一个**双向循环列表**.

```js
//链表
var Node = function (element) {
    this.element = element;
    this.next = null;
    this.prev = null;
};
```

为链表添加一个可以**添加元素**的方法:

```js
this.append = function (element) {
    var node = new Node(element),
        current,
        previous;

    if (!head) {
        head = node;
        tail = node;
        head.prev = tail;
        tail.next = head;
    } else {
        current = head;

        while (current.next !== head) {
            previous = current;
            current = current.next;
        }

        current.next = node;
        node.next = head;
        node.prev = current;
    };

    head.prev = node;

    length++;
    return true;
};

```

实现一个双向循环链表之后, 我们将描边路径转化为链表.

```js
/**将坐标数组转化成双向链表 */
dealArr2List = () => {
    const arr = firstList;
    const list = new get2LoopList();
    arr.forEach((item, index) => {
        list.append(item);
    });

    this.currentPoint = list.getHead();
}

```

具有**当前点位、上一个点位以及下一个点位**. 我们每一帧去改变小球的位置. 

同时通过点位之间的比较, 得出上一个点位和下一个点位**相对于**当前点位的方向.

如果方向与陀螺仪获取到的方向一致, 则移动.

```js
/** 判断方向 */
onCheckDir = (element = {}, nextElement = {}) => {
    let _dir = "", disX = element.x - nextElement.x, disY = element.y - nextElement.y;
    //判断大方向
    if (Math.abs(disX) > Math.abs(disY)) {
        //判断左右
        if (disX > 0) {
            _dir = "L";

        } else {
            _dir = "R";
        }
    } else {
        //判断上下
        if (disY > 0) {
            _dir = "T";
        } else {
            _dir = "B";
        }
    }
    return this.curerentDir.indexOf(_dir) > -1 ? true : false;
}
```
确定了如何移动小球之后, 我们就需要去移动小球, 同时绘制出路径了.

```js
 /** 移动 */
onMoveDir = () => {
    const { element, next = {}, prev = {} } = this.currentPoint;
    const nextElement = next.element;
    const prevElement = prev.element;

    if (this.onCheckDir(element, nextElement)) {
        this.ball.x = nextElement?.x;
        this.ball.y = nextElement?.y;
        this.realLine.lineStyle(8, 0xf4813e, 1);
        this.realLine.lineTo(nextElement?.x, nextElement?.y);
        this.currentPoint = next;

    } else if (this.onCheckDir(element, prevElement)) {
        this.ball.x = prevElement?.x;
        this.ball.y = prevElement?.y;
        this.realLine.lineStyle(8, 0xf4813e, 1);
        this.realLine.lineTo(prevElement?.x, prevElement?.y);
        this.currentPoint = prev;
    }
}
```

这样子就大功告成了.

是不是很简单. 

接到这种需求的那一瞬间, 人是蒙的, 慢慢理一下, 其实错怪cp了, 他们也不容易. 

我们来看下演示效果:


![ed.gif](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f273eb6c640045ebb614300f5077b307~tplv-k3u1fbpfcp-watermark.image?)


这里视屏转gif太大了, 我就截取了中间一部分掩饰一下, 手机摇晃, 控制小球给猫猫描了一个边.

[你可以在这里看到源码]()


## 总结

一句话的需求, 我搞了个画板, 还做了个demo.🐶🐶🐶

同时调研了陀螺仪在移动端的应用, 所以不能带着有色眼镜去看cp, 他们毕竟能给你想出很多奇怪的点子.

即使这些点子让人爱恨交加.

大家都遇到过什么奇怪的需求呢? 

欢迎大家拍砖指正, 笔者功力尚浅, 如有不当之处请斧正.

**参考**

[deviceorientation](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/deviceorientation_event)


**文章粗浅, 望诸位不吝您的评论和点赞~**

**注: 本文系作者呕心沥血之作, 转载须声明**




























