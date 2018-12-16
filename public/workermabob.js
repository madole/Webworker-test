const getMostPopularColorForSquare = squareData => {
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

onmessage = event => {
  console.log("MESSAGE RECEIVED", event.data);
  const { squareData, x, y } = JSON.parse(event.data);
  const color = getMostPopularColorForSquare(squareData);
  postMessage(JSON.stringify({ color, x, y }));
};
