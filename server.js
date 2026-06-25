require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Database setup
const db = new sqlite3.Database('./appeals.db', (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    db.run(`CREATE TABLE IF NOT EXISTS appeals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        minecraft_username TEXT NOT NULL,
        appeal_type TEXT NOT NULL,
        punishment_reason TEXT NOT NULL,
        appeal_reason TEXT NOT NULL,
        additional_info TEXT,
        email TEXT,
        status TEXT DEFAULT 'pending',
        denial_reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Error creating appeals table:', err);
    });

    db.run(`CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'staff',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Error creating staff table:', err);
        else {
            // Add role column if it doesn't exist (for existing databases)
            db.run(`ALTER TABLE staff ADD COLUMN role TEXT DEFAULT 'staff'`, (err) => {
                if (err && !err.message.includes('duplicate column')) {
                    console.error('Error adding role column:', err);
                }
            });
            createDefaultStaff();
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        enabled INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Error creating announcements table:', err);
    });

    db.run(`CREATE TABLE IF NOT EXISTS faqs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        enabled INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Error creating faqs table:', err);
    });

    db.run(`CREATE TABLE IF NOT EXISTS gift_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        amount REAL NOT NULL,
        redeemed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        redeemed_at DATETIME
    )`, (err) => {
        if (err) console.error('Error creating gift_cards table:', err);
    });

    db.run(`CREATE TABLE IF NOT EXISTS server_status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        status TEXT NOT NULL DEFAULT 'online',
        message TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Error creating server_status table:', err);
        else initializeServerStatus();
    });
}

// Create default staff account
function createDefaultStaff() {
    const defaultPassword = bcrypt.hashSync('noahandreas12', 10);
    db.run(`INSERT OR IGNORE INTO staff (username, password, role) VALUES (?, ?, ?)`, 
        ['Noahh11223', defaultPassword, 'owner'], (err) => {
        if (err) console.error('Error creating default staff:', err);
        else console.log('Default staff account created (username: Noahh11223, password: noahandreas12, role: owner)');
    });
}

// Initialize server status
function initializeServerStatus() {
    db.run(`INSERT OR IGNORE INTO server_status (id, status, message) VALUES (1, 'online', 'Server is running normally')`, (err) => {
        if (err) console.error('Error initializing server status:', err);
        else console.log('Server status initialized');
    });
}

// Nodemailer transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// Verify email configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Email configuration error:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

// API endpoint for appeal submission
app.post('/api/submit-appeal', async (req, res) => {
    try {
        const { minecraftUsername, appealType, punishmentReason, appealReason, additionalInfo, email } = req.body;

        // Validate required fields
        if (!minecraftUsername || !appealType || !punishmentReason || !appealReason) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Store appeal in database
        db.run(`INSERT INTO appeals (minecraft_username, appeal_type, punishment_reason, appeal_reason, additional_info, email) VALUES (?, ?, ?, ?, ?, ?)`,
            [minecraftUsername, appealType, punishmentReason, appealReason, additionalInfo, email],
            function(err) {
                if (err) {
                    console.error('Error storing appeal:', err);
                    return res.status(500).json({ error: 'Failed to store appeal' });
                }

                // Send to Discord webhook
                if (process.env.DISCORD_WEBHOOK) {
                    sendToDiscord({ minecraftUsername, appealType, punishmentReason, appealReason, additionalInfo, email });
                }

                // Send confirmation email if email provided
                if (email) {
                    sendConfirmationEmail(email, minecraftUsername);
                }

                res.status(200).json({ success: true, message: 'Appeal submitted successfully' });
            }
        );
    } catch (error) {
        console.error('Error submitting appeal:', error);
        res.status(500).json({ error: 'Failed to submit appeal' });
    }
});

