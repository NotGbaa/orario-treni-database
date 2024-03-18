const partenza = document.getElementById("origine");
const arrivo = document.getElementById("arrivo");
const time = document.getElementById("time");

const username = document.getElementById("username");
const password = document.getElementById("password");

const invioLogin = document.getElementById("invioLogin");
const divLogin = document.getElementById("login");
const divPrivate = document.getElementById("private");

const buttonAddTratta = document.getElementById("invioTratta");
const buttonAddPartenza = document.getElementById("invioPartenza");
const partenzaForm = document.getElementById ("partenza");
const idTratta = document.getElementById ("idTratta");

const tabella = document.getElementById("tableTratte");
const tabellaOrari = document.getElementById("tableOrari");

invioLogin.onclick = () => {
  const credenziali = {
    username: username.value,
    password: password.value,
  };
  console.log(credenziali);
  sendLogin(credenziali).then((result) => {
    if (result.result === "ok") {
      console.log("Entrato if");
      divLogin.classList.remove("block");
      divLogin.classList.add("none");
      divPrivate.classList.remove("none");
      divPrivate.classList.add("block");
      getTratte();
      getOrari();
      
    } else {
      alert("Credenziali errate");
    }
  });
};

const sendLogin = (credenziali) => {
  return new Promise((resolve, reject) => {
    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credenziali),
    })
      .then((response) => response.json())
      .then((json) => {
        resolve(json);
      });
  });
};

const sendTratta = (tratta) => {
  return new Promise((resolve, reject) => {
    fetch("/addTratta", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tratta),
    })
      .then((response) => response.json())
      .then((json) => {
        resolve(json);
      });
  });
};

const sendPartenza = (partenza) => {
  return new Promise((resolve, reject) => {
    fetch("/addPartenza", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(partenza),
    })
      .then((response) => response.json())
      .then((json) => {
        resolve(json);
      });
  });
};

const getTratte = () => {
  return new Promise((resolve, reject) => {
    fetch("/getTratte")
      .then((response) => response.json())
      .then((json) => {
        renderTratte(json.dati);
      });
  });
}

const getOrari = () => {
  return new Promise((resolve, reject) => {
    fetch("/getOrari")
      .then((response) => response.json())
      .then((json) => {
        renderOrari(json.dati);
      });
  });
}


buttonAddTratta.onclick = () => {
  const tratta = {
    partenza: partenza.value,
    arrivo: arrivo.value,
    time: time.value,
  };

  sendTratta(tratta);
  getTratte();
};

buttonAddPartenza.onclick = () => {
  const partenza = {
    idTratta: idTratta.value,
    partenza: partenzaForm.value,
  };

  sendPartenza(partenza);
  getOrari();
}


const headerTreni = `
<tr class="text-center">
  <th>ID</th>
  <th>Stazione di partenza</th>
  <th>Stazione di arrivo</th>
  <th>Durata</th>
</tr>
`;

const template = `
<tbody id="treniBody">
<tr>
  <th>%ID</th>
  <th>%PARTENZA</th>
  <th>%ARRIVO</th>
  <th>%DURATA</th>
</tr>
</tbody>
`;

const renderTratte = (tratte) => {
  let html = headerTreni;
  for (let i = 0; i< tratte.length; i++){
    let rowHtml = template.replace("%ID", tratte[i].id)
    .replace("%PARTENZA", tratte[i].stazioneOrigine)
    .replace("%ARRIVO", tratte[i].stazioneArrivo)
    .replace("%DURATA", tratte[i].durata);
    html += rowHtml;
  }
  tabella.innerHTML = html;
}


const headerOrari = `
<tr class="text-center">
  <th>ID</th>
  <th>Partenza</th>
  <th>ID tratta</th>

</tr>
`;

const templateOrari = `
<tbody id="treniBody">
<tr>
  <th>%ID</th>
  <th>%PARTENZA</th>
  <th>%IDTRATTA</th>
</tr>
</tbody>
`;

const renderOrari = (partenza) => {
  let html = headerOrari;
  for (let i = 0; i< partenza.length; i++){
    let rowHtml = templateOrari.replace("%ID", partenza[i].id)
    .replace("%PARTENZA", partenza[i].partenza)
    .replace("%IDTRATTA", partenza[i].tratta_id);
    html += rowHtml;
  }
  tabellaOrari.innerHTML = html;
}