/* eslint-disable no-console */
/* eslint-disable prefer-const */
/* eslint-disable camelcase */
const moment = require('moment');
const db = require('../database');

const nestQueryObj = (rowKey, query) => (
  `coalesce(
    ( SELECT to_json(jsonb_object_agg(${rowKey}, row_to_json(X)))
      FROM (${query}) X
    ), '{}'
  )`
);

const nestQueryArr = (query) => (
  `coalesce(
    ( SELECT to_json(array_agg(x))
      FROM (${query}) x
    ), '[]'
  )`
);

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

// eslint-disable-next-line camelcase
const fetchQandA = async (product_id, cb) => {
  const queryQsStr = (
    `SELECT
      q.question_id,
      q.body AS question_body,
      q.date_written AS question_date,
      q.asker_name,
      q.helpful AS question_helpfulness,
      q.reported,
      ${nestQueryObj('id',
      // eslint-disable-next-line indent
        `SELECT
          a.answer_id AS id,
          a.body,
          a.date,
          a.answerer_name,
          a.helpfulness,
          ${nestQueryArr(
      // eslint-disable-next-line indent
          `SELECT url
            FROM photos p
            WHERE p.answer_id = a.answer_id`,
    // eslint-disable-next-line indent
          )} AS photos
        FROM answers a
        WHERE a.question_id = q.question_id`)
    // eslint-disable-next-line indent
      } AS answers
    FROM questions q
    WHERE product_id = ${product_id}`);
  await db.query(queryQsStr, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      const questionsArr = res.rows.map((row) => {
        for (let key in row.answers) {
          row.answers[key].photos = row.answers[key].photos.map((photo) => (photo.url));
          row.answers[key].date = moment.unix(parseInt(row.answers[key].date));
        }
        return {
          question_id: row.question_id,
          question_body: row.question_body,
          question_date: moment.unix(parseInt(row.question_date)),
          asker_name: row.asker_name,
          question_helpfulness: row.question_helpfulness,
          reported: row.reported > 0,
          answers: row.answers,
        };
      });
      cb({
        product_id,
        results: questionsArr,
      });
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
  await db.query(queryStr, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('QUERY: ',queryStr);
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
  fetchQandA,
  fetchAsForQ,
  addQuestion,
  addAnswer,
  upvoteQuestions,
  upvoteAnswers,
  reportQuestion,
};
