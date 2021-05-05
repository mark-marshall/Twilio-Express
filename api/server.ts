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
  const { messsage, recipient, aphaId } = req.body;
  const messageObj = await client.messages.create({
    body: messsage,
    // Send from standard number if not alphaId not provided
    from: aphaId || number,
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

// EP6: Initiate Conversation
app.post('/startConversation', async (req: Request, res: Response) => {
  const { conversationName } = req.body;
  const conversation = await client.conversations.conversations.create({
    friendlyName: conversationName
  })
  res.status(200).json({ conversationSid: conversation.sid })
})

// EP7: Add SMS Participant to Conversation
app.post('/addSMSParticipant', async (req: Request, res: Response) => {
  const { conversationSid, participantANumber } = req.body;
  const participantA = await client.conversations.conversations(conversationSid).participants.create({
    'messagingBinding.address': participantANumber,
    'messagingBinding.proxyAddress': number
  })
  res.status(200).json({ participantSid: participantA.sid })
})

// EP8: Add Chat Participant to Conversation
app.post('/addChatParticipant', async (req: Request, res: Response) => {
  const { conversationSid, participantBIdentity } = req.body;
  const participantB = await client.conversations.conversations(conversationSid).participants.create({
    'identity': participantBIdentity,
  })
  res.status(200).json({ participantSid: participantB.sid })
})


module.exports = app;
