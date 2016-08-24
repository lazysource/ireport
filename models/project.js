/**
* A Project class holds all the information about project (report) opened by the user.
*/
module.exports = function Project (name, path) {
  this.name = name;
  this.path = path;
  this.lastOpenedAt = Date.now();
}
