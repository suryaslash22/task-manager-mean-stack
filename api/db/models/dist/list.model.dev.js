"use strict";

var mongoose = require('mongoose');

var ListSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  }
});
var List = mongoose.model('List', ListSchema);
module.exports = {
  List: List
};
//# sourceMappingURL=list.model.dev.js.map
