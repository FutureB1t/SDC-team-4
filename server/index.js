const express = require('express');
const api = require('./apiHandler');

const app = express();
const port = 8080;

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});
app.use(express.static(`${__dirname}/../client/dist`));

const endPoints = {
  fetchQandA: '/qa/questions/product_id=:id',
  fetchAsForQ: '/qa/questions/:id/answers',
  addQuestion: '/qa/questions',
  addAnswer: '/qa/questions/:id/answers',
  upvoteQuestions: '/qa/questions/:id/helpful',
  upvoteAnswers: '/qa/answers/:id/helpful',
  reportQuestion: '/qa/questions/:id/report',
};

app.get(endPoints.fetchQandA, (req, res) => {
  const { id } = req.params;
  api.fetchQandA(id, (data) => {
    res.status(200).send(data);
  });
});

app.get(endPoints.fetchAsForQ, (req, res) => {
  const { id } = req.params;
  api.fetchAsForQ(id, (data) => {
    res.status(200).send(data);
  });
});

app.post(endPoints.addQuestion, (req, res) => {
  const content = req.body;
  api.addQuestion(content, () => {
    res.status(204).send();
  });
});

app.post(endPoints.addAnswer, (req, res) => {
  const question_id = req.params.id;
  const content = req.body.body;
  api.addAnswer(question_id, content, () => {
    res.status(204).send();
  });
});

app.put(endPoints.upvoteQuestions, (req, res) => {
  const { id } = req.params;
  api.upvoteQuestions(id, () => {
    res.status(204).send();
  });
});

app.put(endPoints.upvoteAnswers, (req, res) => {
  const { id } = req.params;
  api.upvoteAnswers(id, () => {
    res.status(204).send();
  });
});

app.put(endPoints.reportQuestion, (req, res) => {
  const { id } = req.params;
  api.reportQuestion(id, (err) => {
    if (err) {
      console.log(err);
    }
    res.status(204).send();
  });
});

app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
