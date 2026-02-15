import * as React from 'react';

export interface ActivationEmailTemplateProps {
  userName: string;
  activationToken: string;
}

export function ActivationEmailTemplate({
  userName,
  activationToken,
}: ActivationEmailTemplateProps) {
  const baseUrl = 'http://localhost:3000';
  const activationLink = `${baseUrl}/activate?token=${activationToken}`;

  return (
    <div
      style={{
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        backgroundColor: '#f9f9f9',
        padding: '40px 20px',
        color: '#333',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            backgroundColor: '#000000',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: 'bold',
              margin: 0,
            }}
          >
            Mugathman ERP
          </h1>
        </div>
        
        <div style={{ padding: '40px 30px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: 0, marginBottom: '20px' }}>
            Hello {userName},
          </h2>
          
          <p style={{ fontSize: '16px', lineHeight: '24px', marginBottom: '20px' }}>
            Thank you for registering with Mugathman ERP. To verify your identity and activate your account, please click the button below.
          </p>
          
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <a
              href={activationLink}
              style={{
                backgroundColor: '#000000',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '16px',
                display: 'inline-block',
              }}
            >
              Activate Account
            </a>
          </div>
          
          <p style={{ fontSize: '14px', color: '#666', lineHeight: '22px' }}>
            If the button above doesn&apos;t work, copy and paste the following link into your browser:
            <br />
            <a href={activationLink} style={{ color: '#0066cc', textDecoration: 'none', wordBreak: 'break-all' }}>
              {activationLink}
            </a>
          </p>
          
          <p style={{ fontSize: '14px', color: '#666', marginTop: '30px' }}>
            This link will expire in 24 hours. If you didn&apos;t create an account with us, please ignore this email.
          </p>
        </div>
        
        <div
          style={{
            backgroundColor: '#f5f5f5',
            padding: '20px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#888',
          }}
        >
          {/* <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} Mugathman ERP. All rights reserved.
          </p> */}
        </div>
      </div>
    </div>
  );
};
