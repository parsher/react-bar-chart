import Data from "../interface/chart/Data";
import Coordinate from "../interface/chart/Coordinate";
import DrawOption from "../interface/chart/DrawOption";
import DataMeta from "../interface/chart/DataMeta";
import Bar from "../interface/chart/Bar";
import Text from "../interface/chart/Text";

class Drawer {
    color = {
        red: "rgba(200,0,0, 0.5)",
        blue: "rgba(0, 0, 200, 0.5)",
        black: "rgba(0,0,0, 1)",
        grey: "rgba(0,0,0, 0.2)",
    };
    factor: number = 1;
    ctx?: CanvasRenderingContext2D;
    position: Coordinate = { x: 10, y: 10 };
    option: DrawOption = {
        dateHeight: 80,
        barSpace: 1,
        barWidth: 10,
        canvasHeight: 800,
        canvasWidth: 1200,
        resolution: 100 / 100, // 해상도 휠에 따라서 움직인다.
        scale: 10,
    };
    dataList: Array<Data> = [];
    dataMeta: DataMeta = {
        max: 0,
        min: Number.POSITIVE_INFINITY,
    };
    translated: number = 0; // 누적된 이동 값

    constructor(
        ctx: CanvasRenderingContext2D,
        initData?: Array<Data>,
        option?: DrawOption
    ) {
        if (!ctx) {
            console.error("ctx is not defined");
            return;
        }
        this.ctx = ctx;

        if (initData) this.dataList = initData;

        if (option) {
            option.resolution = option.resolution / 100;
            this.option = option;
        }

        this.resetPosition();
    }

    scale(x: number, y: number) {
        if (!this.ctx) return console.error("ctx is not defined");

        this.ctx.scale(x, y);
    }

    resetPosition() {
        this.position = {
            x: 10,
            y: this.option.canvasHeight - this.option.dateHeight,
        };
    }

    reset() {
        if (!this.ctx) return console.error("ctx is not defined");

        this.ctx.clearRect(
            -this.translated,
            -this.option.canvasHeight,
            this.getChartWidth() * Math.max(this.factor, 3),
            this.option.canvasHeight * Math.max(this.factor, 3)
        );
        this.resetPosition();
    }

    zoom(delta: number, x: number, y: number) {
        if (!this.ctx) return console.error("ctx is not defined");

        this.reset();
        this.ctx.translate(x, y);
        this.factor = Math.pow(1.1, delta);
        this.ctx.scale(this.factor, this.factor);
        this.ctx.translate(-x, -y);
        this.draw();
    }

    translate(delta: number) {
        if (!this.ctx) return console.error("ctx is not defined");

        this.translated += delta;
        this.ctx.translate(delta, 0);
    }

    drawBar({ x, y, width, height, color }: Bar) {
        if (!this.ctx) return console.error("ctx is not defined");

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }

    drawText({ text, x, y, align, angle, size }: Text) {
        if (!this.ctx) return console.error("ctx is not defined");
        if (!size) size = 10;

        this.ctx.font = `${size}px serif`;
        this.ctx.textAlign = align;
        this.ctx.fillStyle = this.color.black;

        if (angle) {
            this.ctx.textBaseline = "bottom";
            this.ctx.save();
            this.ctx.translate(x, y); // 중앙점 평행이동
            this.ctx.rotate(angle * (Math.PI / 180)); // 중앙점 기준으로 회전
            this.ctx.fillText(text, 0, 0);
            this.ctx.restore();
        } else {
            this.ctx.fillText(text, x, y);
        }
    }

    findMaxMin() {
        if (!this.dataList) return;

        this.dataList.forEach((data: Data) => {
            this.dataMeta.max = Math.max(this.dataMeta.max, data.price_high);
            this.dataMeta.min = Math.min(this.dataMeta.min, data.price_low);
        });
    }

    getCanvasScale() {
        return this.option.canvasHeight / this.option.scale;
    }

    getDataAreaScale() {
        // ctx.measureText(text) width of the date
        return (
            (this.option.canvasHeight - this.option.dateHeight) /
            this.option.scale
        );
    }

    getDataScale() {
        return (this.dataMeta.max - this.dataMeta.min) / this.option.scale;
    }

    getHeight(price: number): number {
        const dataScale = this.getDataScale();
        const canvasScale = this.getDataAreaScale();
        return (price / dataScale) * canvasScale * this.option.resolution;
    }

