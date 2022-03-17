let client;
let clientId;

function setup(){
  clientId = getItem('clientId');
  mqttInit();

  client.subscribe(clientId);
  //når vi modtager beskeder fra MQTT serveren kaldes denne funktion
  client.on('message', (topic, message) => {
    console.log('Received Message: ' + message.toString() + '\nOn topic: ' + topic);
    if(topic == clientId){
      resiveChallenge(message);
    }
  });
  select("#info_box").html("Du har completed " + getItem("completed") + " challenges");
}
function resiveChallenge(challenge) {
  select("#Challenge_Text").html(challenge.toString());
}
function toGet() {
  select('#home').addClass('hidden');
  select("#add").addClass("hidden");
  select('#receive').removeClass('hidden');
  client.publish("giveChallenge", clientId);
}

function toMake() {
  select("#home").addClass("hidden");
  select("#receive").addClass("hidden");
  select("#add").removeClass("hidden");
}
function make() {
  let value = select("#link").value();
  select("#link").value("");
  client.publish("Konge_spil", value);
}
function completed() {
  select('#home').removeClass('hidden');
  select('#receive').addClass('hidden');

  let completed = getItem("completed");
  if(!completed) {
    storeItem('completed', 1);
  }
  else {
    completed++;
    storeItem("completed", completed);
  }
  select("#info_box").html("Du har completed " + getItem("completed") + " challenges");
}
function toHome() {
  select('#home').removeClass('hidden');
  select('#receive').addClass('hidden');
}

















































const mqttInit = () => {
  //opret et id med en random talkode og sæt gem servernavnet i en variabel
  if(!clientId){
    clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8)
    storeItem('clientId', clientId)
  }

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
    console.log('Client connected: ' + clientId)
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
