import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

const users = [
  { name: 'Client User', email: 'client.dev@bnb.app', password: 'Client@12345' },
  { name: 'Host User', email: 'host.dev@bnb.app', password: 'Host@12345' },
  { name: 'Super Admin', email: 'admin@bnb.app', password: 'Admin@12345' },
];

const createUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    for (const userData of users) {
      const userExists = await User.findOne({ email: userData.email });
      if (userExists) {
        console.log(`User ${userData.email} already exists, updating password`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        userExists.password = hashedPassword;
        await userExists.save();
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        const user = new User({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
        });
        await user.save();
        console.log(`User ${userData.email} created`);
      }
    }

    console.log('Users created/updated successfully');
  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    mongoose.connection.close();
  }
};

createUsers();