    getChartWidth() {
        return Math.max(
            this.dataList.length *
                (this.option.barWidth + this.option.barSpace),
            this.option.canvasWidth
        );
    }

    setAdditionalData(additionalData?: Array<Data>) {
        if (additionalData) {
            this.dataList = this.dataList.concat(additionalData);
        }
    }

    draw() {
        if (!this.ctx) return console.error("ctx is not defined");
        if (!this.dataList) return console.error("data is not defined");

        this.findMaxMin();

        const dataScale = this.getDataScale();
        const canvasScale = this.getDataAreaScale();
        const chartWidth = this.getChartWidth();
        let axisHeight = this.position.y;
        let axisValue = this.dataMeta.min;
        for (let i = 0; i < this.option.scale; i++) {
            // 가로축
            this.drawBar({
                x: 0,
                y: axisHeight,
                width: chartWidth,
                height: 1,
                color: i === 0 ? this.color.black : this.color.grey,
            });

            this.drawText({
                text: String(axisValue.toFixed(2)),
                x: chartWidth - 10,
                y: axisHeight,
                align: "right",
            });

            axisValue += dataScale;
            axisHeight -= canvasScale;
        }

        // 세로축
        this.drawBar({
            x: chartWidth - this.position.x,
            y: 0,
            width: 1,
            height: this.option.canvasHeight,
            color: this.color.black,
        });

        this.dataList.forEach(
            (
                {
                    price_close,
                    price_open,
                    price_high,
                    price_low,
                    time_close,
                }: Data,
                index
            ) => {
                if (index !== 0) this.position.x += this.option.barWidth;

                // Date
                const closeDate = time_close.split("T")[0];
                this.drawText({
                    text: closeDate,
                    x: this.position.x + this.option.barWidth,
                    y: this.option.canvasHeight - 40,
                    align: "center",
                    angle: 270,
                });
                // DateBar
                this.drawBar({
                    x: this.position.x + this.option.barWidth / 2,
                    y: this.option.canvasHeight - this.option.dateHeight + 6,
                    width: 1,
                    height: -this.option.canvasHeight,
                    color: this.color.grey,
                });

                const openHeight = this.getHeight(price_open);
                const closeHeight = this.getHeight(price_close);
                const highHeight = this.getHeight(price_high);
                const lowHeight = this.getHeight(price_low);

                if (price_close > price_open) {
                    const barHeihgt = closeHeight - openHeight;
                    const color = this.color.red;

                    // 바
                    this.drawBar({
                        x: this.position.x,
                        y: this.position.y - barHeihgt,
                        width: this.option.barWidth,
                        height: barHeihgt,
                        color,
                    });

                    // 상단
                    this.drawBar({
                        x: this.position.x + (this.option.barWidth - 1) / 2,
                        y:
                            this.position.y -
                            barHeihgt -
                            (highHeight - closeHeight),
                        width: 1,
                        height: highHeight - closeHeight,
                        color,
                    });

                    // 하단
                    this.drawBar({
                        x: this.position.x + (this.option.barWidth - 1) / 2,
                        y: this.position.y,
                        width: 1,
                        height: closeHeight - lowHeight,
                        color,
                    });

                    this.position.y -= barHeihgt;
                    this.position.x += this.option.barSpace;
                } else {
                    const barHeihgt = openHeight - closeHeight;
                    const color = this.color.blue;

                    // 바
                    this.drawBar({
                        x: this.position.x,
                        y: this.position.y + barHeihgt,
                        width: this.option.barWidth,
                        height: -barHeihgt,
                        color,
                    });

                    // 상단
                    this.drawBar({
                        x: this.position.x + (this.option.barWidth - 1) / 2,
                        y: this.position.y - (highHeight - openHeight),
                        width: 1,
                        height: highHeight - openHeight,
                        color,
                    });

                    // 하단
                    this.drawBar({
                        x: this.position.x + (this.option.barWidth - 1) / 2,
                        y:
                            this.position.y +
                            barHeihgt +
                            (closeHeight - lowHeight),
                        width: 1,
                        height: -(closeHeight - lowHeight),
                        color,
                    });

                    this.position.y += barHeihgt;
                    this.position.x += this.option.barSpace;
                }
            }
        );
    }
}

export default Drawer;
