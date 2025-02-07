// backend/server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const config = require('./config.json');
const db = require('./database');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // In production, set secure to true when using HTTPS
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  });
  

// CSRF protection for admin routes
const csrfProtection = csurf({ cookie: true });

// Serve static files from frontend directories
app.use('/user', express.static(path.join(__dirname, '../frontend/user')));
app.use('/admin', express.static(path.join(__dirname, '../frontend/admin')));

// ==========================
// USER ROUTES
// ==========================

// User login: check against the users table.
app.post('/api/user/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required." });
    }
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error." });
        }
        if (!user) {
            return res.status(401).json({ message: "User not found. Please contact the admin." });
        }
        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid password." });
        }
        req.session.user = { username };
        return res.json({ message: "User login successful." });
    });
});

// backend/server.js (updated booking endpoint)
app.post('/api/user/book', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    const { username } = req.session.user;
    const { room, date, startTime, endTime } = req.body;
    if (!room || !date || !startTime || !endTime) {
        return res.status(400).json({ message: "Room, date, start time, and end time are required." });
    }

    // Check for conflicting bookings.
    // Two time frames conflict if: existing.startTime < requested.endTime AND existing.endTime > requested.startTime
    db.all(
        "SELECT * FROM bookings WHERE room = ? AND date = ? AND status = 'approved' AND startTime < ? AND endTime > ?",
        [room, date, endTime, startTime],
        (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Database error." });
            }
            if (rows.length > 0) {
                // At least one booking conflicts with the requested time frame.
                return res.status(400).json({ message: "Booking conflicts with an existing booking." });
            }

            // No conflict detected; proceed to insert the booking.
            const status = 'approved';
            const stmt = db.prepare("INSERT INTO bookings (username, room, date, startTime, endTime, status) VALUES (?, ?, ?, ?, ?, ?)");
            stmt.run(username, room, date, startTime, endTime, status, function(err) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: "Database error." });
                }
                res.json({ message: "Booking submitted.", bookingId: this.lastID, status });
            });
            stmt.finalize();
        }
    );
});


// Endpoint for a user to view their own bookings.
app.get('/api/user/bookings', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    const username = req.session.user.username;
    db.all("SELECT * FROM bookings WHERE username = ?", [username], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Database error." });
        }
        res.json({ bookings: rows });
    });
});

// Endpoint for a user to cancel one of their bookings.
app.post('/api/user/cancel/:id', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    const username = req.session.user.username;
    const bookingId = req.params.id;
    db.get("SELECT * FROM bookings WHERE id = ? AND username = ?", [bookingId, username], (err, row) => {
        if (err) return res.status(500).json({ message: "Database error." });
        if (!row) return res.status(404).json({ message: "Booking not found." });
        if (row.status === 'cancelled') return res.status(400).json({ message: "Booking already cancelled." });
        db.run("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [bookingId], function(err) {
            if (err) return res.status(500).json({ message: "Database error." });
            res.json({ message: "Booking cancelled." });
        });
    });
});

// Availability check endpoint.
// It now expects room, date, startTime and endTime and checks for overlapping approved bookings.
app.get('/api/availability', (req, res) => {
    const { room, date, startTime, endTime } = req.query;
    if (!room || !date || !startTime || !endTime) {
        return res.status(400).json({ message: "Room, date, start time, and end time required." });
    }
    // Check for overlapping approved bookings.
    // Two time frames overlap if: existing.startTime < requested.endTime AND existing.endTime > requested.startTime
    db.all("SELECT * FROM bookings WHERE room = ? AND date = ? AND status = 'approved' AND startTime < ? AND endTime > ?", 
      [room, date, endTime, startTime], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error." });
        }
        if (rows.length > 0) {
            return res.json({ available: false, message: "Time frame conflicts with an existing booking." });
        } else {
            return res.json({ available: true, message: "Time slot available." });
        }
    });
});

// ==========================
// ADMIN ROUTES
// ==========================

// Admin login: verifies admin credentials.
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === config.adminUsername && password === config.adminPassword) {
        req.session.admin = { username };
        return res.json({ message: "Admin login successful." });
    } else {
        return res.status(401).json({ message: "Invalid admin credentials." });
    }
});

// Middleware to check if admin is logged in.
function adminAuth(req, res, next) {
    if (req.session.admin) {
        next();
    } else {
        res.status(401).json({ message: "Unauthorized. Please log in as admin." });
    }
}

// Endpoint to retrieve an overview of ALL bookings.
app.get('/api/admin/allBookings', adminAuth, csrfProtection, (req, res) => {
    db.all("SELECT * FROM bookings", [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error." });
        }
        res.json({ bookings: rows, csrfToken: req.csrfToken() });
    });
});

// Endpoint to create a new user (only admin can do this).
app.post('/api/admin/createUser', adminAuth, csrfProtection, (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required." });
    }
    const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    stmt.run(username, password, function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error creating user. It might already exist." });
        }
        res.json({ message: "User created successfully." });
    });
    stmt.finalize();
});

// Endpoint to list all registered users.
app.get('/api/admin/users', adminAuth, csrfProtection, (req, res) => {
    db.all("SELECT id, username FROM users", [], (err, rows) => {
        if (err) return res.status(500).json({ message: "Database error." });
        res.json({ users: rows, csrfToken: req.csrfToken() });
    });
});

// New endpoint for admin to delete a booking.
app.delete('/api/admin/booking/:id', adminAuth, csrfProtection, (req, res) => {
    const bookingId = req.params.id;
    db.run("DELETE FROM bookings WHERE id = ?", [bookingId], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error." });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: "Booking not found." });
        }
        res.json({ message: "Booking deleted." });
    });
});

// New endpoint for admin to delete a user.
app.delete('/api/admin/user/:id', adminAuth, csrfProtection, (req, res) => {
    const userId = req.params.id;
    db.run("DELETE FROM users WHERE id = ?", [userId], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error." });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: "User not found." });
        }
        res.json({ message: "User deleted." });
    });
});

// Admin logout.
app.post('/api/admin/logout', adminAuth, (req, res) => {
    req.session.destroy();
    res.json({ message: "Admin logged out." });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
