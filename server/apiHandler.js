const db = require('../database');
const moment = require('moment');

const nestQueryObj = (rowKey, query) => {
  console.log(query);
  return `
    coalesce(
      (
        SELECT to_json(jsonb_object_agg(${rowKey}, row_to_json(x)))
        FROM (${query}) x
      ),
      '{}'
    )
  `;
};

const nestQueryArr = (query) => {
  return `
    coalesce(
      (
        SELECT array_to_json(array_agg(x))
        FROM (${query}) x
      ),
      '[]'
    )
  `;
};

const fetchProduct = (id, cb) => {
  const queryStr = `SELECT * FROM product WHERE id = ${id}`;
  db.query(queryStr, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      cb(res.rows);
    }
  })
};

const fetchQandA = async (product_id, cb) => {
  const queryQsStr =
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
            WHERE p.answer_id = a.answer_id`
          )} AS photos
        FROM answers a
        WHERE a.question_id = q.question_id`,
      )} AS answers
    FROM questions q
    WHERE product_id = ${product_id}`;
  await db.query(queryQsStr, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        const questionsArr = res.rows.map((row) => {
          return {
            question_id: row.question_id,
            question_body: row.question_body,
            question_date: parseInt(row.question_date),
            asker_name: row.asker_name,
            question_helpfulness: row.question_helpfulness,
            reported: row.reported > 0 ? true : false,
            answers: row.answers,
          }
        });
        cb({
          product_id,
          results: questionsArr,
        });
      }
    }
  );
};
const fetchAsForQ = async (question_id, cb) => {
  const queryStr =
    `SELECT
      a.answer_id,
      a.body,
      a.date,
      a.answerer_name,
      a.helpfulness,
      ${nestQuery(
        `SELECT
        p.photo_id AS id,
        p.url
        FROM photos p
        WHERE p.answer_id = a.answer_id`
      )} AS photos
    FROM answers a
    WHERE a.question_id = ${question_id}`;
  await db.query(queryStr, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        cb({
          question: question_id,
          page: 'NOT DYNAMIC',
          count: 'NOT DYNAMIC',
          results: res.rows,
        });
      }
    }
  );
};
const addQuestion = async (content, cb) => {
  let { product_id, body, name, email } = content;
  const queryStr = `
    INSERT INTO questions(product_id, body, asker_name, asker_email)
    VALUES(${product_id},'${body}','${name}','${email}');
  `;
  console.log('QUERY: ', queryStr);
  await db.query(queryStr, (err, res) => {
    if (err) {
      console.error(err);
    } else {
      cb()
    }
  })
};

const addAnswer = async (question_id, content, cb) => {
  let { body, name, email } = content;
  const queryStr = `
    INSERT INTO answers(question_id, body, answerer_name, answerer_email)
    VALUES(${question_id},'${body}','${name}','${email}');
  `;
  await db.query(queryStr, (err, res) => {
    if (err) {
      console.error(err);
    } else {
      cb();
    }
  })
}

const upvoteQuestions = async (question_id, cb) => {
  const queryStr = `
    UPDATE questions
    SET helpful = helpful + 1
    WHERE question_id = ${question_id}
  `;
  await db.query(queryStr, (err, res) => {
    if (err) {
      console.error(err);
    } else {
      cb();
    }
  })
}

const upvoteAnswers = async (answer_id, cb) => {
  const queryStr = `
    UPDATE answers
    SET helpfulness = helpfulness + 1
    WHERE answer_id = ${answer_id}
  `;
  await db.query(queryStr, (err, res) => {
    if (err) {
      console.error(err);
    } else {
      cb();
    }
  })
}

const reportQuestion = async (question_id, cb) => {
  const queryStr = `
    UPDATE questions
    SET reported = 1
    WHERE question_id = ${question_id}
  `;
  await db.query(queryStr, (err, res) => {
    if (err) {
      console.error(err);
    } else {
      cb();
    }
  })
}


module.exports = {
  fetchProduct,
  fetchQandA,
  fetchAsForQ,
  addQuestion,
  upvoteQuestions,
  upvoteAnswers,
  reportQuestion,
};
