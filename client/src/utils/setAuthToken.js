// To add a global header
import axios from 'axios';

const setAuthToken = token => {
  if (token) {
    // in the localStorage
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

export default setAuthToken;
