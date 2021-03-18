const ifSubscriptionExiste = function(Subscription, name, Store) {
  var subscriptions = Store.get('users.' + name + '.subscriptions')
  if (subscriptions == null) {
    return false
  } else {
    for (let i = 0; i < subscriptions.length; i++) {
      if (JSON.stringify(Subscription) == JSON.stringify(subscriptions[i])) {
        return true
      }
    }
    return false
  }
}
module.exports = ifSubscriptionExiste
