"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// ================== Package Imports ==================
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const VoiceResponse = require('twilio').twiml.VoiceResponse;
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
// ================== Messaging Endpoints ==================
// EP1: Test
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Alive' });
});
// EP2: Send SMS
app.post('/sendSMS', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { messsage, recipient, aphaId } = req.body;
    const messageObj = yield client.messages.create({
        body: messsage,
        // Send from standard number if not alphaId not provided
        from: aphaId || number,
        to: recipient,
        statusCallback: 'https://3a6a27175479.ngrok.io/smsHook',
    });
    res.status(200).json({ messageSid: messageObj.sid });
}));
// EP3: Send SMS Hook Info
app.post('/smsHook', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const messageSid = req.body.MessageSid;
    const messageStatus = req.body.MessageStatus;
    console.log(`${messageSid}: ${messageStatus}`);
    res.sendStatus(200);
}));
// EP4: Receive SMS
app.post('/receiveSMS', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const twiml = new MessagingResponse();
    twiml.message('TwilioQuest rules');
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
}));
// EP5: Send MMS
app.post('/sendMMS', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { messsage, mediaLink, recipient } = req.body;
    const messageObj = yield client.messages.create({
        body: messsage,
        media: mediaLink,
        // number must be US or Canada
        from: number,
        to: recipient,
        statusCallback: 'https://3a6a27175479.ngrok.io/smsHook',
    });
    res.status(200).json({ messageSid: messageObj.sid });
}));
// EP6: Initiate Conversation
app.post('/startConversation', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationName } = req.body;
    const conversation = yield client.conversations.conversations.create({
        friendlyName: conversationName,
    });
    res.status(200).json({ conversationSid: conversation.sid });
}));
// EP7: Add SMS Participant to Conversation
app.post('/addSMSParticipant', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationSid, participantANumber } = req.body;
    const participantA = yield client.conversations
        .conversations(conversationSid)
        .participants.create({
        'messagingBinding.address': participantANumber,
        // 'messagingBinding.proxyAddress': number
    });
    res.status(200).json({ participantSid: participantA.sid });
}));
// EP8: Add Chat Participant to Conversation
app.post('/addChatParticipant', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationSid, participantBIdentity } = req.body;
    const participantB = yield client.conversations
        .conversations(conversationSid)
        .participants.create({
        identity: participantBIdentity,
    });
    res.status(200).json({ participantSid: participantB.sid });
}));
// ================== Voice Endpoints ==================
// EP1: Say something and gather digits
app.post('/say', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Digits, From } = req.body;
    let twiml = '';
    if (!Digits) {
        twiml = `
      <Response>
        <Gather>
          <Say>
            Press any series of numbers on your keypad followed by the hash key.
          </Say>
        </Gather>
      </Response>
    `;
    }
    else {
        twiml = `
      <Response>
        <Say>${From} entered: ${Digits}</Say>
        <Say>Goodbye</Say>
      </Response>
    `;
    }
    res.type('text/xml');
    res.send(twiml);
}));
// EP2: Forward a call
app.post('/forward', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const forwardingNum = '+19473334160';
    const twiml = `
    <Response>
        <Dial>${forwardingNum}</Dial>
        <Say>Goodbye</Say>
    </Response>
    `;
    res.type('text/xml');
    res.send(twiml);
}));
// EP3: Make call and then an announement
app.post('/callStart', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('hi');
    const { recipient } = req.body;
    yield client.calls.create({
        to: recipient,
        from: number,
        url: 'https://17c40bea9a81.ngrok.io/callDuring',
        statusCallback: 'https://17c40bea9a81.ngrok.io/callAfter',
        statusCallbackMethod: 'POST',
        record: true,
    });
    res.status(200);
}));
// EP3B
app.post('/callDuring', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { CallSid } = req.body;
    client
        .calls(CallSid)
        .update({
        twiml: `<Response>
    <Gather input="speech dtmf" timeout="3" numDigits="1">
        <Say>Please press 1 or say sales for sales.</Say>
    </Gather>
</Response>`,
    })
        .then((call) => console.log(call.to));
}));
// EP3C
app.post('/callAfter', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { RecordingUrl } = req.body;
    console.log(RecordingUrl);
    res.status(200).json({ recording: RecordingUrl });
}));
// EP4: Route and screen a call
app.post('/callRouteScreen', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Digits } = req.body;
    const extensions = {
        2: 'Brodo',
        3: 'Dagobah',
        4: 'Oober',
    };
}));
module.exports = app;
