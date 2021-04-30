// ================== Type Imports ==================
import { Request, Response } from 'express';

// ================== Package Imports ==================
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

// ================== Server setup ==================
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
const http = require('http').createServer(app);

// ================== Twilio Auth ==================
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const number = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// ================== Endpoints ==================
// EP1: Test
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Alive' });
});

// EP2: Send SMS
app.post('/sendSMS', async (req: Request, res: Response) => {
  const { messsage, recipient } = req.body;
  const messageObj = await client.messages.create({
    body: messsage,
    from: number,
    to: recipient,
    statusCallback: 'https://3a6a27175479.ngrok.io/smsHook'
  })
  res.status(200).json({ messageSid: messageObj.sid })
})

// EP3: Send SMS Hook Info
app.post('/smsHook', async (req: Request, res: Response) => {
  const messageSid = req.body.MessageSid;
  const messageStatus = req.body.MessageStatus;
  console.log(`${messageSid}: ${messageStatus}`)
  res.sendStatus(200)
})

// EP4: Receive SMS
app.post('/receiveSMS', async (req: Request, res: Response) => {
  const twiml = new MessagingResponse();
  twiml.message('TwilioQuest rules');
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
})

// EP5: Send MMS
app.post('/sendMMS', async (req: Request, res: Response) => {
  const { messsage, mediaLink, recipient } = req.body;
  const messageObj = await client.messages.create({
    body: messsage,
    media: mediaLink,
    // number must be US or Canada
    from: number,
    to: recipient,
    statusCallback: 'https://3a6a27175479.ngrok.io/smsHook'
  })
  res.status(200).json({ messageSid: messageObj.sid })
})

module.exports = app;
