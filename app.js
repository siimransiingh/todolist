//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://simran:<password>@cluster0.vdwypyw.mongodb.net/?retryWrites=true&w=majority";

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoDB connection
mongoose.connect("mongodb+srv://simran:aqWt07O9EjxnPOzD@cluster0.vdwypyw.mongodb.net/todolistDB");

// define scchema name 
const itemSchema = mongoose.Schema({
  name: String
});


// define model based on schems
const Item = mongoose.model("Item", itemSchema);

// create some items
const item1 = new Item({
  name: "welcome to your todoList!!"
});

const item2 = new Item({
  name:"hit the + button to add new item"
})

const item3 = new Item({
  name:"<-- Hit this to delete an item."
})

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema)



app.get("/", function(req, res) {
  
  // default items in app
  Item.find({}).then(foundItems => {
    if(foundItems.length === 0) {
      Item.insertMany(defaultItems).then(function(){
        console.log("successfully saved default items to DB");
      }).catch (function(err){
        console.log(err);
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  }).catch(err => {
    console.log(err);
  })
});

app.post("/", function(req, res){
  const newEntry = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: newEntry
  });
  
  if (listName === "Today") {
    item.save();
    res.redirect("/")
  } else {
    List.findOne({ name: listName })
    .then(foundList => {
      foundList.items.push(item);
      return foundList.save();
    })
    .then(savedList => {
      res.redirect("/" + listName);
    })
    .catch(err => {
      console.log(err);
    });
  }
  
})

app.post("/delete", function(req, res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

 if(listName === "today"){
   Item.deleteOne({_id: checkedItem}).then(function () {
       console.log("Successfully deleted");
       res.redirect("/");
    })
    .catch(function (err) {
       console.log(err);
     });
 }else{
   let doc =  List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkedItem}}}, {
       new: true
     }).then(function (foundList)
     {
       res.redirect("/" + listName);
     }).catch( err => console.log(err));
 }
})

app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;
  
  List.findOne({name: customListName})
  .then(foundList => {
    if(!foundList){
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  })
  .catch((err) => {
    console.log(err);
  });
});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
