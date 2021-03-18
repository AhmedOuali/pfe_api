var express = require('express')
var router = express.Router() // get an instance of the express Router
var webPush = require('web-push')
var ifSubscriptionExiste = require('./application')
var Storage = require('node-storage')
var store = new Storage('./subscription.json')
store.put('hello', 'world1')

var subscriptions = []
//------------------------------------------------------------------------------------------------------------
//------------------------------------- SUBSCRIBE API------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
router.post('/subscribe', function(req, res) {
  if (req.body.subscription != null && req.body.name != null) {
    if (!ifSubscriptionExiste(req.body.subscription, req.body.name, store)) {
      if (store.get('users.' + req.body.name + '.subscriptions') == null) {
        console.log("Nouvel Abonné, l'utilisateur ",req.body.name," s'inscrit pour la première fois" )
        store.put('users.' + req.body.name + '.subscriptions', [
          req.body.subscription,
        ])
        
      } else {
        console.log("l'utilisateur ",req.body.name," s'inscrit via un autre terminal" )
        let subscriptions = []
        subscriptions = store.get('users.' + req.body.name + '.subscriptions')
        subscriptions.push(req.body.subscription)
        store.put('users.' + req.body.name + '.subscriptions', subscriptions)
      }
      store.get('users.' + req.body.name.subscriptions)
      subscribeToFetchServer(req, res)
    } else {
      res.status(200).json({
        status: 'OK',
        title: 'Vous etes deja inscrit via ce terminal',
        data: req.body,
      })
    }
  } else {
    res.status(501).json({
      status: 'FAILED',
      title: "Données d'inscription invalides",
      data: req.body,
    })
  }

  subscriptions[req.body.name] = req.body.subscription
})

const subscribeToFetchServer = function(req, response) {
  console.log('in')
  fetch("localhost:3002/subscribe", {
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
  for (let i = 0; i < store.get('users.' + req.body.name + '.subscriptions').length; i++) {
    try {
      webPush
        .sendNotification(
          store.get('users.' + req.body.name + '.subscriptions')[i],
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
            if (
              i ==
              store.get('users.' + req.body.name + '.subscriptions').length - 1
            ) {
              result.map(resp => {
                if (resp.status == 'OK') {
                  res.status(200).json({
                    status: 'OK',
                    title:
                      "La notificaton est envoyée avec succés a l'utilisateur",
                    data: result,
                  })
                }
              })
              res.status(500).json({
                status: 'FAILED',
                title: "Aucune notification n'a été envoyée",
                data: result,
              })
            }
          },
          function(err) {
            result.push({
              status: 'FAILED',
              message: "La notificaton n'est pas envoyée",
              data: err,
            })
            if (
              i ==
              store.get('users.' + req.body.name + '.subscriptions').length - 1
            ) {
              result.map(resp => {
                if (resp.status == 'OK') {
                  res.status(200).json({
                    status: 'OK',
                    title:
                      "La notificaton est envoyée avec succés a l'utilisateur",
                    data: result,
                  })
                }
              })
              res.status(500).json({
                status: 'FAILED',
                title: "Aucune notification n'a été envoyée",
                data: result,
              })
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
            i ==
            store.get('users.' + req.body.name + '.subscriptions').length - 1
          ) {
            result.map(resp => {
              if (resp.status == 'OK') {
                res.status(200).json({
                  status: 'OK',
                  title:
                    "La notificaton est envoyée avec succés a l'utilisateur",
                  data: result,
                })
              }
            })
            res.status(500).json({
              status: 'FAILED',
              title: "Aucune notification n'a été envoyée",
              data: result,
            })
          }
        })
    } catch (e) {
      result.push({
        status: 'FAILED',
        message: "La notificaton n'est pas envoyée",
        data: e,
      })
      if (
        i ==
        store.get('users.' + req.body.name + '.subscriptions').length - 1) {
        result.map(resp => {
          if (resp.status == 'OK') {
            res.status(200).json({
              status: 'OK',
              title: "La notificaton est envoyée avec succés a l'utilisateur",
              data: result,
            })
          }
        })
        res.status(500).json({
          status: 'FAILED',
          title: "Aucune notification n'a été envoyée",
          data: result,
        })
      }
    }
  }
})

module.exports = router
