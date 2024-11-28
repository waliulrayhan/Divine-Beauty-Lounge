import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your email password
  },
});

export const sendStockNotification = async (productName: string, currentStock: number) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.SUPER_ADMIN_EMAIL, // super admin email
    subject: 'Stock Alert: Urgent Attention Needed for Stock Replenishment',
    text: `Dear Admin,

We wanted to let you know that the stock for ${productName} has dropped to ${currentStock} units and is about to run out. Please arrange to restock it at your earliest convenience to prevent any service disruption.

Thank you for your attention and swift action.

Warm regards,
Md. Waliul Islam Rayhan
Developer, Divine Beauty Lounge

**Note: This is an automatically generated email. Please do not reply directly to this message.**`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Stock notification sent successfully.');
  } catch (error) {
    console.error('Error sending stock notification:', error);
  }
};
