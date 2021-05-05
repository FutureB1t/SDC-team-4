const axios = require('axios');
const API_KEY = require('../config.js');

const API_URL = '';
axios.defaults.headers.common.Authorization = API_KEY.TOKEN; // authorization for all requests


const fetch = (id, cb) => {
  const endPoint = '';
  axios.get(`${API_URL}/${endPoint}`)
    .then((data) => cb(data))
    .catch((err) => console.error(err));
};
const post = (content, cb) => {
  const endPoint = '';
  axios.post(`${API_URL}/${endPoint}`, content)
    .then((data) => cb(data))
    .catch((err) => console.error(err));
};
const put = (question_id, cb) => {
  const endPoint = '';
  axios.put(`${API_URL}/${endPoint}`)
    .then((data) => cb(data))
    .catch((err) => console.error(err));
};

module.exports = {
  fetch,
  post,
  put,
};
