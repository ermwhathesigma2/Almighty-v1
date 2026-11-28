import jwt from 'jsonwebtoken';
import * as userService from '../services/userService.js';
import { sendOTP, verifyOTP } from '../services/otpService.js';
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'allmighty_secret_key';

function getUser(req) {
    const auth = req.headers.authorization;
    if (!auth) return null;
    try { return jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET); }
    catch { return null; }
}

export const createAccount = async (req, res) => {
    const { name, email, password, phone, address } = req.body;
    try {
        const result = await userService.createAccount({ name, email, password, phone, address });
        res.status(201).json({ success: true, message: result });
    } catch (e) {
        res.status(e.statusCode || 500).json({ error: e.message || 'Internal Server Error' });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await userService.login({ email, password });
        res.status(200).json({ success: true, ...result });
    } catch (e) {
        res.status(e.statusCode || 500).json({ error: e.message || 'Internal Server Error' });
    }
}

export const getProfile = async (req, res) => {
    const user = getUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized.' });
    try {
        const profile = await userService.getProfile(user.id);
        res.status(200).json({ success: true, user: profile });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

export const getRiders = async (req, res) => {
    try {
        const [rows] = await (await import('../config/db.js')).default.query(
            "SELECT id, name, email, phone FROM user WHERE role = 'delivery' ORDER BY name ASC"
        );
        res.status(200).json({ success: true, riders: rows });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

export const addRider = async (req, res) => {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    try {
        const pool = (await import('../config/db.js')).default;
        const [existing] = await pool.query("SELECT id FROM user WHERE email = ?", [email]);
        if (existing.length > 0) return res.status(400).json({ error: 'Email already exists.' });
        const bcrypt = await import('bcryptjs');
        const salt = bcrypt.default.genSaltSync(10);
        const hashed = bcrypt.default.hashSync(password, salt);
        await pool.query("INSERT INTO user (name, email, phone, password, role) VALUES (?, ?, ?, ?, 'delivery')", [name, email, phone || '', hashed]);
        res.status(201).json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

export const updateRider = async (req, res) => {
    const { name, email, phone, password } = req.body;
    try {
        const pool = (await import('../config/db.js')).default;
        if (password) {
            const bcrypt = await import('bcryptjs');
            const salt = bcrypt.default.genSaltSync(10);
            const hashed = bcrypt.default.hashSync(password, salt);
            await pool.query("UPDATE user SET name=?, email=?, phone=?, password=? WHERE id=?", [name, email, phone || '', hashed, req.params.id]);
        } else {
            await pool.query("UPDATE user SET name=?, email=?, phone=? WHERE id=?", [name, email, phone || '', req.params.id]);
        }
        res.status(200).json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

export const deleteRider = async (req, res) => {
    try {
        const pool = (await import('../config/db.js')).default;
        await pool.query("DELETE FROM user WHERE id = ? AND role = 'delivery'", [req.params.id]);
        res.status(200).json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

export const updateProfile = async (req, res) => {
    const user = getUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized.' });
    const { name, phone, address } = req.body;
    try {
        await userService.updateProfile(user.id, { name, phone, address });
        res.status(200).json({ success: true, message: 'Profile updated.' });
    } catch (e) {
        res.status(e.statusCode || 500).json({ error: e.message });
    }
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    try {
        const [rows] = await pool.query("SELECT id FROM user WHERE email = ?", [email]);
        if (rows.length === 0) return res.status(404).json({ error: 'No account found with this email.' });
        await sendOTP(email);
        res.status(200).json({ success: true, message: 'OTP sent to your email.' });
    } catch (e) {
        res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
    }
}

export const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ error: 'All fields are required.' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    try {
        const salt = bcrypt.genSaltSync(10);
        const hashed = bcrypt.hashSync(newPassword, salt);
        await pool.query("UPDATE user SET password = ? WHERE email = ?", [hashed, email]);
        res.status(200).json({ success: true, message: 'Password reset successfully.' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

export const updatePassword = async (req, res) => {
    const user = getUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized.' });
    const { currentPassword, newPassword } = req.body;
    try {
        await userService.updatePassword(user.id, currentPassword, newPassword);
        res.status(200).json({ success: true, message: 'Password updated.' });
    } catch (e) {
        res.status(e.statusCode || 500).json({ error: e.message });
    }
}
