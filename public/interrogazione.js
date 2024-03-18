let selectOrigine=document.getElementById("selectOrigine");
let buttonCerca = document.getElementById("cerca");
let inputOrario = document.getElementById("orario")
let treniBody=document.getElementById("treniBody");
let selectDest=document.getElementById("selectDest");
let buttonCercaDest = document.getElementById("cercaDest");
let inputOrarioDest = document.getElementById("orarioDest");
//MANUEL DA QUI
let buttonCercaOrari = document.getElementById("cercaOrari");
let partenza = document.getElementById("partenza");
let arrivo = document.getElementById("arrivo");
// A QUI

const loadStazioniOrigine=()=>{
  console.log("chiamata effettuata")
  fetch("/get-stazioni-origine")
  .then((response)=>response.json())
  .then((json)=>{
    console.log(json)
    let html="";
    html+=`<option value="" selected disabled hidden>seleziona città partenza</option>`;
    for(let i=0;i<json.dati.length;i++){
      html+=`<option value="${json.dati[i].stazioneOrigine}">${json.dati[i].stazioneOrigine}</option>`;
    }
    console.log(html)
    selectOrigine.innerHTML=html;
    partenza.innerHTML=html;
  })
  .catch((error)=>{
    console.log(error);
  })
}
loadStazioniOrigine();



const loadStazioniDest=()=>{
  console.log("chiamata effettuata")
  fetch("/get-stazioni-destinazione")
  .then((response)=>response.json())
  .then((json)=>{
    console.log(json)
    let html="";
    html+=`<option value="" selected disabled hidden>seleziona città destinazione</option>`;
    for(let i=0;i<json.dati.length;i++){
      html+=`<option value="${json.dati[i].stazioneArrivo}">${json.dati[i].stazioneArrivo}</option>`;
    }
    console.log(html)
    selectDest.innerHTML=html;
    arrivo.innerHTML=html;
  })
  .catch((error)=>{
    console.log(error);
  })
}
loadStazioniDest();




//MANUEL
//orari tratta data stazione di partenza e arrivo
const getOrari=()=>{
  let part=partenza.value;
  let arr=arrivo.value;
  console.log(part,arr);
  fetch("/get-orario", {
       method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          stazionePartenza:part,
          stazioneArrivo:arr
        })
  })
  .then((response)=>response.json())
  .then((json)=>{
    console.log(json)
    tabellaOrari(json);
  })
  .catch((error)=>{
    console.log(error);
  })
}
// QUI E SI COLLEGA A TABELLAORARI GIù

const onLoadOrari=()=>{
  let orario = inputOrario.value
  let cittaPartenza = selectOrigine.value
  console.log("partenza ",cittaPartenza,orario)

  fetch("/puntoC", {
       method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orario:orario,
          cittaPartenza:cittaPartenza
        })
  })
  .then((response)=>response.json())
  .then((json)=>{
    console.log(json)
    tabella(json);
  })
  .catch((error)=>{
    console.log(error);
  })
}

const onLoadOrariDest=()=>{
  let orario = inputOrarioDest.value
  let cittaArrivo = selectDest.value
  console.log("arrivo ",cittaArrivo,orario)

  fetch("/get-orari-destinazione", {
       method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orario:orario,
          cittaArrivo:cittaArrivo
        })
  })
  .then((response)=>response.json())
  .then((json)=>{
    console.log(json)
    tabellaDest(json);
  })
  .catch((error)=>{
    console.log(error);
  })
}


function cercaOrari () {
  console.log("passo");
  getOrari();
  partenza.value="";
  arrivo.value="";
}
buttonCercaOrari.addEventListener("click",cercaOrari);

function azioniCerca () {
  onLoadOrari();
  selectOrigine.value="";
  inputOrario.value="";
}
buttonCerca.addEventListener("click",azioniCerca)

function azioniCercaDest () {
  onLoadOrariDest();
  selectDestDest.value="";
  inputOrarioDest.value="";
}
buttonCercaDest.addEventListener("click",azioniCercaDest)


const tabella=(json)=>{
  console.log("tabella");
  console.log(json);
  let html="";
  for(let i=0;i<json.dati.length;i++){
    html+=`<tr>
          <td>${json.dati[i].partenza}</td>
          <td>${json.dati[i].stazioneArrivo}</td>
        </tr>`;
  }
    treniBody.innerHTML=html;
}

const tabellaDest=(json)=>{
  console.log("tabella");
  console.log(json);
  let html="";
  for(let i=0;i<json.dati.length;i++){
    html+=`<tr>
          <td>${json.dati[i].ora_arrivo}</td>
          <td>${json.dati[i].stazioneArrivo}</td>
        </tr>`;
  }
    treniBody.innerHTML=html;
}

//QUI
const tabellaOrari= (json)=>{
  console.log(json);
  let html="";
  for(let i=0;i<json.orari.length;i++){
    html+=`<tr>
          <td>${json.orari[i]}</td>
        </tr>`;
  }
    treniBody.innerHTML=html; 
}