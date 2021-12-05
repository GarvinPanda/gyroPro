import React from 'react';
import './Index.less';
import * as PIXI from "@src/libs/pixi";
import get2LoopList from '@src/libs/get2LoopList';
import firstList from './pointsList';

/** 方向 右上 左上 右下 左下 */
const DIR = {
    RT: "RT",
    LT: "LT",
    LB: "LB",
    RB: "RB"
}

class Index extends React.Component {

    stageCancas = React.createRef();
    //初始上左
    _curerentDir = DIR.LT;
    //轨道
    line = null;
    //小球
    ball = null;
    //当前坐标点
    currentPoint = {};
    //真实画线
    realLine = null;


    get curerentDir() {
        return this._curerentDir;
    }

    set curerentDir(v) {
        this._curerentDir = v;

    }

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.dealArr2List();
        this.onInitStage();
        this.onTestGyro();

    }

    /** 初始化舞台 */
    onInitStage = () => {
        const _c = this.stageCancas.current;
        //设计稿宽高
        const width = 750;
        const height = 1624;
        _c.width = document.body.clientWidth * (window.devicePixelRatio || 1);
        _c.height = document.body.clientHeight * (window.devicePixelRatio || 1);
        const app = new PIXI.Application(width, height, {
            view: _c,
            backgroundColor: 0x1099bb
        });

        app.ticker.add((deltaTime) => {
            if (this.ball) {
                this.onMoveDir();
            }
        });

        const barrel = app.stage.addChild(PIXI.Sprite.from("//yun.duiba.com.cn/aurora/assets/aadb6da757437748e254d4b9ed09f7efb8248b12.jpg"));

        //轨道
        this.line = new PIXI.Graphics();
        this.line.lineStyle(2, 0xffffff, 0.8);
        this.line.moveTo(firstList[0].x, firstList[0].y);
        app.stage.addChild(this.line);


        //真是画线
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

        //小球
        this.ball = app.stage.addChild(PIXI.Sprite.from("//yun.duiba.com.cn/aurora/assets/ed6f3a683c6a20633ad61d96603bce88b4a0d976.png"));
        this.ball.anchor.set(this.ball.width / 2, this.ball.height / 2);
        this.ball.position.set(this.currentPoint.element.x, this.currentPoint.element.y)

    }

    /**将坐标数组转化成双向链表 */
    dealArr2List = () => {
        const arr = firstList;
        const list = new get2LoopList();
        arr.forEach((item, index) => {
            list.append(item);
        });

        this.currentPoint = list.getHead();
    }

    /** 更新 */
    update = (deltaTime) => {
        switch (this.curerentDir) {
            case DIR.RT:
                this.ball.x++;
                this.ball.y--;
                break;
            case DIR.LT:
                this.ball.x--;
                this.ball.y--;
                break;
            case DIR.LB:
                this.ball.x--;
                this.ball.y++;
                break;
            case DIR.RB:
                this.ball.x++;
                this.ball.y++;
                break;
        }

    }


    /** 测试陀螺仪 */
    onTestGyro = () => {
        console.info('888')
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
    }

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

    /** 点击 */
    onClickIndx = () => {
        console.info("8989")
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
    }


    render() {
        return (
            <div className="index" onClick={this.onClickIndx}>
                <canvas ref={this.stageCancas}></canvas>
            </div>
        );
    }
}

export default Index;
