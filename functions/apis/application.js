const ifSubscriptionExiste = function(Subscription, name, Store) {
  var subscriptions;
  if( Store.users[name] === undefined){
    subscriptions = undefined
  } if (Store.users[name] !== undefined) {
    subscriptions= Store.users[name].subscriptions
  }
   
  if (subscriptions === undefined) {
    return false
  } else {
    for (let i = 0; i < subscriptions.length; i++) {
      if (JSON.stringify(Subscription) === JSON.stringify(subscriptions[i])) {
        return true
      }
    }
    return false
  }
}
module.exports = ifSubscriptionExiste
