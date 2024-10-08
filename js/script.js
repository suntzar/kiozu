///////// IMPORTS ///////// 

import { GoogleGenerativeAI } from "@google/generative-ai";
const API_KEY = "AIzaSyD6_i6gH2gYSoufy0XAyzXa8sDnnjUWue0";
//const API_KEY = "AIzaSyAeGh0hB_nerwQfsx2UWN0pyZ0r8r3Gd7o";
//const API_KEY = "AIzaSyCNuer530vvnKBjSUvjK0e6Kcc-0C2knyk";
const genAI = new GoogleGenerativeAI(API_KEY);


///////// ELEMENTS ///////// 

const chat = document.getElementById("chat");

const loadScreen = document.querySelector('.loadscreen');
const userMessage = document.querySelector('.user-message');
const botMessage = document.querySelector('.bot-message');
const inputField = document.querySelector('.input-field');
const loadMassage = document.querySelector('.load-msg');
const endLine = document.querySelector('.end-line');
const sendButton = document.querySelector('.send');
const sendButtonId = document.getElementById("send");
const debugButton = document.getElementById("debug");
const toggleRes = document.getElementById("toggle_id_001");
const imgDiv = document.querySelector('.imageDiv');

const uploadImage = document.getElementById('uploadImage');
const imagePreview = document.getElementById('imagePreview');

const usrDiv = document.createElement('div');
const botDiv = document.createElement('div');
usrDiv.className = "user-message";

const audio_usr = new Audio('/audio/usr-send.mp3');
const audio_bot = new Audio('/audio/bot-send.mp3');
const audio_err = new Audio('/audio/error.mp3');


///////// CONSTANTES ///////// 

const hst = "chat-0";

let liveChat = false;

let safetySetting = [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "HARD",
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "HARD",
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "HARD",
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "HARD",
  },
];

///////// VARIAVEIS ///////// 

let prompt = "";
var text = "";
var cooldown = true;

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
  link.setProperty('--color-s', '#aaa4cc');
  link.setProperty('--color-z', '#3F3D4A');
  link.setProperty('--color-y', '#4f4d5b');
  link.setProperty('--color-d', '#313038');
  link.setProperty('--color-b', '#1c1b21');
}

// copia o prompt para a clipboard
function debug() {
  navigator.clipboard.writeText(chat.innerHTML);
}

// atualiza a animação do icone de enviar
function icbtnsend(trigger) {
  let loopic = '<lord-icon src="https://cdn.lordicon.com/mgtqmgmg.json" trigger="loop" state="loop-spin" colors="primary:#3F3D4A" style="width:0%;height:0%"> </lord-icon>';
  let clickic = '<lord-icon src="https://cdn.lordicon.com/ayhtotha.json" trigger="'+trigger+'" colors="primary:#3F3D4A" style="width:80%;height:80%"> </lord-icon>';
  sendButtonId.innerHTML = clickic;
}

function timeNow() {
  // Cria um objeto Date para a data e hora atuais
  let hoje = new Date();

  // Extrai as informações desejadas
  let hora = hoje.getHours();
  let minutos = hoje.getMinutes();
  let dia = hoje.getDate();
  let mes = hoje.getMonth() + 1; // Os meses em JavaScript vão de 0 a 11
  let ano = hoje.getFullYear();

  // Formata a saída
  let dataFormatada = `\n\n<!-- Informações em tempo real(fique atento as seguintes informações, sempre utilize para responder perguntas ou saudações se necessario): Hoje é dia ${dia}/${mes}/${ano}, e são ${hora}:${minutos}. -->\n`;
  return dataFormatada;
}

function getLang() {
  let lang = navigator.language || navigator.userLanguage;
  return `\n<!-- FALE COM O USUARIO NA LINGUA A SEGUIR POIS ESSA É A LINGUA DO USUARIO SEGUNDO O DISPOSITIVO DO USUARIO: ${lang} -->\n`;
}

