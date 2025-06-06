export function buildActivationEmail(
  email: string,
  activationCode: string,
): string {
  return `
        <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.6; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #2e86de; text-align: center;">Welcome to <span style="color: #1e3799;">RGT</span></h2>
            <p>Hello <strong>${email || 'User'}</strong>,</p>
            <p>Thank you for registering with us.</p>
            <p><strong>Your activation code is:</strong></p>
            <div style="text-align: center; margin: 20px 0;">
              <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #ffffff; background-color: #1e3799; padding: 10px 20px; border-radius: 6px;">
                ${activationCode}
              </span>
            </div>
            <p>It will expiry in 1 hour!</p>
            <br/>
            <p>If you did not request this code, please ignore this email.</p>
            <p style="margin-top: 30px;">Best regards,<br><strong>RGT Team</strong></p>
          </div>
        </div>
      `;
}

export const subject =
  'Please, confirm your email to complete the authentication';
