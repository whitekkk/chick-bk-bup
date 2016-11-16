var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var firebase = require('firebase')

var config = {
  apiKey: 'AIzaSyCPjSZnxBY9KLykYc18iW4yNVTbQyaBPsU',
  authDomain: 'chickyz-afcfe.firebaseapp.com',
  databaseURL: 'https://chickyz-afcfe.firebaseio.com',
  storageBucket: 'chickyz-afcfe.appspot.com',
  messagingSenderId: '763551736427'
}

firebase.initializeApp(config)
var Foods = firebase.database().ref('foods')
var Avatars = firebase.database().ref('avatars')

app.use(bodyParser.json())

app.set('port', (process.env.PORT || 4000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

var foods = []
var avatars = []

Foods.on('child_added', function (snapshot) {
  var item = snapshot.val()
  item.id = snapshot.key
  foods.push(item)
})
Foods.on('child_changed', function (snapshot) {
  var id = snapshot.key
  var food = foods.find(food => food.id === id)
  food.color = snapshot.val().color
  food.pic = snapshot.val().pic
  food.x = snapshot.val().x
  food.y = snapshot.val().y
  // change
})
Foods.on('child_removed', function (snapshot) {
  var id = snapshot.key
  foods.splice(foods.findIndex(food => food.id === id), 1)
})

Avatars.on('child_added', function (snapshot) {
  var item = snapshot.val()
  item.id = snapshot.key
  avatars.push(item)
})
Avatars.on('child_changed', function (snapshot) {
  var id = snapshot.key
  var avatar = avatars.find(avatar => avatar.id === id)
  avatar.x = snapshot.val().x
  avatar.y = snapshot.val().y
  avatar.color = snapshot.val().color
  avatar.face = snapshot.val().face
  avatar.speed = snapshot.val().speed
  avatar.eat = snapshot.val().eat
  avatar.score = snapshot.val().score
  // change
})
Avatars.on('child_removed', function (snapshot) {
  var id = snapshot.key
  avatars.splice(avatars.findIndex(avatar => avatar.id === id), 1)
  // vm.checkName = true ***`แก้ซะ`
})

var newFood
var length = 0
var genfood = 0
var color = ''
setInterval(function () {
  if (length < 40) {
    genfood = Math.floor(Math.random() * 30) + 1
    if (genfood > 4) {
      genfood = (genfood % 2) + 4
    }
    if (genfood === 1) {
      color = '#F5FF5D'
    } else if (genfood === 2) {
      color = '#AEFBE9'
    } else if (genfood === 3) {
      color = '#FC665A'
    } else {
      color = ''
    }
    newFood = {
      pic: genfood,
      color,
      x: Math.floor(Math.random() * 2800) + 50,
      y: Math.floor(Math.random() * 2778) + 50
    }
    Foods.push(newFood)
  }
  length = foods.length
}, 10000)

setInterval(function () {
  for (var i = 0; i < avatars.length; i++) {
    if (avatars[i].eat === true) {
      var index = 0
      var check = 0
      // *chekeat food
      var eatFood = 0
      eatFood = foods.find(food => {
        index++
        check = ((food.x < avatars[i].x + 50) && (food.x > avatars[i].x - 50)) && ((food.y < avatars[i].y + 50) && (food.y > avatars[i].y - 50))
        return (check)
      })
      foods.splice(index, 0)
      if (eatFood !== undefined) {
        firebase.database().ref('foods/' + eatFood.id).remove()
        if (eatFood.color !== '') {
          if (avatars[i].score < 5) {
            avatars[i].score = -2
          }
          avatars[i].score = Math.ceil(avatars[i].score / 2)
          avatars[i].color = eatFood.color
        } else {
          avatars[i].score += 2
        }
        if (avatars[i].id !== '') {
          firebase.database().ref('avatars/' + avatars[i].id).update({
            color: avatars[i].color,
            score: avatars[i].score
          })
        }
      }
    }
  }
}, 10)

app.get('/', function (req, res) {
  res.send('<meta http-equiv="refresh" content="1800">')
})

app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})
