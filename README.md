# Chart

## Start Project

```sh
npm install
npm run start
```

or

```sh
yarn
yarn start
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm run build`

build the project

## Api Reference

In this code, the api is commented.
You can use api with below codes in Chart.tsx

```javascript
const chartData = await getOHLCV("10DAY", "2016-01-01T00:00:00");
drawer.current = new Drawer(ctx, chartData, {
    dateHeight: 80,
    barWidth: 15,
    barSpace: 1,
    canvasHeight: canvas.clientHeight,
    canvasWidth: canvas.clientWidth,
    scale: 10,
    resolution: 100,
});
```

Check below the api website.
[CoinApi](https://docs.coinapi.io/#historical-data-get)

## Structures

component : component included
api : api included
const : const included
helper: helper included
interface: interface included
.env: API KEY included
