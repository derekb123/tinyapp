// const emailCheck = function(email, list) {
//   for (item in list) {
//     if (email === list[item].email) {
//       return true;
//     }
//   }
//   return false;
// }

const getUserObjByEmail = function(email, database) {
  for (userObj in database) {
    if (email === database[userObj].email) {
      return database[userObj];
    }
  }
}


module.exports = {
  getUserObjByEmail,
}