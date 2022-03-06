import React, { ReactElement, useEffect, useRef, useState } from "react";
import { getOHLCV } from "../api";
import CHART_DATA from "../const/chartData";
import Drawer from "../helper/Drawer";
import "./Chart.css";

interface CanvasProps {
    width: number;
    height: number;
}

export const Chart = ({ width, height }: CanvasProps): ReactElement => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawer = useRef<Drawer | null>(null);
    const [dragging, setDragging] = useState(false);
    const [lastX, setLastX] = useState(0);

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas: HTMLCanvasElement = canvasRef.current;
        const fetchData = async () => {
            //const chartData = await getOHLCV("10DAY", "2016-01-01T00:00:00");
            // console.log("res", chartData);

            const ctx = canvas.getContext("2d");
            if (ctx && !drawer.current) {
                drawer.current = new Drawer(ctx, CHART_DATA, {
                    dateHeight: 80,
                    barWidth: 15,
                    barSpace: 1,
                    canvasHeight: canvas.clientHeight,
                    canvasWidth: canvas.clientWidth,
                    scale: 10,
                    resolution: 100,
                });
                drawer.current.draw();
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!canvasRef.current) return;

        const getRect = () => {
            if (!canvasRef.current) return;
            const canvas: HTMLCanvasElement = canvasRef.current;
            return canvas.getBoundingClientRect();
        };

        const wheel = (event: WheelEvent) => {
            event.preventDefault();
            event.stopPropagation();

            if (drawer.current) {
                const delta = event.deltaY ? event.deltaY / 40 : 0;

                const rect = getRect();
                if (rect) {
                    const x = event.clientX - rect.left;
                    const y = event.clientY - rect.top;
                    drawer.current.zoom(delta, x, y);
                }
            }
        };

        const down = (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();

            setDragging(true);
            const rect = getRect();
            if (rect) setLastX(event.clientX - rect.left);
        };

        const move = (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();

            const rect = getRect();
            if (rect) {
                if (dragging && drawer.current) {
                    // 이동거리
                    const delta = event.clientX - rect.left - lastX;
                    drawer.current.reset();
                    drawer.current.translate(delta);

                    if (drawer.current.translated < -600)
                        drawer.current.setAdditionalData(CHART_DATA);
                    drawer.current.draw();
                }

                setLastX(event.clientX - rect.left);
            }
        };

        const up = (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();

            setDragging(false);
        };

        const canvas: HTMLCanvasElement = canvasRef.current;
        canvas.addEventListener("wheel", wheel);
        canvas.addEventListener("mousedown", down);
        canvas.addEventListener("mousemove", move);
        canvas.addEventListener("mouseup", up);

        // unmount
        return () => {
            canvas.removeEventListener("wheel", wheel);
            canvas.removeEventListener("mousedown", down);
            canvas.removeEventListener("mousemove", move);
            canvas.removeEventListener("mouseup", up);
        };
    }, [dragging, lastX]);

    return (
        <canvas
            className="canvas"
            ref={canvasRef}
            width={width}
            height={height}
        ></canvas>
    );
};

Chart.defaultProps = {
    width: 1200,
    height: 800,
};
