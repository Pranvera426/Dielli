const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Resend } = require('resend');
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

// RESEND CLIENT INITIALIZATION
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

// Custom middleware to handle both JSON and Multipart
router.post('/', (req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
        return upload.single('floorPlan')(req, res, next);
    }
    next();
}, async (req, res) => {
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

        // 3. AUTOMATION: TWO EMAILS via RESEND
        if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_placeholder') {
            
            // --- EMAIL 1: TO USER (Thank You) ---
            const userEmailData = {
                from: 'Dielli <onboarding@resend.dev>',
                to: [email],
                subject: 'Thank You for Your Request – Dielli Solar',
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <p>Dear ${name},</p>
                        <p>Thank you for your interest in Dielli.</p>
                        <p>We have successfully received your request.</p>
                        <p>Your information will be sent to <strong>${installer}</strong>, and they will contact you soon with a personalized quote.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 14px; color: #64748b;">
                            <strong>Summary of your request:</strong><br/>
                            • Annual Savings: €${calcObj.annualSavings}<br/>
                            • ROI Timeline: ${calcObj.roiYears} years<br/>
                            • Panels Needed: ${calcObj.panels}
                        </p>
                        <p>Best regards,<br/><strong>Dielli Team</strong></p>
                    </div>
                `
            };

            // --- EMAIL 2: TO INSTALLER (New Lead Alert) ---
            const installerEmailData = {
                from: 'Dielli Leads <onboarding@resend.dev>',
                to: [installerEmail || 'leads@diell-solar.com'],
                subject: `NEW LEAD: ${name} ${surname} (DIELL Solar)`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <h2 style="color: #10b981;">New Solar Inquiry Received</h2>
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
                                <li><strong>Estimated Project Cost:</strong> €${(calcObj.estimatedCost || 0).toLocaleString()}</li>
                            </ul>
                        </div>
                        
                        <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
                            Please contact this customer within 24 hours to secure the lead.
                        </p>
                    </div>
                `
            };

            try {
                console.log(`[RESEND DISPATCH] Dispatching User Thank You to: ${email}`);
                await resend.emails.send(userEmailData);
                
                console.log(`[RESEND DISPATCH] Dispatching Installer Alert to: ${installerEmail}`);
                await resend.emails.send(installerEmailData);

                console.log(`[RESEND SUCCESS] Dual-delivery completed.`);
            } catch (resendError) {
                console.warn(`[RESEND ERROR] delivery failed: ${resendError.message}`);
            }
        } else {
            console.warn(`[RESEND WARNING] API Key missing. Transit skipped.`);
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
