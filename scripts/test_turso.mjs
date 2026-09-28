import { createClient } from '@libsql/client';

const url = 'libsql://siarsip-db-ekobot2025-cyber.aws-ap-northeast-1.turso.io';
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA2MDk3OTUsImlkIjoiMDFhMGU4YTgtYTcwMS03OTJkLWIzNzMtZjNlMmQxNWNlZTk2Iiwia2lkIjoiQmRLS1p5M3BaWXVNX0sxaDZLX1RFaGprNEd0ZjBpTlZMcTJNMlc2V1VNSSIsInJpZCI6ImZlMDIwMDQ0LWYwMDYtNGFjYy05ODZhLTA2ZGFmZjkwYjcxZSJ9.tayCRPY2yjSJfqV3Wfww67ZczCaXlDT8rAF5-nphbHER0ipzvmMI8YZ7J1jx7WPTx6jyE5x5dbotJKwuUiHWDg';

async function testConnection() {
  console.log('Connecting to Turso Cloud at', url);
  const client = createClient({ url, authToken });
  const result = await client.execute('SELECT 1 + 1 as result');
  console.log('Connection successful! Query test result:', result.rows);
}

testConnection().catch(console.error);
