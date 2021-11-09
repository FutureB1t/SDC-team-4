/* eslint-disable no-console */
/* eslint-disable prefer-const */
/* eslint-disable camelcase */
const moment = require('moment');
const app = require('axios');
const db = require('../database');


const fetchProduct = (id, cb) => {
  const queryStr = `SELECT * FROM product WHERE id = ${id}`;
  db.query(queryStr, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      cb(res.rows);
    }
  });
};

const queries = {
  qs: 'SELECT * FROM questions WHERE product_id = ',
  as: 'SELECT * FROM answers WHERE question_id = ',
  pics: 'SELECT * FROM photos WHERE answer_id = ',
};

const fetchQs = async (product_id, cb) => {
  const queryStr = queries.qs + product_id.toString();
  await db.query(queryStr, (err, data) => {
    if (err) {
      console.log('ERROR: ', err);
    } else {
      cb(data);
    }
  });
};

const fetchAs = async (question_id, cb) => {
  const queryStr = queries.as + question_id.toString();
  await db.query(queryStr, (err, data) => {
    if (err) {
      console.log('ERROR: ', err);
    } else {
      cb(data);
    }
  });
};
const fetchPics = async (answer_id, cb) => {
  const queryStr = queries.pics + answer_id.toString();
  await db.query(queryStr, (err, data) => {
    if (err) {
      console.log('ERROR: ', err);
    } else {
      cb(data);
    }
  });
};


const fetchQandA = async (product_id, cb) => {
  const queryStr = `Select
      questions.question_id,
      questions.product_id,
      questions.body as question_body,
      questions.date_written,
      questions.asker_name,
      questions.asker_email,
      questions.reported as question_reported,
      questions.helpful,
      answers.answer_id,
      answers.date as answer_date,
      answers.answerer_name,
      answers.answerer_email,
      answers.body as answer_body,
      answers.reported as answer_reported,
      answers.helpfulness,
      photos.photo_id,
      photos.url
    from questions
    left join answers on questions.question_id = answers.question_id
    left join photos on answers.answer_id = photos.answer_id
    where questions.product_id = ${product_id}
    -- and answers.question_id = questions.question_id
    -- and photos.answer_id = answers.answer_id
    order by questions.question_id;`;
  await db.query(queryStr, (err, data) => {
    const dbRows = data.rows;
    let container = {
      questions: {},
      answers: {},
      photos: {},
    };
    dbRows.forEach((r) => {
      const {
        question_id,
        question_body,
        date_written,
        asker_name,
        helpful,
        question_reported,
        answer_id,
        answer_date,
        answer_body,
        answerer_name,
        helpfulness,
        photo_id,
        url,
      } = r;
      const models = {
        answerModel: {
          id: answer_id,
          body: answer_body,
          date: answer_date,
          photos: [],
          helpfulness,
          answerer_name,
          question_id,
        },
        questionModel: {
          question_id,
          question_body,
          question_date: date_written,
          asker_name,
          question_helpfulness: helpful,
          reported: question_reported,
          answers: {},
        },
        photoModel: {
          url,
          answer_id,
          photo_id,
        },
      };
      if (question_body && answer_body && url) {
        container.questions[question_id] = models.questionModel;
        container.answers[answer_id] = models.answerModel;
        container.photos[answer_id] = models.photoModel;
      }
      if (question_body && answer_body && !url) {
        container.questions[question_id] = models.questionModel;
        container.answers[answer_id] = models.answerModel;
      }
      if (question_body && !answer_body && !url) {
        container.questions[question_id] = models.questionModel;
      }
    });
    Object.keys(container.photos).forEach((k) => {
      container.answers[k].photos.push({ url: `${container.photos[k].url}` });
    });
    Object.values(container.answers).forEach((v) => {
      container.questions[v.question_id].answers[v.id] = v;
    });
    if (err) {
      console.log(err);
    } else {
      console.log('SENDING DATA');
      cb(container.questions);
    }
  });
};

const fetchAsForQ = async (question_id, cb) => {
  const queryStr = `SELECT
      a.answer_id,
      a.body,
      a.date,
      a.answerer_name,
      a.helpfulness,
      ${nestQueryArr(`SELECT
        p.photo_id AS id,
        p.url
        FROM photos p
        // eslint-disable-next-line comma-dangle
        WHERE p.answer_id = a.answer_id`)}
        AS photos
    FROM answers a
    WHERE a.question_id = ${question_id}`;
  await db.query(queryStr, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      cb({
        question: question_id,
        page: 1,
        count: res.rows.length,
        results: res.rows,
      });
    }
  });
};
const addQuestion = async (content, cb) => {
  let {
    product_id,
    body,
    name,
    email,
  } = content;
  const queryStr = `
    INSERT INTO questions(product_id, body, asker_name, asker_email)
    VALUES(${product_id},'${body}','${name}','${email}');
  `;
  console.log('QUERY: ', queryStr);
  await db.query(queryStr, (err) => {
    if (err) {
      console.error(err);
    } else {
      cb();
    }
  });
};

const addAnswer = async (question_id, content, cb) => {
  let { body, name, email } = content;
  const queryStr = `
    INSERT INTO answers(question_id, body, answerer_name, answerer_email)
    VALUES(${question_id},'${body}','${name}','${email}')
    ON CONFLICT ON CONSTRAINT answers_pkey
    DO NOTHING;
  `;
  console.time('add answer query time');
  await db.query(queryStr, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.timeEnd('add answer query time');
      cb();
    }
  });
};

const upvoteQuestions = async (question_id, cb) => {
  const queryStr = `
  UPDATE questions
  SET helpful = helpful + 1
    WHERE question_id = ${question_id}
  `;
  await db.query(queryStr, (err) => {
    if (err) {
      console.error(err);
    } else {
      cb();
    }
  });
};

const upvoteAnswers = async (answer_id, cb) => {
  const queryStr = `
    UPDATE answers
    SET helpfulness = helpfulness + 1
    WHERE answer_id = ${answer_id}
  `;
  await db.query(queryStr, (err) => {
    if (err) {
      console.error(err);
    } else {
      cb();
    }
  });
};

const reportQuestion = async (question_id, cb) => {
  const queryStr = `
    UPDATE questions
    SET reported = 1
    WHERE question_id = ${question_id}
  `;
  await db.query(queryStr, (err) => {
    if (err) {
      console.error(err);
    } else {
      cb();
    }
  });
};

module.exports = {
  fetchProduct,
  fetchQs,
  fetchAs,
  fetchPics,
  fetchQandA,
  fetchAsForQ,
  addQuestion,
  addAnswer,
  upvoteQuestions,
  upvoteAnswers,
  reportQuestion,
};