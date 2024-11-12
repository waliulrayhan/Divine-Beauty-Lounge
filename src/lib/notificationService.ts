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
    subject: 'Stock Alert: Low Stock Level',
    text: `The stock for ${productName} has reached a low level of ${currentStock}. Please restock as soon as possible.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Stock notification sent successfully.');
  } catch (error) {
    console.error('Error sending stock notification:', error);
  }
};
