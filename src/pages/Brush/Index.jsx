import React, { Component } from 'react';
import "./Index.less";
import * as PIXI from "@src/libs/pixi";
import "@src/libs/jscolor";
import { ChromePicker } from 'react-color'

const MOUSE_EVENT = {
    onMouseDown: "mousedown",
    onMouseMove: "mousemove",
    onMouseUp: "mouseup"
}

export default class Index extends Component {

    /** ref */
    stageCancas = React.createRef();
    _select = React.createRef();
    /**  数组坐标 */
    points = [];
    /** 步数 */
    step = 0;
    /** 每一步指令 */
    stepPoints = {};
    /** 当前坐标点 */
    currentPoints = [];
    /** 是否可以存储 */
    isStoke = false;
    /** 笔触 */
    line = null;
    /** 上一次坐标 */
    lastPoint = { x: 0, y: 0 };
    /** 舞台 */
    stage = null;
    /** 图片 */
    barrel = null;
    /** 演示球 */
    ball = null;


    state = {
        listTextArea: "路径数组...",
        color: "#ffffff", //画笔颜色
        lineWidth: 8 //画笔宽度
    }

    componentDidMount() {
        this.onInitStage();
    }


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

        const barrel = this.stage.addChild(PIXI.Sprite.from("//yun.duiba.com.cn/aurora/assets/aadb6da757437748e254d4b9ed09f7efb8248b12.jpg"));
        barrel.interactive = true;
        this.barrel = barrel;

        //球
        this.ball = this.stage.addChild(PIXI.Sprite.from("//yun.duiba.com.cn/aurora/assets/ed6f3a683c6a20633ad61d96603bce88b4a0d976.png"));
        this.ball.anchor.set(this.ball.width / 2, this.ball.height / 2)

        this.onAddEvents(barrel);

        this.line = new PIXI.Graphics();
        this.stage.addChild(this.line);
    }

    /** 事件监听 */
    onAddEvents(self) {
        self.on(MOUSE_EVENT.onMouseDown, this.onMouseDown, self);
        self.on(MOUSE_EVENT.onMouseMove, this.onMouseMove, self);
        self.on(MOUSE_EVENT.onMouseUp, this.onMouseUp, self);
    }

    /** 按下 */
    onMouseDown = (e) => {
        this.isStoke = true;
        let _x = e.data.global.x;
        let _y = e.data.global.y;
        this.lastPoint = { x: _x, y: _y };

        this.line.lineStyle(this.state.lineWidth, this.state.color.replace("#", "0x"), 1);
        this.line.moveTo(_x, _y);

        //第一个点
        this.currentPoints = [];
        this.currentPoints.push({ x: _x, y: _y });

    }

    /** 移动 */

    onMouseMove = (e) => {
        if (!this.isStoke) return;

        let point = {
            x: e.data.global.x,
            y: e.data.global.y
        }

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
    }
    /** 抬起 */
    onMouseUp = (e) => {
        this.isStoke = false;

        //每一步
        this.step++;
        this.stepPoints[this.step] = this.currentPoints;

        this.onGetOutPutArr();
    }

    //**输出数组 */
    onGetOutPutArr = () => {
        let outArr = [];
        for (let item in this.stepPoints) {
            outArr = [...outArr, ...this.stepPoints[item]]
        }
        this.setState({
            listTextArea: outArr.length > 0 ? JSON.stringify(outArr) : "路径数组..."
        });
    }

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

    /** 清除 */
    onClickClear = () => {
        this.line.clear();
        this.stepPoints = {};
        this.currentPoints = [];
        this.onGetOutPutArr();
    }

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

    /** 复制 */
    onClickCopy = () => {
        this._select.current.select();
        document.execCommand("Copy");
    }

    /** 绑定设置 - 画笔宽度 */
    onBindLineWidthOptions = (e) => {
        let lineWidth = Number(e.target.value);
        this.setState({ lineWidth });
    }

    /** 绑定设置 - 图片地址 */
    onBindimgUrlOptions = (e) => {
        this.barrel.texture = PIXI.Texture.fromImage(e.target.value);
    }

    /** 拖入图片 */
    ignoreDrag = (e) => {
        e.stopPropagation();
        e.preventDefault();
    }

    /** 拖拽 */
    drop = (e) => {
        e.stopPropagation();
        e.preventDefault();
        //取得拖进来的文件
        var data = e.dataTransfer;
        var files = data.files;
        //处理文件
        this.processFiles(files);
    }

    /** 处理图片文件 */
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


    render() {
        const { listTextArea } = this.state;
        return (
            <div className="content" onDragEnter={this.ignoreDrag} onDragOver={this.ignoreDrag} onDrop={this.drop}>
                <div className="brush">
                    <canvas ref={this.stageCancas}></canvas>
                </div>
                <div className="right">
                    <input type="text" readOnly="readonly" ref={this._select} value={listTextArea} />
                    <div className="code-con">
                        <code>{listTextArea}</code>
                    </div>
                    <button className="copy" onClick={this.onClickCopy}>复制</button>
                    <button type="button" className="undo" onClick={this.onUndoLastStep}>撤销上一步</button>
                    <button type="button" className="clear" onClick={this.onClickClear}>清除</button>
                    <button type="button" className="demo" onClick={this.onShowDemo}>演示</button>
                </div>
                <div className="left">
                    <div className="input-con">画笔宽度 px<input type="text" value={this.state.lineWidth} onChange={this.onBindLineWidthOptions} /></div>
                    <div className="input-con">画笔颜色</div>
                    <ChromePicker color={this.state.color} onChangeComplete={(color) => this.setState({ color: color.hex })} />
                    <div className="input-con">图片地址 750*1624<input type="text" onChange={this.onBindimgUrlOptions} /></div>
                    <div>注意: 你可以直接拖拽图片到画板上</div>
                </div>
            </div>
        );
    }
}
