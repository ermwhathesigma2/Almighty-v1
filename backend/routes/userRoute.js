import * as userController from '../controllers/userController.js';
import express from 'express';

const userRoute = express.Router();

userRoute.post('/new', userController.createAccount);
userRoute.post('/login', userController.login);
userRoute.post('/forgot-password', userController.forgotPassword);
userRoute.post('/reset-password', userController.resetPassword);
userRoute.get('/profile', userController.getProfile);
userRoute.patch('/profile', userController.updateProfile);
userRoute.patch('/password', userController.updatePassword);
userRoute.get('/riders', userController.getRiders);
userRoute.post('/riders', userController.addRider);
userRoute.patch('/riders/:id', userController.updateRider);
userRoute.delete('/riders/:id', userController.deleteRider);

export default userRoute;
