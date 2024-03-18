const fs = require("fs");
const mysql = require("mysql2");
const conf = require("./conf.js");
console.log(conf);
const connection = mysql.createConnection(conf);
const express = require("express");
const http = require("http");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
let tratte = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", express.static(path.join(__dirname, "public")));

const server = http.createServer(app);
server.listen(80, () => {
  console.log("- server running");
});

/* MANUEL E GABRI (vi ho mandato il mio vecchio compito, c'è già questa pagina dovete solo cambiare e prendere i dati dal db)
..............................................
- creare una pagina che permette di interrogare il sistema con le seguenti interrogazioni:
a) treni in partenza da una certa stazione ad un certo orario: indica tutti i treni in partenza da quella stazione a
partire da quell'orario  
b) treni in arrivo ad una certa stazione ad un certo orario: indica tutti i treni in arrivo a quella stazione a partire
da quell'orario
c) tutti gli orari di una precisa tratta (indicando stazione di partenza ed arrivo). (SONO IL MANUEL, INIZIO A FARE QUESTO MO')
*/


//metodo per controllare l'accesso all'area privata
app.post("/login", (req, res) => {
  //preno credenziali da richiesta
  const username = req.body.username;
  const password = req.body.password;
  console.log(username + " - " + password);
  //richiamo metodo che controlla
  checkLogin(username, password)
    //se esiste, restituisco ok altrimenti blocco
    .then((result) => {
      if (result === true) {
        res.json({ result: "ok" });
      } else {
        res.status(401).json({ result: "Unauthorized" });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ result: "Internal Server Error" });
    });
});


//metodo per aggiungere una tratta sul db, prende da richiesta i dettagli della tratta e esegue la query
app.post("/addTratta", (req, res) => {
  //dettagli tratta
  const partenza = req.body.partenza;
  const arrivo = req.body.arrivo;
  const time = req.body.time;
  console.log(partenza + " - " + arrivo + " - " + time);
  //template della query
  const template = "INSERT INTO tratta (stazioneOrigine, stazioneArrivo, durata) VALUES ('%PARTENZA', '%ARRIVO', '%TIME')";
  //creo query finale
  let sql = template.replace("%PARTENZA", partenza).replace("%ARRIVO", arrivo).replace("%TIME", time);
  console.log("query inserimento creata: " + sql);
  return executeQuery (sql); //eseguo
});

//metodo per aggiungere un orario di partenza sul db, prende da richiesta i dettagli e esegue la query
app.post("/addPartenza", (req, res) => {
  //dettagli partenza
  const idTratta = req.body.idTratta;
  const partenza = req.body.partenza;
  console.log(idTratta + " - " + partenza);
  //template della query
  const template = "INSERT INTO orari (partenza, tratta_id) VALUES ('%PARTENZA', '%TRATTA')";
  //creo query finale
  let sql = template.replace("%PARTENZA", partenza).replace("%TRATTA", idTratta);
  console.log("query inserimento creata: " + sql);
  return executeQuery (sql); //eseguo
});

//metodo per prendere tutte le tratte presenti sul db e restituirle al client
app.get("/getTratte", (req, res) => {

  //richiamo metodo che esegue la query 
  selectAllTratte().then((response) => {
    console.log(response);
    tratte = response;
    //invio al client le tratte ricevute da db
    res.json({ dati: response});
  })
  .catch((error) => {
    console.log("errore: " + error);
  });

});


app.get("/getOrari", (req, res) => {
  //richiamo metodo che esegue la query 
  selectAllOrari().then((response) => {
    console.log(response);
    orari = response;
    //invio al client gli orari ricevute da db
    res.json({ dati: response});
  })
  .catch((error) => {
    console.log("errore: " + error);
  });

});

//metodo per prendere tutte le stazioni di partenza presenti sul db e restituirle al client
app.get("/get-stazioni-origine", (req, res) => {
console.log("cerco i dati")
  //richiamo metodo che esegue la query 
  selectAllStazioniOrigine().then((response) => {
    //invio al client le tratte ricevute da db
    res.json({ dati: response});
  })
  .catch((error) => {
    console.log("errore: " + error);
  });

});


app.get("/get-stazioni-destinazione", (req, res) => {
console.log("cerco i dati")
  //richiamo metodo che esegue la query 
  selectAllStazioniDest().then((response) => {
    //invio al client le tratte ricevute da db
    res.json({ dati: response});
  })
  .catch((error) => {
    console.log("errore: " + error);
  });

});




// Metodo per ricevere tutte le partenze da una stazione dopo un orario
app.post("/get-orari", (req, res) => {
console.log("cerco i dati")
  let orario = req.body.orario;
  let cittaPartenza = req.body.cittaPartenza;
  console.log(orario,cittaPartenza)
  //richiamo metodo che esegue la query 
  selectTreniInPartenza(orario, cittaPartenza).then((response) => {
    //invio al client le tratte ricevute da db
    res.json({ dati: response});
  })
  .catch((error) => {
    console.log("errore: " + error);
  });

});


