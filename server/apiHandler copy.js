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

// const fetchQandA = async (product_id, cb) => {
//   const query = queries.queryQs + product_id.toString();
//   await db.query(query, (err, data) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log('SENDING DATA');
//       cb(data.rows);
//     }
//   });
// };
// eslint-disable-next-line camelcase
const fetchQandA = async (product_id, cb) => {


  const result = {curtis: 5};

  const Qs = await fetchQs(product_id, (data) => {
    let questionsCont = {};
    const questions = data.rows;
    questions.forEach((q) => {
      const res = {};
      res.question_id = q.question_id;
      res.product_id = q.product_id;
      res.body = q.body;
      res.date_written = q.date_written;
      res.asker_name = q.asker_name;
      res.asker_email = q.asker_email;
      res.reported = q.reported;
      res.helpful = q.helpful;
      res.answers = [];
      questionsCont[q.question_id] = res;
    });
    result.questions = questionsCont;
    console.log('questions',questionsCont);
  })
  .catch((err) => console.log('ERROR:', err));

};

// const answers = Object.values(questions).map(async (q) => {
//   await fetchAs(q.question_id, (data) => {
//     const answersCont = [];
//     const answerArr = data.rows;
//     answerArr.forEach((a) => {
//       const res = {};
//       res.answer_id = a.answer_id;
//       res.product_id = a.product_id;
//       res.body = a.body;
//       res.date_written = a.date_written;
//       res.answerer_name = a.answerer_name;
//       res.answerer_email = a.answerer_email;
//       res.reported = a.reported;
//       res.helpful = a.helpful;
//       res.photos = [];
//       answersCont.push(res);
//     });
//     return answersCont;
//   }).then(() => {console.log('answers fetched')}).catch((err) => console.log(err));
// });
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