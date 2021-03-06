var app = require('../app');
var debug = require('debug')('bot-framework-and-express-1:server');
var http = require('http');

const fs = require('fs');
//var nodemailer = require('nodemailer');
//var smtpTransport = require('nodemailer-smtp-transport');

//botbulder
var restify = require('restify');
var builder = require('botbuilder');
//sendgrid for sending mail
var Sendgrid = require("sendgrid-web");
//used for getting from azure SQL DB
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

var MICROSOFT_APP_ID="3935f689-309f-4bea-a782-dd4fdce254b4";
var MICROSOFT_APP_PASSWORD="uayxjhSY13[:!tVCRPP472|";

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 4990, function () {
 console.log('%s listening to %s', server.name, server.url);
});
// Create chat bot
var connector = new builder.ChatConnector({
  //uses CnG_18_0504 app
 appId: MICROSOFT_APP_ID,
 appPassword: MICROSOFT_APP_PASSWORD
});
var config = 
   {
     userName: 'Muthuprasanth', // update me
     password: 'Sirius@25', // update me
     server: 'sendgridazure.database.windows.net', // update me
     options: 
        {
           database: 'Sendgrid_DB', //update me
           encrypt: true
        }
   }
//var connection = new Connection(config);
function getRandomInt() {
  console.log("I am in random");
  for(let i=0;i<5;i++)
  {
    question_num[i]= Math.floor(Math.random() * Math.floor(10));
  }
  console.log("randommm",question_num);
  }

var java = [ 'What is difference between JDK,JRE and JVM?', 
'What is JIT compiler?', 
'What is the main difference between Java platform and other platforms?',
 'What is classloader?',
 'What if I write static public void instead of public static void?',
 'What is the default value of the local variables?',
 'What is constructor?',
 'Can you make a constructor final?',
 'What is static variable?',
 'What is static block?'];
var question;
var qna=[];
var question_num=[];
var k=0;
var answer="";
//getRandomInt();

console.log("dfsfdsf------- csfsdf");
server.post('/api/messages', connector.listen());
var bot = new builder.UniversalBot(connector, [
    function (session) {
      getRandomInt();
        session.send("Your Interview starts now");
        session.send("Hi " + session.message.user.name);
        session.send(session.message.user.id);
        session.send(session.message.address.user.name);
        builder.Prompts.text(session, java[0]);
    },
    function (session, results) {
       qna[java[question_num[k]]]=results.response;
       k++;
        qna[java[0]]=results.response;
        // k++;
        builder.Prompts.text(session, java[1]);
    },
    function (session, results) {
       qna[java[1]]=results.response;
     // k++;
        builder.Prompts.text(session, java[2]);
    },

    function (session, results) {
        qna[java[2]]=results.response;
        session.send("thank you");
        session.beginDialog("/print");
      //  k=0;
    }
]);

bot.dialog('/print', function (session) {
//session.send("printed");
  var sendgridCredentials = [];
  var next=0;
  for (var key in qna) {
    answer += "Question : "+key+"\n\tanswer : "+qna[key]+"\n";
    // console.log(qna[key]);
    }
  console.log("send mail");
  let promiseTOGetSendgridCredential =  new Promise(function(resolve,reject){
    var connection = new Connection(config);
    connection.on('connect', function(err) {
       if (err) 
       {
          console.log(err)
       }
      else
       {
        console.log("inside else odf sql");
        let  tediousRequest = new Request(
          "SELECT  Username,Password FROM dbo.Sendgrid_Account",
          function(err, rowCount, rows) 
            {
                resolve();
            }
          );
          tediousRequest.on('row', function(columns) {
             columns.forEach(function(column) {
             sendgridCredentials[next]=column.value;
             next++;
           });
          });
          console.log("first",sendgridCredentials);
          connection.execSql(tediousRequest);
       }
    });
  });

  promiseTOGetSendgridCredential.then(function(){
    console.log("second",sendgridCredentials);
    var sendgrid = new Sendgrid({
      user: sendgridCredentials[0],//provide the login credentials
      key:sendgridCredentials[1]
    });
    sendgrid.send({
      to: 'mprasanth113@gmail.com',
      from: 'mprasanth113@gmail.com',
      subject: 'Interview Report',
      html: answer
    }, function (err) {
      if (err) {
        console.log("Mail error",err);
      } else {
        console.log("Success Mail sended From Azure ");
        session.send("Your Interview Report is send to our HR");
      }
    });
  });

});


/*function sendEmail(){
  console.log("send mail");
      var transporter = nodemailer.createTransport(smtpTransport({
      service: 'gmail',
      auth: {
      user: 'example1@gmail.com',
      pass: 'example1'
      }
      }));

      var mailOptions = {
      from: 'example1@gmail.com',
      to: 'example1@yahoo.com',
      subject: 'Congratulations! You are selected for the first level of interview with us',
      text: 'Please Find the attached document for the candidate assessment'+answer,
       /* attachments: [{
        filename: 'message1.docx',
        content:answer
        }]
      };

      transporter.sendMail(mailOptions, function(error, info){
      if (error) {
      console.log(error);
      } else {
      console.log('Email sent: ' + info.response);
      }
      }); 
      }*/


//.set('storage', inMemoryStorage); 

// =========================================================
// Bots Dialogs 
// =========================================================
// This is called the root dialog. It is the first point of entry for any message the bot receives
/*
var bot = new builder.UniversalBot(connector);
bot.dialog('/', function (session) {
// Send 'hello world' to the user
//session.send(session.message.user);
//session.send(MICROSOFT_APP_ID);

session.send("Your Interview strats now");
session.beginDialog("/questions");
});

bot.dialog("/questions", [
    //question = java[getRandomInt()];
    function (session) {
      console.log("I am first");
        builder.Prompts.text(session,java[question_num[k]]);
    },
    // Step 2
    function (session, results) {
       console.log("I am second");
      qna[java[question_num[k]]]=results.response;
      k++;
      builder.Prompts.text(session,java[question_num[k]]);
    },
     function (session, results) {
       console.log("I am third");
        qna[java[question_num[k]]]=results.response;
      k++;
      builder.Prompts.text(session,java[question_num[k]]);
    },
     function (session, results) {
       console.log("I am fourth");
       qna[java[question_num[k]]]=results.response;
      k++;
      builder.Prompts.text(session,java[question_num[k]]);
    },

    function (session, results) {
       console.log("I am fifth");
     qna[java[question_num[k]]]=results.response;
      console.log("final array",qna);
      session.endDialog("thank you");
    }
   
]);
*/

