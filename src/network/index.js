import jsCookie from 'js-cookie';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { createBrowserHistory } from "history";
const customHistory = createBrowserHistory();
const BASE_URL= process.env.REACT_APP_BASE_URL;
toast.configure();
 const getCookie = para => {
  let name = para + '=';
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
};

// To create unique id without param
export const uuidv4 = () => {
  var d = new Date().getTime();
  var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16;
      if (d > 0) {
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
      } else {
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

const apiCall = (method, url, actionType, reqData, params, headers) => {
  let reqHeaders = {};
  return new Promise((resolve, reject) => {
    let accessToken = JSON.parse(getCookie('accessToken'));
      reqHeaders = {
        Authorization: `Bearer ${accessToken.accessToken}`,
      };

    axios({
      method: method,
      url: BASE_URL+ url,
      data: reqData,
      headers: reqHeaders,
    }).then(async response => {
      let data = response.result;  
      resolve(response.data);
    });
  });
};


const apiCall2 = async (method, url, reqData) => {
  let reqHeaders = {};
  let accessToken = JSON.parse(getCookie('accessToken'));
      reqHeaders = {
        Authorization: `Bearer ${accessToken.accessToken}`,
      };   
  try {
    let response = await axios({
      method: method,
      url: BASE_URL + url,
      data: reqData,
      headers: reqHeaders
    });
     return response;
    }
    catch(e){
      return e;
    } 
};

const loginApiCall = (
  method,
  url,
  actionType,
  reqData,
  params,
  headers,
) => {
  return new Promise((resolve, reject) => {
    axios({
      method: method,
      url: BASE_URL + url,
      data: reqData,
    })
      .then(response => {       
        let { data } = response;  
              if (data.statusCode === "200") {
                resolve(response.data);
              }
              else if (data.statusCode === "500") {                
                toast.error(data.result.message);
                resolve(response.data);
              }
      })
      .catch((error) => {
        toast.error("Error: Network Error");
        resolve({statusCode :"500"});
      });
  });
};
const MagentoapiCall = (method, url, actionType, reqData, params, headers) => {
  let accessToken = JSON.parse(getCookie('accessToken'));
  let reqHeaders = {
    Authorization: `Bearer ${accessToken.accessToken}`,
  };  
  return new Promise((resolve, reject) => {
    axios({
      method: method,
      url: BASE_URL + url,
      data: reqData,
      headers: reqHeaders
    }).then(async response => {
           let { data } = response;  
              if (data.statusCode === "200") {
                resolve(data.result);
              }
              else if (data.statusCode === "500") {                
                toast.error(data.result.message);
                return;
              }
      // let data = response.data.result;
      // resolve(data);
    
    });
  });
};

export { loginApiCall, MagentoapiCall, apiCall, apiCall2,getCookie,BASE_URL }