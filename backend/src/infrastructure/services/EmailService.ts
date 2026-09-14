import nodemailer from "nodemailer";
import { IEmailService } from "../../application/contracts/IEmailService.js";


export class EmailService implements IEmailService{
    private transporter;
    constructor(){
        this.transporter = nodemailer.createTransport({
            service:"gmail",
            auth:{
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        })
    }   

    async sendOtp(email: string, otp: string): Promise<void> {
     await this.transporter.sendMail({
        from : process.env.EMAIL_USER,
        to:email,
        subject:"RoadAssist Email Verification",
       html: `
                <h2>RoadAssist Email Verification</h2>

                <p>Your OTP for email verification is:</p>

                <h1>${otp}</h1>

                <p>This OTP will expire in 5 minutes.</p>

                <p>If you did not request this, please ignore this email.</p>
            `,
     })
    }
}

