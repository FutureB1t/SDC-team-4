/* eslint-disable no-console */
/* eslint-disable prefer-const */
/* eslint-disable camelcase */
const moment = require('moment');
const app = require('axios');
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

const queries = {
  qs: 'SELECT * FROM questions WHERE product_id = ',
  as: 'SELECT * FROM answers WHERE question_id = ',
  pics: 'SELECT * FROM photos WHERE answer_id = ',
  queryQs:
    `SELECT
    q.question_id,
    q.body AS question_body,
    q.date_written AS question_date,
    q.asker_name,
    q.helpful AS question_helpfulness,
    q.reported,
    ${nestQueryObj('id',
      `SELECT
        a.answer_id AS id,
        a.body,
        a.date,
        a.answerer_name,
        a.helpfulness,
        ${nestQueryArr(
        `SELECT url
          FROM photos p
          WHERE p.answer_id = a.answer_id`,
        )} AS photos
      FROM answers a
      WHERE a.question_id = q.question_id`)
    } AS answers
  FROM questions q
  WHERE product_id = `,
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
  const query = `Select *
    from questions
    left join answers on questions.question_id = answers.question_id
    left join photos on answers.answer_id = photos.answer_id
    where questions.product_id = ${product_id}
    order by questions.question_id;`;
  await db.query(query, (err, data) => {
    let result = {};
    const dbRows = data.rows;
    let container = {
      questions: {},
      answers: {},
      photos: {},
    };
    dbRows.forEach((r) => {
      if (!container.questions[r.question_id] && r.question_id) {
        container.questions[r.question_id] = r.body;
      } else if (!container.answers[r.answer_id] && r.answer_id) {
        container.answers[r.answer_id] = r.answer_id;
      } else if (!container.photos[r.photo_id] && r.photo_id) {
        container.photos[r.photo_id] = r.photo_id;
      } else {
        console.log(r);
      }
      // console.log(r);
      // const res = {};
      // res.question_id = r.question_id;
      // res.product_id = r.product_id;
      // res.body = r.body;
      // res.date_written = r.date_written;
      // res.asker_name = r.asker_name;
      // res.asker_email = r.asker_email;
      // res.reported = r.reported;
      // res.helpful = r.helpful;
      // res.answers = [];
      // container.questions[r.question_id] = res;
    });
    if (err) {
      console.log(err);
    } else {
      console.log('SENDING DATA', container);
      cb(container);
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