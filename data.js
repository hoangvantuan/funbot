const axiosBase = require('axios')

const url = "https://script.google.com/a/mediado.jp/macros/s/AKfycbwDkCLyh0e8PWuPqjS0IhM8Y_UgL_nxJmOBCq-QKKqha5Yz2L9n/exec"

const axios = axiosBase.create({
    baseURL: url,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    responseType: 'json'  
  });


axios.get('/').then((res) => {
    console.log(res.data);
})
  