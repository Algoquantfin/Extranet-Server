const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust the path as necessary

mongoose.connect('mongodb://localhost:27017/Login', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const users = [
  { username: 'devansh', password: '12345' },
  { username: 'dhruv', password: '12345' },
];

const addUsers = async () => {
  try {
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`User ${user.username} added.`);
    }
    mongoose.connection.close();
  } catch (error) {
    console.error('Error adding users:', error);
  }
};

addUsers();
