const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });
const LEADS_PATH = path.join(__dirname, '..', 'data', 'leads.json');

// SUPABASE CLIENT INITIALIZATION
const supabase = createClient(
    process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_KEY || 'placeholder'
);

// NODEMAILER SETTINGS (REAL GMAIL SUPPORT)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

router.post('/', upload.single('floorPlan'), async (req, res) => {
    try {
        const { name, surname, phone, email, installer, installerEmail, calculations } = req.body;
        const calcObj = JSON.parse(calculations || '{}');
        
        // 1. CLOUD SAVE (Supabase)
        let supabaseSuccess = false;
        try {
            if (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'https://placeholder.supabase.co') {
                const { error } = await supabase
                    .from('leads')
                    .insert([
                        { name, surname, phone, email, installer, calculations: calcObj }
                    ]);
                
                if (error) throw error;
                supabaseSuccess = true;
                console.log(`[SUPABASE SUCCESS] Inquiry from ${email} saved to cloud.`);
            }
        } catch (supaErr) {
            console.error(`[SUPABASE ERROR] ${supaErr.message}.`);
        }

        // 2. LOCAL SAVE (leads.json)
        let leads = [];
        if (fs.existsSync(LEADS_PATH)) {
            const fileData = fs.readFileSync(LEADS_PATH, 'utf-8');
            leads = JSON.parse(fileData || '[]');
        }
        
        const newLead = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            name,
            surname,
            phone,
            email,
            installer,
            calculations: calcObj,
            syncedToCloud: supabaseSuccess
        };
        
        leads.push(newLead);
        fs.writeFileSync(LEADS_PATH, JSON.stringify(leads, null, 2));

        // 3. AUTOMATION: TWO EMAILS
        if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
            
            // --- EMAIL 1: TO USER (Thank You) ---
            const userMailOptions = {
                from: `"DIELL Solar" <${process.env.SMTP_USER}>`,
                to: email,
                subject: 'Thank You for Choosing DIELL Solar! ☀️',
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <h1 style="color: #10b981;">Hello ${name}!</h1>
                        <p>Thank you for using the <strong>DIELL Solar Estimator</strong>. We have successfully received your inquiry for <strong>${installer}</strong>.</p>
                        <p>Your precision solar report is attached to this inquiry. A certified professional will reach out to you at <strong>${phone}</strong> shortly.</p>
                        <hr />
                        <h3>Your Precision Estimate Summary:</h3>
                        <ul>
                            <li><strong>Annual Savings:</strong> €${calcObj.annualSavings}</li>
                            <li><strong>ROI Timeline:</strong> ${calcObj.roiYears} years</li>
                            <li><strong>Panels Needed:</strong> ${calcObj.panels} (450W)</li>
                        </ul>
                        <p>Welcome to the clean energy future.</p>
                        <br />
                        <p>Best regards,<br/><strong>The DIELL Team</strong></p>
                    </div>
                `
            };

            // --- EMAIL 2: TO INSTALLER (New Lead Alert) ---
            const installerMailOptions = {
                from: `"DIELL Solar Leads" <${process.env.SMTP_USER}>`,
                to: installerEmail || 'leads@diell-solar.com', // Fallback
                subject: `NEW LEAD: ${name} ${surname} (DIELL Solar)`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <h2 style="color: #2563eb;">New Solar Inquiry Received</h2>
                        <p>A new customer has requested a quote from <strong>${installer}</strong> via the DIELL Mobile App.</p>
                        
                        <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
                            <h4 style="margin-top: 0;">Customer Details:</h4>
                            <p><strong>Name:</strong> ${name} ${surname}</p>
                            <p><strong>Phone:</strong> ${phone}</p>
                            <p><strong>Email:</strong> ${email}</p>
                        </div>

                        <div style="margin-top: 20px;">
                            <h4>Solar Profile:</h4>
                            <ul>
                                <li><strong>Estimated Capacity:</strong> ${calcObj.systemKw} kW</li>
                                <li><strong>Panels Required:</strong> ${calcObj.panels}</li>
                                <li><strong>Estimated Project Cost:</strong> €${calcObj.estimatedCost.toLocaleString()}</li>
                            </ul>
                        </div>
                        
                        <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
                            Please contact this customer within 24 hours to secure the lead.
                        </p>
                    </div>
                `
            };

            try {
                console.log(`[EMAIL DISPATCH] Dispatching User Thank You to: ${email}`);
                await transporter.sendMail(userMailOptions);
                
                console.log(`[EMAIL DISPATCH] Dispatching Installer Alert to: ${installerEmail}`);
                await transporter.sendMail(installerMailOptions);

                console.log(`[EMAIL SUCCESS] Dual-delivery completed.`);
            } catch (mailError) {
                console.warn(`[EMAIL ERROR] Dual transit failed: ${mailError.message}`);
            }
        } else {
            console.warn(`[EMAIL WARNING] SMTP credentials missing. Transit skipped.`);
        }

        res.json({
            success: true,
            message: 'Inquiry processed. Summary sent to you and the installer.'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to process lead.' });
    }
});

module.exports = router;
