## 

## 前言

万恶cp(某岗缩写)让我摇晃手机给小猫描个边. 

喵???

然后仔细想了想, 好像也不是全没有办法.

一个很久没有用到的功能出现在我脑海里, **陀螺仪**.

**什么是陀螺仪**

它是一种方向传感器, 在接收到方向改变的时候, 获得一些数据. 

方向改变事件指的是手机等移动设备反转的时候触发的事件.

移动端具备的陀螺仪功能能够做的事情很多. 他在我们web中存在一个API.

window对象中可以监听**deviceorientation**事件, 来调用移动端的陀螺仪.

但是我们本文主要使用它来进行方向的判断.


## 分析需求

首先, 摇晃手机, 移动画笔描边. 字越少, 事越大.

我们通过陀螺仪固然能拿到方向, 但是如何去描边呢?

试想一下, 我们可不可以事先绘制好路径, 然后移动画笔绘制路径呢?

貌似可以, 但是问题又来了, 

如何绘制这一条路径呢? 

这条路径我们需要怎么存储下来呢?

通过摇晃手机如何判断路径移动方向呢?

**实践是检验代码的唯一标准**

## 制作一个简易版画板工具

首先, 我们需要一块画板, 来绘制描边路径.

这里我选用react + pixijs来搭建画板.

项目结构我就不多赘述了, 直接开始. 我们先来看下完成后的画板.

[11]

功能介绍:

1. 设置画笔宽度✅
2. 设置画笔颜色✅
3. 绘制底图支持网络图片和本地图片拖拽✅
4. 展示并复制路径数组✅
5. 撤销✅
6. 清除✅
7. 演示✅

### 搭建舞台

使用react搭建页面, 同时搭建画布舞台.我们需要在舞台上绘制路径.

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

鼠标按下的时候记录第一步的第一个笔触.

```js
this.line.lineStyle(this.state.lineWidth, this.state.color.replace("#", "0x"), 1);
this.line.moveTo(_x, _y);

//第一个点
this.currentPoints = [];
this.currentPoints.push({ x: _x, y: _y });
```

鼠标移动的时候,存储每一个点位, 这里我们可以设置稀疏或者密集采集点位.

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

在鼠标抬起的时候, 我们就完成了一步命令的绘制,存储这一步绘制命令的所有点位.

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

## 给画版添加功能

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

我们来看下效果:

[22]

我在画板中写了个「猫」.效果还不错.