// Send to Discord webhook
async function sendToDiscord(data) {
    const embed = {
        title: `New ${data.appealType.charAt(0).toUpperCase() + data.appealType.slice(1)} Appeal`,
        color: 0x8b5cf6,
        fields: [
            {
                name: 'Minecraft Username',
                value: data.minecraftUsername,
                inline: true
            },
            {
                name: 'Appeal Type',
                value: data.appealType.charAt(0).toUpperCase() + data.appealType.slice(1),
                inline: true
            },
            {
                name: 'Punishment Reason',
                value: data.punishmentReason,
                inline: false
            },
            {
                name: 'Appeal Reason',
                value: data.appealReason,
                inline: false
            },
            {
                name: 'Additional Info',
                value: data.additionalInfo || 'None provided',
                inline: false
            },
            {
                name: 'Email',
                value: data.email || 'Not provided',
                inline: true
            },
            {
                name: 'Timestamp',
                value: new Date().toLocaleString(),
                inline: true
            }
        ],
        footer: {
            text: 'Moonveil SMP Appeal System'
        }
    };

    const response = await fetch(process.env.DISCORD_WEBHOOK, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ embeds: [embed] })
    });

    if (!response.ok) {
        throw new Error('Discord webhook failed');
    }
}

// Send confirmation email
async function sendConfirmationEmail(email, name) {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Confirmation of Appeal Submission',
        text: `Hello ${name},

Thank you for reaching out to us. We have successfully received your appeal request and will review it as soon as possible. Our team aims to process all appeals within 3 business days.

Best regards,

Moonveil SMP Team

This is an automated email. Please do not reply to this message.`
    };

    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${email}`);
}

// Send approval email
async function sendApprovalEmail(email, name) {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Appeal Approved',
        text: `Hello ${name},

Great news! Your appeal has been approved and you can now join the server again.

See you in-game!

Moonveil SMP Team

This is an automated email. Please do not reply to this message.`
    };

    await transporter.sendMail(mailOptions);
    console.log(`Approval email sent to ${email}`);
}

// Send denial email
async function sendDenialEmail(email, name, reason) {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Appeal Denied',
        text: `Hello ${name},

We regret to inform you that your appeal has been denied.

Reason: ${reason}

If you believe this is a mistake, please contact our staff team on Discord.

Moonveil SMP Team

