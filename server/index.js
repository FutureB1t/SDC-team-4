const express = require('express');
const api = require('./apiHandler');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(`${__dirname}/../client/dist`));

const endPoints = {
  endPoint1: '',
  endPoint2: '',
  endPoint3: '',
}

app.get(endPoints.endPoint1, (req, res) => {
  const { id } = req.params;
  api.fetch(id, (details) => {
    res.send(details.data);
  });
});

app.post(endPoints.endPoint2, (req, res) => {
  const {
    param1,
    param2,
  } = req.body;
  api.post(param1, param2, () => {
    res.end();
  });
});

app.put(endPoints.endPoint3, (req, res) => {
  const { param1 } = req.params;
  api.put(param1, (newData) => {
    res.status(200).send(newData.data);
  });
});

app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
