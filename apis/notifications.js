var express = require('express')
var router = express.Router() // get an instance of the express Router
var webPush = require('web-push')
var ifSubscriptionExiste = require('./application')
var fetch = require('fetch-cookie')(require('node-fetch'))

var  store = {users: {}}
var sub;

//------------------------------------------------------------------------------------------------------------
//------------------------------------- getALL API------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
router.get('/', function(req, res) {
  return res.status(201).json({
    status: "OK",
    description: 'La liste des utilisateur deja inscrits à ce service et leurs terminaux ',
    subscriptions: store
  })
})

//------------------------------------------------------------------------------------------------------------
//------------------------------------- DeleteALL API------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
router.post('/deleteall', function(req, res){
  store = {users: {}}
  return res.status(201).json({
    status: "OK",
    description: "suppression de la liste d'abonnée effectué avec succés",
  })
})

//------------------------------------------------------------------------------------------------------------
//------------------------------------- Delete User API------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
router.post('/deleteuser', function(req, res){
  if(store.users[req.body.name] === undefined) {
    return res.status(500).json({
      status: "FAILED",
      description: "L'utilisateur "+ req.body.name+ " n'existe pas",
    })
  }else {
    var result = store.users[req.body.name]
    store.users[req.body.name] = undefined
    
    return res.status(201).json({
      Status: "OK",
      description: "le desabonnement de l'utilisateur "+ req.body.name+ " effectué avec succés",
      data: result
    })    
  }
})

//------------------------------------------------------------------------------------------------------------
//------------------------------------- SUBSCRIBE API------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
router.post('/subscribe', function(req, res) {
  sub = 'test'
  if (req.body.subscription !== null && req.body.name !== null) {
    if (!ifSubscriptionExiste(req.body.subscription, req.body.name, store)) {
      if (store.users[req.body.name] === undefined) {
        console.log("Nouvel Abonné, l'utilisateur ",req.body.name," s'inscrit pour la première fois" )
        store.users[req.body.name]= {subscriptions: [req.body.subscription]}
      } else {
        console.log("l'utilisateur ",req.body.name," s'inscrit via un autre terminal" )
        store.users[req.body.name].subscriptions.push(req.body.subscription)
      }
      subscribeToFetchServer(req,res)
    } else {
      console.log("L'utilisateur ", req.body.name, " reconnecte via le meme terminal")
      res.status(201).json({
        status: 'OK',
        title: 'Vous etes deja inscrit via ce terminal',
        data: req.body,
      })
    }
  } else {
    res.status(500).json({
      status: 'FAILED',
      title: "Données d'inscription invalides",
      data: req.body,
    })
  }

})
const subscribeToFetchServer = function(req, response) {
  console.log(req.body.fetchServerData.userName, " -> Manager :", req.body.fetchServerData.isManager," -> Employee :", req.body.fetchServerData.isEmployee)
  var headers = {
    Accept: 'application/json',
    'Accept-Language': 'fr-FR',
    "Content-Type":"application/json"
  }
  fetch("http://localhost:3002/subscribe", {
    credentials: 'include',
    cache: "force-cache",
    headers: headers,
    method: 'POST',
    body: JSON.stringify(req.body.fetchServerData)
  })
    .then(resp => resp.json())
        .then ((res) => {
          if(res.status == "OK"){
            response.status(201).json({
              status: 'OK',
              title: 'Vous etes inscrit avec succés',
              data: req.body,
            })
          }else{
            response.status(500).json({
              status: 'FAILURE',
              title: "Opération d'inscription a echoué (Fetch server error)",
              data: req.body,
            })
          }
        })
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

//------------------------------------------------------------------------------------------------------------
//---------------------------------------- PUSH API--------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------

router.post('/push', function(req, res) {
  var payload = JSON.stringify(req.body.data)
  var options = {
    gcmAPIKey: 'AIzaSyCsnUVVKu8sgVt9SmLRfCrLg84qhmo9M44',
    TTL: 60,
  }
  var result = []
  for (let i = 0; i < store.users[req.body.name].subscriptions.length; i++) {
    try {
      webPush
        .sendNotification(
          store.users[req.body.name].subscriptions[i],
          payload,
          options
        )
        .then(
          function(data) {
            result.push({
              status: 'OK',
              message: 'notification envoyée',
              data: data,
            })
            if (i === store.users[req.body.name].subscriptions.length - 1) {
              var tester = false;
            result.map(resp => {
              if (resp.status === 'OK') {
                tester = true
              }
            })
            if(tester === true) {
              console.log("La notificaton est envoyée avec succés à l'utilisateur", req.body.name)
              return res.status(201).json({
                  status: 'OK',
                  title:
                    "La notificaton est envoyée avec succés a l'utilisateur",
                  data: result,
                })
            }else {
              console.log("Aucune notification n'a été envoyée à l'utilisateur", req.body.name)
              return res.status(500).json({
              status: 'FAILED',
              title: "Aucune notification n'a été envoyée",
              data: result,
            })
            }
            }
            return true;
          },
          function(err) {
            result.push({
              status: 'FAILED',
              message: "La notificaton n'est pas envoyée",
              data: err,
            })
            if (
              i ===
              store.users[req.body.name].subscriptions.length - 1
            ) {
              var tester = false;
            result.map(resp => {
              if (resp.status === 'OK') {
                tester = true
              }
            })
            if(tester === true) {
              console.log("La notificaton est envoyée avec succés à l'utilisateur", req.body.name)
              return res.status(201).json({
                  status: 'OK',
                  title:
                    "La notificaton est envoyée avec succés a l'utilisateur",
                  data: result,
                })
            }else {
              res.status(500).json({
              status: 'FAILED',
              title: "Aucune notification n'a été envoyée",
              data: result,
            })
            }
            }
          }
        )
        .catch(function(ex) {
          result.push({
            status: 'FAILED',
            message: "La notificaton n'est pas envoyée",
            data: ex,
          })
          if (
            i ===
            store.users[req.body.name].subscriptions.length - 1
          ) {
            var tester = false;
            result.map(resp => {
              if (resp.status === 'OK') {
                tester = true
              }
            })
            if(tester === true) {
              console.log("La notificaton est envoyée avec succés à l'utilisateur", req.body.name)
              return res.status(201).json({
                  status: 'OK',
                  title:
                    "La notificaton est envoyée avec succés a l'utilisateur",
                  data: result,
                })
            }else {
              return res.status(500).json({
              status: 'FAILED',
              title: "Aucune notification n'a été envoyée",
              data: result,
            })
            }
            
            
          }
        })
    } catch (e) {
      result.push({
        status: 'FAILED',
        message: "La notificaton n'est pas envoyée",
        data: e,
      })
      if (i === store.users[req.body.name].subscriptions.length - 1) {
        var tester = false;
            result.map(resp => {
              if (resp.status === 'OK') {
                tester = true
              }
            })
            if(tester === true) {
              console.log("La notificaton est envoyée avec succés à l'utilisateur", req.body.name)
              return res.status(201).json({
                  status: 'OK',
                  title:
                    "La notificaton est envoyée avec succés a l'utilisateur",
                  data: result,
                })
            }else {
              return res.status(500).json({
              status: 'FAILED',
              title: "Aucune notification n'a été envoyée",
              data: result,
            })
            }
      }
    }
  }
})

module.exports = router
