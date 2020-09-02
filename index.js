'use strict';


// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'PlainText',
            text: output,
        },
        card: {
            type: 'Simple',
            title: `Cyber Discovery - ${title}`,
            content: `Cyber Discovery - ${output}`,
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}


// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const sessionAttributes = {};
    const cardTitle = 'Welcome';
    const speechOutput = 'Welcome to the Cyber Discovery Buddy. ' +
        'You can ask me when a stage starts or ends. You can also ask for a random tip.';
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    const repromptText = 'Please choose an option.';
    const shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    const cardTitle = 'Session Ended';
    const speechOutput = 'Thank you for trying the Cyber Discovery Buddy. Have a nice day!';
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

// --------------- Events -----------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);

    // Run skill's launch menu.
    getWelcomeResponse(callback);
}

function showCard(sessionAttributes, title, content, reprompt, exit, callback) {
    callback(sessionAttributes, buildSpeechletResponse(title, content, reprompt, exit));
}

/**
 * Called when the user specifies an intent for this skill.
 */

function giveTip(callback) {
    var tips = ["Don't be afraid to read over the source again!", "Using an unconvential approach is ok!", "Did you check server configuration files that might exist?", "Check file extensions!", "The developer console often helps.", "Have you looked at cookies?", "Maybe trying random inputs until it works is the way to go."];
    var tip = tips[Math.floor(Math.random()*tips.length)];
    callback({}, buildSpeechletResponse("Tip", `Your tip is: "${tip}"! Good luck with the challenge!`, "", true));
}

exports.onIntent = function(intentRequest, session, callback) {
    console.log(`exports.onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);

    const intentName = intentRequest.intent.name;

    switch (intentName) {
        case 'assess_start_date':
            showCard({}, "Assess Start Date", "Cyberstart Assess Started on the 2nd of June.", "", true, callback);
            break;
        case 'Assess End Date':
            showCard({}, "Assess End Date", "Cyberstart Assess Ends on the 31st of October.", "", true, callback);
            break;
        case 'game_start_date':
            showCard({}, "Game Start Date", "Cyberstart Game Started on the 2nd of June.", "", true, callback);
            break;
        case 'essentials_start_date':
            showCard({}, "Essentials Start Date", "Cyberstart Essentials Starts on the 15th of September.", "", true, callback);
            break;
        case 'essentials_end_date':
            showCard({}, "Essentials End Date", "Cyberstart Essentials Ends on the 31st of March.", "", true, callback);
            break;
        case 'AMAZON.HelpIntent':
            getWelcomeResponse(callback);
            break;
        case 'AMAZON.StopIntent':
        case 'AMAZON.CancelIntent':
            handleSessionEndRequest(callback);
            break;
        case 'elite_dates':
            showCard({}, "Cyberstart Elite Dates", "Cyberstart Elite Dates for Year 3 of the program are on the Mondays, Wednesdays and Fridays from 27th July to 7th August 2020 for younger elite qualifiers.For the older elite participants, elite runs on every weekday from 27th July to &th August 2020. On the 8th August 2020, there is a Elite CTF running from 9am to 5pm, for both age groups.", "", true, callback);
            break;
        case 'get_tip':
            giveTip(callback);
            break;
        case 'no_deobfuscation':
            showCard({}, "Deobfuscation", "Deobfuscation shouldn't be attempted unless the challenge states you should.", "", true, callback);
            break;
        default :
            throw new Error('Invalid intent');
    }
}
/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
    // Add cleanup logic here
}


// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    try {
        console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== 'amzn1.echo-sdk-ams.app.[unique-value-here]') {
             callback('Invalid Application ID');
        }
        */

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            exports.onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        callback(err);
    }
};
