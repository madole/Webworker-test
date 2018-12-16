import "./style";
import { Component, render } from "preact";
import { chunk } from "lodash";
import WorkerPool from "./workerPool";

const CANVAS_SIZE = 500;
const SQUARE_SIZE = 40;
const workerPool = new WorkerPool("workermabob.js", 50);

export default class App extends Component {
  state = {
    image: null,
    height: CANVAS_SIZE,
    width: CANVAS_SIZE
  };
  canvas = null;

  getContext() {
    return this.canvas.getContext("2d");
  }

  getRgba = values => {
    return chunk(values, 4).map(c => `rgba(${c.join(",")})`);
  };

  getMostPopularColorForSquare = (squareData, x, y) => {
    workerPool.postMessage(JSON.stringify({ squareData, x, y }));
  };

  analyseCanvas = () => {
    const { width, height } = this.state;
    const ctx = this.getContext();
    for (let i = 0; i < width; i += SQUARE_SIZE) {
      for (let j = 0; j < height; j += SQUARE_SIZE) {
        const pixelData = ctx.getImageData(i, j, SQUARE_SIZE, SQUARE_SIZE).data;
        const rgbaPixels = this.getRgba(pixelData);

        this.getMostPopularColorForSquare(rgbaPixels, i, j);
      }
    }
  };

  drawColoredSquareToCanvas = event => {
    const { color, x, y } = JSON.parse(event.data);

    const ctx = this.canvas2.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
    ctx.strokeStyle = "#ccc";
    ctx.rect(x, y, SQUARE_SIZE, SQUARE_SIZE);
    ctx.stroke();
    ctx.beginPath();
    const radius = (SQUARE_SIZE - 10) / 2;
    const offset = SQUARE_SIZE / 2;
    ctx.arc(x + offset, y + offset, radius, 0, 360);
    ctx.stroke();
  };

  drawImageToCanvas = () => {
    const { image } = this.state;
    const ctx = this.getContext();
    const img = new Image();

    img.onload = () => {
      this.setState(
        {
          height: img.naturalHeight,
          width: img.naturalWidth
        },
        () => {
          workerPool.registerOnMessage(this.drawColoredSquareToCanvas);
          ctx.drawImage(img, 0, 0);
          this.analyseCanvas();
        }
      );
    };
    img.src = image;
  };

  onChange = e => {
    const fr = new FileReader();
    fr.onload = () => {
      this.setState(
        {
          image: fr.result
        },
        this.drawImageToCanvas
      );
    };
    fr.readAsDataURL(e.target.files[0]);
  };

  render(props, { results = [] }) {
    return (
      <div>
        <input type="file" onChange={this.onChange} />
        <canvas
          class="hidden"
          ref={c => (this.canvas = c)}
          height={this.state.height}
          width={this.state.width}
        />
        <canvas
          ref={c => (this.canvas2 = c)}
          height={this.state.height}
          width={this.state.width}
        />
      </div>
    );
  }
}

if (typeof window !== "undefined") {
  render(<App />, document.getElementById("root"));
}