// Metodo per ricevere tutte le partenze da una stazione dopo un orario
app.post("/get-orari-destinazione", (req, res) => {
  let orario = req.body.orario;
  let cittaArrivo = req.body.cittaArrivo;
  //richiamo metodo che esegue la query 
  selectTreniInArrivo(orario, cittaArrivo).then((response) => {
    //invio al client le tratte ricevute da db
    res.json({ dati: response});
  })
  .catch((error) => {
    console.log("errore: " + error);
  });

});

//metodo per controllare le credenziali
checkLogin = (username, password) => {
  return new Promise((resolve, reject) => {
    //cerco nel db tutti gli utenti che abbiamo quell username e quella password
    //template della query
    const template = "SELECT * FROM utenti WHERE username = '%USERNAME' AND password = '%PASSWORD'";
    //query finale
    const sql = template.replace("%USERNAME", username).replace("%PASSWORD", password);

    //eseguo e controllo
    executeQuery(sql)
      .then((result) => {
        //se maggiore di 0, QUINDI ESISTE UN UTENTE CON QUELLE CREDENZIALI, restituisco true
        if (result.length > 0) {
          resolve(true); // Utente esistente
        } else {
          //altrime FALSE, non esiste
          resolve(false); // Credenziali non valide
        }
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
};

const selectAllTratte = () => {
   const sql = `
   SELECT * FROM tratta;
      `;
   return executeQuery(sql); 
}

const selectAllOrari = () => {
   const sql = `
   SELECT * FROM orari;
      `;
   return executeQuery(sql); 
}

const selectAllStazioniOrigine = () => {
   const sql = `
   SELECT MIN(id),stazioneOrigine 
   FROM tratta
   GROUP BY stazioneOrigine
   ORDER BY stazioneOrigine;
      `;
   return executeQuery(sql); 
}


const selectAllStazioniDest = () => {
   const sql = `
   SELECT MIN(id),stazioneArrivo 
   FROM tratta
   GROUP BY stazioneArrivo
   ORDER BY stazioneArrivo;
      `;
   return executeQuery(sql); 
}
//select id da stazione di partenza e stazione di Arrivo
const selectID = (stazionePartenza, stazioneArrivo ) => {
   const template = `
   SELECT id  
   FROM tratta
   WHERE stazioneOrigine = '%STAZIONE_PARTENZA' AND stazioneArrivo = '%STAZIONE_ARRIVO';
      `;
  const sql = template.replace("%STAZIONE_PARTENZA", stazionePartenza).replace("%STAZIONE_ARRIVO", stazioneArrivo);
   return executeQuery(sql); 
}
/////MANUEL DA QUI
//select orario da id
const selectOrario = ( id ) => {
   const template = `
   SELECT partenza  
   FROM orari 
   WHERE tratta_id= '%ID' ;
      `;
  const sql = template.replace("%ID", id);
   return executeQuery(sql); 

}
//funzione app per prendere gli orari dei treni data la partenza e l'arrivo
app.get("/puntoC", (req, res) => {
console.log("cerco gli orari")
  selectOrario(selectID(req.body.stazionePartenza, req.body.stazioneArrivo)).then((response) => {
    res.json({ orari: response});
  })
  .catch((error) => {
    console.log("errore: " + error);
  });
});
//// A QUI

const selectTreniInPartenza = (orario, stazionePartenza) =>{
  const template = `select * from orari join tratta on orari.tratta_id=tratta.id 
  where partenza >= '$ORARIO' AND tratta.stazioneOrigine = '$STAZIONE_PARTENZA'`
  const sql = template.replace("$STAZIONE_PARTENZA", stazionePartenza).replace( "$ORARIO", orario);
  return executeQuery(sql);
}

const selectTreniInArrivo = (orario, stazioneArrivo) =>{
  const template = `
  select *, ADDTIME(orari.partenza, tratta.durata) as ora_arrivo from orari join tratta on orari.tratta_id=tratta.id 
  where ADDTIME(orari.partenza, tratta.durata) >= '$ORARIO' AND tratta.stazioneArrivo = '$STAZIONE_ARRIVO'`
  const sql = template.replace("$STAZIONE_ARRIVO", stazioneArrivo).replace( "$ORARIO", orario);
  return executeQuery(sql);
}

const executeQuery = (sql) => {
   return new Promise((resolve, reject) => {      
         connection.query(sql, function (err, result) {
            if (err) {
               console.error(err);
               reject();     
            }    
           //se funziona stampo messaggio 
            console.log('done');
            resolve(result);         
      });
   })
}