This is an automated email. Please do not reply to this message.`
    };

    await transporter.sendMail(mailOptions);
    console.log(`Denial email sent to ${email}`);
}

// Staff authentication
app.post('/api/staff/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get('SELECT * FROM staff WHERE username = ?', [username], (err, staff) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!staff) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const isValid = bcrypt.compareSync(password, staff.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        res.json({ success: true, username: staff.username, role: staff.role });
    });
});

// Create new staff account (owner only)
app.post('/api/staff/create', (req, res) => {
    const { username, password, role } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Default role is 'staff' if not specified
    const userRole = role || 'staff';
    
    // Validate role
    if (!['owner', 'staff'].includes(userRole)) {
        return res.status(400).json({ error: 'Invalid role. Must be owner or staff' });
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    db.run('INSERT INTO staff (username, password, role) VALUES (?, ?, ?)', 
        [username, hashedPassword, userRole], 
        (err) => {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Username already exists' });
                }
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({ success: true, message: 'Staff account created' });
        }
    );
});

// Get all staff accounts (owner only)
app.get('/api/staff', (req, res) => {
    db.all('SELECT id, username, role, created_at FROM staff', [], (err, staff) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(staff);
    });
});

// Get all appeals
app.get('/api/appeals', (req, res) => {
    db.all('SELECT * FROM appeals ORDER BY created_at DESC', [], (err, appeals) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(appeals);
    });
});

// Approve appeal
app.post('/api/appeals/:id/approve', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM appeals WHERE id = ?', [id], (err, appeal) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!appeal) {
            return res.status(404).json({ error: 'Appeal not found' });
        }
        
        db.run('UPDATE appeals SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
            ['approved', id], 
            async (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                
                // Send approval email if email exists
                if (appeal.email) {
                    await sendApprovalEmail(appeal.email, appeal.minecraft_username);
                }
                
                res.json({ success: true });
            }
        );
    });
});

// Deny appeal
app.post('/api/appeals/:id/deny', (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
        return res.status(400).json({ error: 'Denial reason is required' });
    }
    
    db.get('SELECT * FROM appeals WHERE id = ?', [id], (err, appeal) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!appeal) {
            return res.status(404).json({ error: 'Appeal not found' });
        }
        
        db.run('UPDATE appeals SET status = ?, denial_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
            ['denied', reason, id], 
            async (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                
                // Send denial email if email exists
                if (appeal.email) {
                    await sendDenialEmail(appeal.email, appeal.minecraft_username, reason);
                }
                
                res.json({ success: true });
            }
        );
    });
});

// Delete appeal
app.delete('/api/appeals/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM appeals WHERE id = ?', [id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ success: true });
    });
});

// Announcement endpoints
app.get('/api/announcements', (req, res) => {
    db.all('SELECT * FROM announcements WHERE enabled = 1 ORDER BY created_at DESC', [], (err, announcements) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(announcements);
    });
});

app.get('/api/announcements/all', (req, res) => {
    db.all('SELECT * FROM announcements ORDER BY created_at DESC', [], (err, announcements) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(announcements);
    });
});

app.post('/api/announcements', (req, res) => {
    const { title, content } = req.body;
    
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }
    
    db.run('INSERT INTO announcements (title, content) VALUES (?, ?)', 
        [title, content], 
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({ success: true, message: 'Announcement created' });
        }
    );
});

app.put('/api/announcements/:id', (req, res) => {
    const { id } = req.params;
    const { title, content, enabled } = req.body;
    
    db.run('UPDATE announcements SET title = ?, content = ?, enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
        [title, content, enabled ? 1 : 0, id], 
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({ success: true, message: 'Announcement updated' });
        }
    );
});

app.delete('/api/announcements/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM announcements WHERE id = ?', [id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ success: true, message: 'Announcement deleted' });
    });
});

// FAQ endpoints
app.get('/api/faqs', (req, res) => {
    db.all('SELECT * FROM faqs WHERE enabled = 1 ORDER BY created_at DESC', [], (err, faqs) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(faqs);
    });
});

app.get('/api/faqs/all', (req, res) => {
    db.all('SELECT * FROM faqs ORDER BY created_at DESC', [], (err, faqs) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(faqs);
    });
});

app.post('/api/faqs', (req, res) => {
    const { question, answer } = req.body;
    
    if (!question || !answer) {
        return res.status(400).json({ error: 'Question and answer are required' });
    }
    
    db.run('INSERT INTO faqs (question, answer) VALUES (?, ?)', 
        [question, answer], 
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({ success: true, message: 'FAQ created' });
        }
    );
});

app.put('/api/faqs/:id', (req, res) => {
    const { id } = req.params;
    const { question, answer, enabled } = req.body;
    
    db.run('UPDATE faqs SET question = ?, answer = ?, enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
        [question, answer, enabled ? 1 : 0, id], 
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({ success: true, message: 'FAQ updated' });
        }
    );
});

app.delete('/api/faqs/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM faqs WHERE id = ?', [id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ success: true, message: 'FAQ deleted' });
    });
});

// Gift card endpoints
app.post('/api/gift-cards/generate', (req, res) => {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Valid amount is required' });
    }
    
    // Generate random code
    const code = 'GIFT-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    db.run('INSERT INTO gift_cards (code, amount) VALUES (?, ?)', 
        [code, amount], 
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({ success: true, code, amount });
        }
    );
});

app.post('/api/gift-cards/redeem', (req, res) => {
    const { code } = req.body;
    
    if (!code) {
        return res.status(400).json({ error: 'Gift card code is required' });
    }
    
    db.get('SELECT * FROM gift_cards WHERE code = ?', [code], (err, giftCard) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!giftCard) {
            return res.status(404).json({ error: 'Invalid gift card code' });
        }
        
        if (giftCard.redeemed) {
            return res.status(400).json({ error: 'Gift card already redeemed' });
        }
        
        // Mark as redeemed
        db.run('UPDATE gift_cards SET redeemed = 1, redeemed_at = CURRENT_TIMESTAMP WHERE id = ?', 
            [giftCard.id], 
            (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                
                res.json({ success: true, amount: giftCard.amount });
            }
        );
    });
});

app.get('/api/gift-cards', (req, res) => {
    db.all('SELECT * FROM gift_cards ORDER BY created_at DESC', [], (err, giftCards) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(giftCards);
    });
});

// Server status endpoints
app.get('/api/server-status', (req, res) => {
    db.get('SELECT * FROM server_status WHERE id = 1', [], (err, status) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!status) {
            return res.status(404).json({ error: 'Server status not found' });
        }
        res.json(status);
    });
});

app.put('/api/server-status', (req, res) => {
    const { status, message } = req.body;
    
    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }
    
    const validStatuses = ['online', 'no_issues', 'maintenance', 'offline', 'custom'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    
    db.run('UPDATE server_status SET status = ?, message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
        [status, message || '', 1], 
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({ success: true, message: 'Server status updated' });
        }
    );
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
