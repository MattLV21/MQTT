let client;
// let savedMessages = ['drink en øl', 'hop på et ben', 'lave en armbøning'];
let savedMessages;
let challenges = [];
let players = [[]];
// brug local til at save og load json 

// 4 steps, array skrivet varubal, document json file, local storage (cookie), firebase (database)

// preload json file as a object
function preload() {
  savedMessages = loadJSON("challenges.json");
}

function setup(){
  mqttInit();
  // revise message when new challenge is added
  client.subscribe('Konge_spil');
  // resive message when challenger is asking to be given a challenge
  client.subscribe('giveChallenge');
  // when player logsin
  client.subscribe("Login");
  // when player needs incoded list of players
  client.subscribe("Get_Players");
  // when player challenges other player
  client.subscribe("challenge_player");

  //når vi modtager beskeder fra MQTT serveren kaldes denne funktion
  client.on('message', (topic, message) => {
    // console.log('Received Message: ' + message.toString() + '\nOn topic: ' + topic);
    if(topic == "Konge_spil") {
      // call function
      saveMessage(message);
    } 
    if(topic == "giveChallenge") {
      giveChallenge(message);
    }
    if(topic == "Login") {
      // convert message to string and split
      mes = split(message.toString(), "-:-");
      // add new player to player array list
      players[players.length] = mes;
    }
    if(topic == "Get_Players") {
      // Get all players id and username
      mes = Player_message();
      // return list of players back to id
      client.publish(message.toString(), mes);
    }
    if(topic == "challenge_player") {
      message = message.toString();
      // Decode message
      mes = split(message, "-:-");
      // repost challenge to player
      repost_challenge(mes);
    }
  });
}
// send challenge to the resiving player
function repost_challenge(message) {
  let sender = "";
  // loop though all players
  for(let i = 0; i < players.length; i++) {
    // if player id is the same as sender id
    if(players[i][0] == message[0]) {
      // find sender username
      sender = players[i][1];
    }
  }
  let resiver = message[1];
  let chal = message[2];
  // incode message
  let mes = "Chal-:-" + sender + "-:-" + chal;
  // publish message on the resivers id as topic 
  client.publish(resiver, mes);
}

// resive challenge form challenger and add it to array savedMessages
function saveMessage(challenge) {
  savedMessages.challenges[savedMessages.challenges.length] = {challenge: challenge.toString()};
  console.log("getting new challenge: ", challenge.toString());
}

// get challenger id, and pick a message/challenge from savedMessages
function giveChallenge(challenge) {
  let message = Math.floor(Math.random() * savedMessages.challenges.length);
  client.publish(challenge.toString(), savedMessages.challenges[message].challenge);

  console.log("giving challenge: ", savedMessages.challenges[message], " to id:", challenge.toString());
}
// create incoded string of players 
function Player_message() {
  let value;
  for(let i = 0; i < players.length; i ++) {
    for(let j = 0; j < players[i].length; j ++) {
      value = value + "-:-" + players[i][j];
    }
  }
  // retrun incoded string of players
  return value;
}















































const mqttInit = () => {
  //opret et id med en random talkode og sæt gem servernavnet i en variabel
  const clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8)
  const host = 'wss://mqtt.nextservices.dk'

  //opret et objekt med de oplysninger der skal bruges til at forbinde til serveren
  const options = {
    keepalive: 300,
    clientId: clientId,
    protocolId: 'MQTT',
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    will: {
      topic: 'WillMsg',
      payload: 'Connection Closed abnormally..!',
      qos: 0,
      retain: false
    },
    rejectUnauthorized: false
  }

  console.log('connecting mqtt client')

  //forsøg at oprette forbindelse 
  client = mqtt.connect(host, options)

  //hvis der sker en fejl kaldes denne funktion
  client.on('error', (err) => {
    console.log('Connection error: ', err)
    client.end()
  })

  //og hvis forbindelsen mistes kaldes denne funktion
  client.on('reconnect', () => {
    console.log('Reconnecting...')
  })

  //hvis forbindelsen lykkes kaldes denne funktion
  client.on('connect', () => {
    console.log('Client connected:' + clientId)
  })

  //når forbindelsen lukkes kaldes denne funktion
  client.on('close', () => {
    console.log(clientId + ' disconnected')
  })
} 

function showChart(){
  //opret chart 
  chart = new Chart(select('#chartCanvas').elt, {
      type: 'bar',
      data: {
        labels: ['hej', 'med', 'dig'],
        datasets: [{
            label: 'Resultat',
            data: [33,10,23],
              backgroundColor: ['lightred', 'lightgreen', 'lightblue'],
              borderWidth: 3
          }]
      },
  });
}
