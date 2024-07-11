///////// IMPORTS ///////// 

import { GoogleGenerativeAI } from "@google/generative-ai";
const API_KEY = "AIzaSyAeGh0hB_nerwQfsx2UWN0pyZ0r8r3Gd7o";
// Access your API key (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(API_KEY);


///////// ELEMENTS ///////// 

const chat = document.getElementById("chat");

const userMessage = document.querySelector('.user-message');
const botMessage = document.querySelector('.bot-message');
const inputField = document.querySelector('.input-field');
const loadMassage = document.querySelector('.load-msg');
const endLine = document.querySelector('.end-line');
const sendButton = document.querySelector('.send');
const debugButton = document.getElementById("debug");

const usrDiv = document.createElement('div');
const botDiv = document.createElement('div');
usrDiv.className = "user-message";

const audio_usr = new Audio('/audio/usr-send.mp3');
const audio_bot = new Audio('/audio/bot-send.mp3');
const audio_err = new Audio('/audio/error.mp3');


///////// CONSTANTES ///////// 

const hst = "chat-0";

///////// VARIAVEIS ///////// 

let prompt = "";
var text = "";
var cooldown = true;
let chatp = "";


///////// FUNÇÕES GERAIS ///////// 

// retorna um nunero eleatorio de um numero minimo a um maximo
function getRND(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// carrega uma paleta especifica na root css
function pallet() {
  let link = document.documentElement.style;

  link.setProperty('--color-f', '#e4e1e2');
  link.setProperty('--color-p', '#aea4e3');
  link.setProperty('--color-s', '#5d5878');
  link.setProperty('--color-z', '#3F3D4A');
  link.setProperty('--color-d', '#313038');
  link.setProperty('--color-b', '#1c1b21');
}

// copia o prompt para a clipboard
function debug() {
  navigator.clipboard.writeText(chatp);
  //alert("Prompt copiado com sucesso, conteudo:\n\n"+chatp);
  //console.log(chatp)
}

// atualiza a animação do icone de enviar
function icbtnsend(trigger) {
  let loopic = '<lord-icon src="https://cdn.lordicon.com/mgtqmgmg.json" trigger="loop" state="loop-spin" colors="primary:#3F3D4A" style="width:0%;height:0%"> </lord-icon>';
  let clickic = '<lord-icon src="https://cdn.lordicon.com/ayhtotha.json" trigger="'+trigger+'" colors="primary:#3F3D4A" style="width:80%;height:80%"> </lord-icon>';
  document.querySelector('.send').innerHTML = clickic;
}

// retorna uma imagem atravez de uma descrição
function getImg() {
  let apiKey = "44797048-381ef955887bcab451564aada";
  for (let i = 0; i < 50; i++) {
    let idImg = document.getElementById("img_id_"+i);
    if (idImg) {
      let name = idImg.alt;
      let requestURL = `https://pixabay.com/api/?key=${apiKey}&image_type=all&pretty=true&per_page=20&q=`+name;
      fetch(requestURL)
       .then(response => response.json())
       .then(data => {
          console.log(data.hits.length)
          let img = data.hits[i%3].webformatURL;
          idImg.src = img;
        })
    }
  }
}

// retorna um video do youtube atravez de uma descrição
async function getVid() {
  let apiKey = 'AIzaSyBuTPSEfD8hdYioqxXbMA71l5AtXaNK-gU';
  for (let i = 0; i < 30; i++) {
    let idVid = document.getElementById("vid_id_"+i);
    if (idVid && idVid.src === "") {
    try {
      let query = idVid.title;
      console.log(query);
      let response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
        params: {
          key: apiKey,
          q: query,
          type: 'video',
          maxResults: 30,
        },
      });

      const videoId = response.data.items[i].id.videoId;
      console.log(response.data);
      idVid.src = "https://www.youtube.com/embed/"+videoId+"?autoplay=1&mute=0";
    } catch (error) {
      console.error('Erro ao buscar vídeo:', error.message);
    }
    }
  }
}


///////// FUNÇÕES BASES ///////// 

// retorna o prompt
fetch(`/history/prompt.txt`)
  .then((res) => res.text())
  .then((texto) => {
    prompt = texto;
  }
);

// retorna o prompt
fetch(`/history/${hst}.txt`)
  .then((res) => res.text())
  .then((texto) => {
    chat.innerHTML = texto;
  }
);

function sendMessage() {
  const userText = inputField.value;
  if (userText !== "" && cooldown) {
      
    loadMassage.style.transition= "1s";
    loadMassage.style.animation= "appear 0.5s ease";
    loadMassage.style.transform = "scale(1)";
    loadMassage.style.opacity = 1;
    
    icbtnsend('in');
    audio_usr.play();
    
    getImg();
    getVid();
    
    chat.innerHTML += `<div class="user-message">\n  <p>${userText}</p>\n</div>\n`;
    enviarMensagem(userText,prompt+chat.innerHTML);
    inputField.value = '';
    cooldown = false;
  }
}

async function enviarMensagem(userMsg,perg) {

  const model = genAI.getGenerativeModel({model: "gemini-1.5-pro"});
  const result = await model.generateContent(perg);
  const response = await result.response;
  const resposta = response.text();
  
  text = `${resposta}\n`;
  chat.innerHTML += text;
  chatp = chat.innerHTML;
  
  loadMassage.style.transition= "0s";
  loadMassage.style.animation= "none";
  loadMassage.style.transform = "scale(0)";
  loadMassage.style.opacity = 0;
  
  audio_bot.play();
  endLine.scrollIntoView({ block: "end", behavior: "smooth" });
  cooldown = true;
  
  getImg();
  getVid();
}

// Evento para enviar mensagem quando pressionar o botão "Enviar"
sendButton.addEventListener('click', sendMessage);
debugButton.addEventListener('click', debug);

// Evento para enviar mensagem quando pressionar Enter no campo de entrada
inputField.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendMessage();
  }
});


///////// DEBUG /////////



///////// CARREGAR FUNÇÕES ///////// 

icbtnsend("none");
window.addEventListener('load', pallet);


///////// ANOTAÇÕES /////////
/*

      const prompt = "Quem foi Nicola Tesla?"
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
        
      // Seleciona a div principal 
      var divPrincipal = document.getElementById("minhaDiv");

      // Cria uma nova div 
      var usrDiv = document.createElement('div');

      // Define a classe da nova div 
      usrDiv.className = "minhaClasse"; 

      // Define o conteúdo HTML da nova div 
      usrDiv.innerHTML = '<h2>Título da Nova Div</h2><p>Este é um parágrafo dentro da nova div.</p>';

      // Adiciona a nova div à div principal
      divPrincipal.appendChild(usrDiv);

*/
