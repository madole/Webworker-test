import "./style";
import { Component, render } from "preact";
import { chunk } from "lodash";

const CANVAS_SIZE = 500;

const SQUARE_SIZE = 50;

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

  getMostPopularColorForSquare = squareData => {
    const groupedColors = squareData.reduce((prev, val) => {
      if (prev[val]) {
        prev[val].push(val);
      } else {
        prev[val] = [val];
      }
      return prev;
    }, {});

    let mostPopularColor = null;

    Object.entries(groupedColors).map(([key, val]) => {
      if (!mostPopularColor) {
        mostPopularColor = {
          key,
          length: val.length
        };
      } else if (mostPopularColor.length < val.length) {
        mostPopularColor = {
          key,
          length: val.length
        };
      }
    });
    return mostPopularColor.key;
  };

  analyseCanvas = () => {
    const { width, height } = this.state;
    const ctx = this.getContext();
    for (let i = 0; i < width; i += SQUARE_SIZE) {
      for (let j = 0; j < height; j += SQUARE_SIZE) {
        const pixelData = ctx.getImageData(i, j, SQUARE_SIZE, SQUARE_SIZE).data;
        const rgbaPixels = this.getRgba(pixelData);

        const mostPopularColor = this.getMostPopularColorForSquare(rgbaPixels);

        const ctx2 = this.canvas2.getContext("2d");
        ctx2.fillStyle = mostPopularColor;
        ctx2.fillRect(i, j, SQUARE_SIZE, SQUARE_SIZE);
      }
    }
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
