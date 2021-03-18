const os = require('os');
const path = require('path');


const tempFilePath = path.join(os.tmpdir(), 'subscription.json');
console.log(tempFilePath);
var store = {users: {ahmed:{sub: 'test'}}}
console.log(store['users'])
store.users['user']={test: {sub:'test2'}}
console.log(store['users'].h)