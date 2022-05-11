let client;
let clientId;
let bool = false;
let player_challenged = [];
let logedin = false;

function setup(){
  // get client id from local storage (cookies)
  clientId = getItem('clientId');
  mqttInit();

  // subcripe to id
  client.subscribe(clientId);
  // når vi modtager beskeder fra MQTT serveren kaldes denne funktion
  client.on('message', (topic, message) => {
    console.log('Received Message: ' + message.toString() + '\nOn topic: ' + topic);
    if(topic == clientId){
      // if message is a challenge
      if (message.includes("Chal-:-")) {
        // decode message
        message = message.toString();
        let mes = split(message, "-:-");
        // remove first intry in array
        mes.shift();
        // alert player of new challenge
        alert_challenged_resived(mes);
      }
      // else if message is list of players
      else if(message.includes("-:-")) {
        // decode message of players
        let mes = split(message.toString(), "-:-");
        let txt = [];
        for(let i = 1; i < mes.length; i++) {
          txt[i - 1] += mes[i];
          txt[i -1] = txt[i-1].replace("undefined", "");
        }
        let newMessage = []
        for(let i = 1; i < txt.length; i++) {
          if(i % 2) {
            newMessage[newMessage.length] = [txt[i-1], txt[i]];
          }
        }
        // create buttons for all players
        createButtons(newMessage);
      }
      // else random challenge
      else {
        resiveChallenge(message);
      }
    }
  });
  select("#info_box").html("Du har completed " + getItem("completed") + " challenges");
  showPage("login");
}
// change text on page to challenge
function resiveChallenge(challenge) {
  if(logedin) {
    select("#Challenge_Text_Login").html(challenge.toString());
  }
  else {
    select("#Challenge_Text").html(challenge.toString());
  }
}

// disable all pages and enable inputed page
function showPage(page) {
  select("#login").addClass("hidden");
  select("#homeLogin").addClass("hidden");
  select("#chooseChallenge").addClass("hidden");
  select("#chosenChallenger").addClass("hidden");
  select("#receiveLogin").addClass("hidden");
  select("#home").addClass("hidden");
  select("#add").addClass("hidden");
  select('#receive').addClass('hidden');
  // enable the perameter page name
  select("#" + page).removeClass("hidden");
}

// Login
function Login() {
  let name = select("#loginText").value();
  if (name != "" && name != "Please inter a username") {
    storeItem("username", name);
    client.publish("Login", (clientId + "-:-" + name));
    showPage("homeLogin");
    logedin = true;
  }
  else {
    select("#loginText").value("Please inter a username")
  }
}

// change page and receive a challenge
function toGet() {
  showPage("receive");
  client.publish("giveChallenge", clientId);
}
// resive random challenge
function random_challenge() {
  showPage("receiveLogin");
  client.publish("giveChallenge", clientId);
}

// add new challenge button, send input fleid value to mqtt host
function make() {
  let value = select("#link").value();
  if(value != "" && value != "Error") {
    select("#link").value("");
    client.publish("Konge_spil", value);
    showPage("home");
  } else {
    select("#link").value("Error");
  }
}

// completed challenge button
function completed() {
  // change page back to home page
  showPage("home");

  // load localstorage
  let completed = getItem("completed");
  if(!completed) {
    storeItem('completed', 1);
  } // store new number of completed challenges
  else {
    completed++;
    storeItem("completed", completed);
  }
  // update info text on home page
  select("#info_box").html("Du har completed " + getItem("completed") + " challenges");
}
function completed_login() {
  showPage("homeLogin");

  // load localstorage
  let completed = getItem("completed");
  if(!completed) {
    storeItem('completed', 1);
  } // store new number of completed challenges
  else {
    completed++;
    storeItem("completed", completed);
  }
  // update info text on home page
  select("#info_box").html("Du har completed " + getItem("completed") + " challenges");
}
// get chosen player id and change page
function costomChallenge(id) {
  player_challenged = id
  select("#Player_Name").html(id[1])
  showPage("chosenChallenger");
}

// create buttons for list of players
function createButtons(players) {
  // div the buttons get childed to
  let div = select("#players")
  // for all players create button and create function for each button
  for(let i = 0; i < players.length; i++) {
    let button
    button = createButton(players[i][1]);
    button.mousePressed(()=> {
      costomChallenge(players[i]);
    });
    // add id to button and child it to div
    button.id("buttonList");
    let br = createElement("br");
    div.child(button);
    div.child(br);
  }
}
// send challenge to player
function send_challenge() {
  // given challenge
  let input_challenge = select(".Giving_Challenge").value();
  // the incoded message published
  let message = clientId + "-:-" + player_challenged[0] + "-:-" + input_challenge;
  client.publish("challenge_player", message);
  showPage("homeLogin");
}

// create confirm when player is challenged
function alert_challenged_resived(challenge) {
  // show confirm of username of the challenger
  let choice = confirm(challenge[0] + " has challenged you!");
  // if player accept the challenge
  if(choice) {
    showPage("receiveLogin");
    select("#Challenge_Text_Login").html(challenge[1]);
  }
}

// update
function draw() {
  // if page is changed to choose challenge, get list of players
  if (!select("#chooseChallenge").hasClass('hidden') && bool == false) {
    client.publish("Get_Players", clientId);
    bool = true;
  }
  // else remove all elements created
  else if (select("#chooseChallenge").hasClass('hidden')) {
    removeElements();
    bool = false;
  }
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
