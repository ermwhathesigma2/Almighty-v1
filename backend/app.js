import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoute from './routes/userRoute.js';
import otpRoute from './routes/otpRoute.js';
import productRoute from './routes/productRoute.js';
import cartRoute from './routes/cartRoute.js';
import orderRoute from './routes/orderRoute.js';
import attendanceRoute from './routes/attendanceRoute.js';
import reportRoute from './routes/reportRoute.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5174']
}

const app = express();

app.use(express.json());
app.use(cors(corsOptions));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/auth', userRoute);
app.use('/otp', otpRoute);
app.use('/products', productRoute);
app.use('/cart', cartRoute);
app.use('/orders', orderRoute);
app.use('/attendance', attendanceRoute);
app.use('/reports', reportRoute);

try {
    const port = 3000;
    app.listen(port, () => {
        console.log(`Server running on port ${port}...`);
    });
} catch (e) {
    console.log(e);
}
