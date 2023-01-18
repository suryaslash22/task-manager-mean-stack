//This file will handle connection logic to MongoDB

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1:27017/TaskManager', {useNewUrlParser: true }). then(() => {
    console.log("Connected to MongoDB successfully!");
}).catch((e) => {
    console.log("Error connecting to MongoDB");
    console.log(e);
});

// to prevent deprecation warnings
// mongoose.set('useCreateIndex', true);
// mongoose.set('strictQuery', true);
// mongoose.set('useFindAndModify', false);

module.exports = {
    mongoose
};