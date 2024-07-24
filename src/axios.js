import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://43.202.201.149:9095', // 백엔드 서버 주소
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
  withCredentials: true, // 세션 쿠키를 포함하여 요청
});

export default instance;
