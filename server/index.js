/* eslint-disable camelcase */
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
  fetchAllQA: '/qa/questions/product_id=:id',
  fetchQuestionAnswers: '/qa/questions/:id/answers',
  addQuestion: '/qa/questions',
  addAnswer: '/qa/questions/:id/answers',
  upvoteQuestions: '/qa/questions/:id/helpful',
  upvoteAnswers: '/qa/answers/:id/helpful',
  reportQuestion: '/qa/questions/:id/report',
};
const testEndPoints = {
  fetchProduct: '/product/product_id=:id',
  fetchQuestions: '/questions/product_id=:id',
  fetchAnswers: '/answers/question_id=:id',
  fetchPics: '/photos/answer_id=:id',
};

app.get(endPoints.fetchAllQA, (req, res) => {
  const { id } = req.params;
  api.fetchAllQA(id, (data) => {
    res.status(200).send(data);
  });
});

app.get(endPoints.fetchQuestionAnswers, (req, res) => {
  const { id } = req.params;
  api.fetchQuestionAnswers(id, (data) => {
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
  const content = req.body;
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
      throw new Error('ERROR: ', err);
    }
    res.status(204).send();
  });
});

/*
>>>>>>>>>>>>>>>>>START<<<<<<<<<<<<<<<<<<<<<<<
*/
app.get(testEndPoints.fetchProduct, (req, res) => {
  const product_id = req.params.id;
  api.fetchProduct(product_id, (data) => {
    res.status(200).send(data.rows);
  });
});
app.get(testEndPoints.fetchQuestions, (req, res) => {
  const product_id = req.params.id;
  api.fetchQuestions(product_id, (data) => {
    res.status(200).send(data.rows);
  });
});
app.get(testEndPoints.fetchAnswers, (req, res) => {
  const question_id = req.params.id;
  api.fetchAnswers(question_id, (data) => {
    res.status(200).send(data.rows);
  });
});
app.get(testEndPoints.fetchPics, (req, res) => {
  const answer_id = req.params.id;
  api.fetchPics(answer_id, (data) => {
    res.status(200).send(data.rows);
  });
});
/*
>>>>>>>>>>>>>>>>>END<<<<<<<<<<<<<<<<<<<<<<<
*/
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`server is listening on port ${port}`);
});