// retorna uma imagem atravez de uma descrição
function getImg() {
  let apiKey = "44797048-381ef955887bcab451564aada";
  for (let i = 0; i < 50; i++) {
    let idImg = document.getElementById("img_id_"+i);
    if (idImg) {
      let name = idImg.alt;
      let requestURL = `https://pixabay.com/api/?key=${apiKey}&image_type=all&pretty=true&per_page=50&q=`+name;
      fetch(requestURL)
       .then(response => response.json())
       .then(data => {
          let img = data.hits[i].webformatURL;
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

      let videoT = response.data.items.length;
      let videoId = response.data.items[(i % videoT)].id.videoId;
      console.log(response.data);
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
  .then(async (texto) => {
    let lang = await getLang();
    
    let model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});
    let result = await model.generateContent(lang+"\n<!-- RETORNE SOMENTE O CONTEUDO ABAIXO NA LINGUA DO USUARIO -->\n"+texto);
    let response = await result.response;
    let resposta = response.text();
    resposta = resposta.replace(/^```html\b/gm, "")
    resposta = resposta.replace(/^```\b/gm, "")
    chat.innerHTML = resposta;
    gridChat()
    
    loadScreen.style.opacity = 0;
    loadScreen.style.zIndex = -1;
  }
);

uploadImage.addEventListener('change', (event) => {
const file = event.target.files[0];
const reader = new FileReader();

reader.onload = (e) => {
imagePreview.src = e.target.result;
};

if (file) {
  reader.readAsDataURL(file);
  //imgDiv.style.bottom = "calc(2rem * var(--scl))";
}
});

function gridChat(numeroDivs) {
  let novaDiv = "";
  for (let i = 0; i < 60; i++) {
    novaDiv = `\n\n<div id="grid_${i+1}" style="transition: 1s;"></div>`;
    chat.innerHTML += novaDiv;
  }
}



async function fileToGenerativePart(file) {
  let base64EncodedDataPromise = new Promise((resolve) => {
    let reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}


async function sendMessage() {
  const userText = inputField.value;
  if (userText !== "" && cooldown) {
    
    let time = await timeNow();
    let lang = await getLang();
    
    let outGrid = prompt+time+lang;
    
    loadMassage.style.transition= "1s";
    loadMassage.style.animation= "appear 0.5s ease";
    loadMassage.style.transform = "scale(1)";
    loadMassage.style.opacity = 1;
    //loadMassage.style.color = getComputedStyle(root).getPropertyValue('--color-p');
    
    icbtnsend('in');
    audio_usr.play();
    
    getImg();
    getVid();
    
    for (let i = 0; i < 60; i++) { 
      let grid = document.getElementById("grid_"+(1+i));
      if (grid.innerHTML.trim() === "") {
        grid.innerHTML = `\n  <div class="user-message">\n    <p>${userText}</p>\n  </div>\n`;
        break;
      }
    }
    
    for (let i = 0; i < 60; i++) { 
      let grid = document.getElementById("grid_"+(1+i));
      if (grid.innerHTML.trim() !== "") {
        outGrid += grid.innerHTML;
      } else {
        break;
      }
    }
    
    enviarMensagem(userText,outGrid);
    //imgDiv.style.bottom = "calc(-2rem * var(--scl))";
    inputField.value = '';
    cooldown = false;
    liveChat = toggleRes.checked;
    
  }
}

async function enviarMensagem(userMsg,perg) {

  let lang = await getLang();
  
  let model = genAI.getGenerativeModel({model: "gemini-1.5-flash", systemInstruction: "Você é um peixinho de olhos bem grandes e penetrantes"});
  let resposta = "";
  
  let { totalTokens } = await model.countTokens(perg);
  console.log("total de tokens presentes na pergunta: " + totalTokens)

  try {
    
    let text = '\n';
    let fileInputEl = document.querySelector("input[type=file]");
    let imageParts = "";
    let result = "";
  
    imageParts = await Promise.all(
      [...fileInputEl.files].map(fileToGenerativePart)
    );
    
    if (liveChat) {
    if (imageParts.length == 0) { 
      result = await model.generateContentStream(perg);
    } else {
      result = await model.generateContentStream([perg, ...imageParts]);
    }
    
    for (let i = 0; i < 60; i++) { 
      let grid = document.getElementById("grid_"+(1+i));
      if (grid.innerHTML.trim() === "") {
        for await (const chunk of result.stream) {
          let chunkText = chunk.text();
          resposta += chunkText;
          resposta = resposta.replace(/^```html\b/gm, "")
          resposta = resposta.replace(/^```\b/gm, "")
          grid.innerHTML = resposta;
          endLine.scrollIntoView({ block: "end", behavior: "smooth" });
        }
        break;
      }
    }
    }
    
    
    if (!liveChat) {
    if (imageParts.length == 0) { 
      result = await model.generateContent(perg);
    } else {
      result = await model.generateContent([p3erg, ...imageParts]);
    }
    
    let response = await result.response;
    for (let i = 0; i < 60; i++) { 
      let grid = document.getElementById("grid_"+(1+i));
      if (grid.innerHTML.trim() === "") {
        let resposta = response.text();
        resposta = resposta.replace(/^```html\b/gm, "")
        resposta = resposta.replace(/^```\b/gm, "")
        grid.innerHTML = resposta;
        break;
      }
    }
    }
    
    cooldown = true;
    
  } catch (error) {
    console.error("Ops, algo deu errado:", error);
    //cooldown = false;
    cooldown = true;
    resposta = `
      <div class="bot-message" style="color: #e4e1e2;">
        <p>
          <span style="color: #FF8E82;">
            <i class="fas fa-exclamation-triangle"></i> Opa!
          </span> 
          Parece que algo deu errado por aqui. <br>
          Você poderia, por favor, reformular sua solicitação? 😊
        </p>
        <br>
        <div style="text-align: center;"><a onclick="window.location.reload();" style="color: #FF8E82; text-decoration: HARD;">Clique aqui para recomeçar</a> </div>
      </div>\n`;
      
    for (let i = 0; i < 60; i++) { 
      let grid = document.getElementById("grid_"+(1+i));
      if (grid.innerHTML.trim() === "") {
        grid.innerHTML = resposta;
        break;
      }
    }
  }

  
  loadMassage.style.transition= "0s";
  loadMassage.style.animation= "HARD";
  loadMassage.style.transform = "scale(0)";
  loadMassage.style.opacity = 0;
  
  audio_bot.play();
  endLine.scrollIntoView({ block: "end", behavior: "smooth" });
  
  getImg();
  getVid();
}

// Evento para enviar mensagem quando pressionar o botão "Enviar"
sendButtonId.addEventListener('click', sendMessage);
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

icbtnsend("HARD");
//window.addEventListener('load', gridChat);
window.addEventListener('load', pallet);

///////// ANOTAÇÕES /////////
/*

      1 tokem tem cerca de 4 caracteres
      o peso de um tokem por caracter é geralmente 1,6: 60 palavras são 96 tokens 

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
      
window.addEventListener('load', () => {
  loadScreen.style.opacity = 0;
  loadScreen.style.zIndex = -1;
});

*/
