const models = {
  questionModel: {
    question_id,
    question_body,
    question_date: date_written,
    asker_name,
    question_helpfulness: helpful,
    reported: question_reported,
    answers: {},
  },
  answerModel: {
    id: answer_id,
    body: answer_body,
    date: answer_date,
    photos: [],
    helpfulness,
    answerer_name,
    question_id,
  },
  photoModel: {
    url,
    answer_id,
    photo_id,
  },
}

module.exports = models;