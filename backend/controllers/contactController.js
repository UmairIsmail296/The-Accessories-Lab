const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// @desc    Submit contact form
exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const contact = await Contact.create({
      name, email, phone, subject, message,
    });

    // Send email notification to admin
    try {
      await transporter.sendMail({
        from: `"THE ACCESSORIES LAB" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER,
        subject: `New Contact: ${subject} - ${name}`,
        html: `
          <div style="font-family: Arial; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #fff; padding: 30px; border-radius: 15px;">
            <h2 style="color: #e94560;">New Contact Message</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p style="background: #12122a; padding: 15px; border-radius: 10px;">${message}</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.log('Email notification failed:', emailError.message);
    }

    // Send auto-reply to user
    try {
      await transporter.sendMail({
        from: `"THE ACCESSORIES LAB" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'We received your message - THE ACCESSORIES LAB',
        html: `
          <div style="font-family: Arial; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #fff; padding: 30px; border-radius: 15px;">
            <h2 style="color: #e94560;">Thank You, ${name}!</h2>
            <p style="color: #ccc;">We have received your message and will get back to you within 24-48 hours.</p>
            <p style="color: #888;">Your message: "${message.substring(0, 100)}..."</p>
            <hr style="border-color: #333;">
            <p style="color: #888; font-size: 12px;">THE ACCESSORIES LAB | WhatsApp: 0342-7600786</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.log('Auto-reply failed:', emailError.message);
    }

    const io = req.app.get('io');
    io.to('admin_room').emit('new_contact', contact);

    res.status(201).json({ message: 'Message sent successfully! We will get back to you soon.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all contacts (Admin)
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update contact status (Admin)
exports.updateContactStatus = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Not found' });
    contact.status = req.body.status;
    await contact.save();
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};