import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import logger from './core/logger/app-logger'
import morgan from 'morgan'
import config from './core/config/config.dev'
import cars from './routes/cars.route'
import users from './routes/users.route'
import cm from './routes/cm.route'
import quest from './routes/quest.route'
import purifiers from './routes/purifiers.route'
import connectToDb from './db/connect'
import multer from "multer";
import path from "path";
import mongoose from "mongoose";
import FCM from "fcm-node";
import pdf from "html-pdf";
import ejs from "ejs";
import fs from "fs";

var upload = multer({ dest: 'uploads/'})
var actorname;
var options = {format : 'Letter'};
// var html = fs.readFileSync('./views/index.ejs','utf8');

const port = config.serverPort;
logger.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};

connectToDb();

const app = express();
app.set('view engine', 'ejs');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev", { "stream": logger.stream }));

app.use('/uploads',express.static(__dirname+'/uploads'));

app.use('/users', users);
app.use('/cars', cars);
app.use('/purifiers', purifiers);
app.use('/cm', cm);
app.use('/quests', quest);

//Index route
app.get('/', (req, res) => {
    // res.send('tesat');
    res.sendFile(path.join(__dirname + '/index.html'))
});


const controller = {};

const ConstructSchema = mongoose.Schema(
    {
        location_name : String,
        location_address : String,
        actor : String,
        date : Date,
        quest : [{
            question : String,
            answer : String
        }],
        img : [{
            origin_name : String,
            path : String,
            latitude : String,
            longitude : String,
        }]
    }
)
let Constructmodel = mongoose.model('Construct', ConstructSchema);



app.post('/construct', upload.any(), (req, res) => {
    controller.addConstruct(req, res);
})

controller.addConstruct = async (req, res) => {
    actorname = req.body.actor;
    var imgs = new Array();
    var quests = new Array();
    var questions = new Array();
    var answers = new Array();
    console.log("files == "+req.files)
    console.log("quest == "+req.body.quest)
    console.log("json == "+JSON.parse(req.body.quest))
    console.log("answer == "+req.body.answer)
    var map = new Map();
    req.files.forEach(c=>{
        imgs.push({ origin_name : ((c.originalname).split('&'))[0], path : "file://"+__dirname+"/"+c.path, latitude : ((c.originalname).split('&'))[1], longitude : ((c.originalname).split('&'))[2]});
    })

    imgs.forEach(e=>{
        console.log("origin_name == "+e.origin_name);
        console.log("path == "+e.path);
        console.log("latitude == "+e.latitude);
        console.log("longitude == "+e.longitude);
    })

    JSON.parse(req.body.quest).forEach(e=>{
        console.log(e);
        quests.push({ question : e.question, answer : e.answer})
    })

    // req.body.quest.forEach(e=>{
    //     console.log(e);
    //     quests.push({ question : e.question, answer : e.answer})
    // })

    //console.log(quests[(quests.length/2)-1]);
    // var i = 0;
    // quests.forEach(c=>{
    //     console.log(c);
    
    //     if(i==(quests.length/2)-1){
    //         console.log("return false")
    //         return false;
    //     }
    //     i++
    //     })

    // for(i =0; i <= quests.length/2-1; i++){
    //     console.log(quests[i]+"  ,  "+quests[(i+quest.length)]);
    //     console.log(quests[(i+quest.length)]);
    //     console.log("yeaaaa");

    // }

    for(var i =0; i<= questions.length; i++){
        console.log(questions[i]);
        console.log(answers[i]);
    }

    let constructToAdd = Constructmodel({
        location_name : req.body.location_name,
        location_address : req.body.location_address,
        actor : req.body.actor,
        date : Date.now(),
        quest : quests,
        // question : req.body.question,
        // answer : req.body.answer
        img : imgs
    });
    try{

        const savedConstruct = await
        Constructmodel.addConstruct(constructToAdd);
        logger.info('Adding Construct');
        console.log("actorname == "+actorname);
        push_data.data.link ='http://192.168.10.32:8080/uploads/'+savedConstruct.actor+'/'+savedConstruct.date+'.pdf';
        pushMessage();
        // res.send('added: ' + savedConstruct);
        res.render('index',{
            location_name : savedConstruct.location_name,
            location_address : savedConstruct.location_address,
            actor : savedConstruct.actor,
            date : savedConstruct.date,
            quest : savedConstruct.quest,
            img : savedConstruct.img
        })

        
        fs.mkdir(__dirname+'/uploads'+'/'+savedConstruct.actor, function(err){
            if(err){
                return console.error(err);
            }
            console.log("success");
        });

        fs.writeFileSync(__dirname+'/uploads'+'/'+savedConstruct.actor+'/'+savedConstruct.date+'.html',ejs.render(fs.readFileSync('./views/index.ejs','utf-8'),{
            location_name : savedConstruct.location_name,
            location_address : savedConstruct.location_address,
            actor : savedConstruct.actor,
            date : savedConstruct.date,
            quest : savedConstruct.quest,
            img : savedConstruct.img
        }),'utf8');
        pdf.create(fs.readFileSync(__dirname+'/uploads'+'/'+savedConstruct.actor+'/'+savedConstruct.date+'.html','utf8'), options).toFile(__dirname+'/uploads'+'/'+savedConstruct.actor+'/'+savedConstruct.date+'.pdf', function(err, res){
            if (err) return console.log(err);
            console.log(res);
        });
        
        console.log(push_data.data.link)
    }
    catch(err){
        logger.error('Error in getting construct- '+ err);
        res.send('Got error in getAll');
    }
}
Constructmodel.addConstruct = (constructToAdd) => {
    return constructToAdd.save();
}

app.get('/index', (req, res)=>{
    res.render(__dirname+'/pages/index',{
        location_name : req.body.location_name
    });
});

var serverKey = 'AAAAD-S-xTQ:APA91bHgVqtORke4oGgGBr5KlmOOgIpEFrb5o3yM0JB9LliJomy7zeAn9pvgwHk_lcXCYiVlbbiw39B6sqiX2zPJVJv-CYr5hwyU-xMJEhS0up-0girqluh6sYDd19cQbCufv2T5HgXL';
var client_token = 'c3l6pY6JqTs:APA91bEUqCmc2z-t6j8NdYYQhTaM6pIfaBpZIxWSFOTGESH5rt8eKxgpoPTMqiAqGCIcfriAsHkHvavoJvlQTOhqpcq-0G689-st7N1VxTweLDfUs1FRWUnSB4oVMLAQIOcEYrrx-JMP';


var push_data = {
    // 수신대상
    to: client_token,
    // App이 실행중이지 않을 때 상태바 알림으로 등록할 내용
    notification: {
        title: "새로운 알림이 왔습니다.",
        body: "눌러서 pdf열기",
        sound: "default",
        //click_action: "FCM_PLUGIN_ACTIVITY",
        click_action: "http://192.168.10.32:8080/uploads",
        icon: "fcm_push_icon"
    },
    // 메시지 중요도
    priority: "high",
    // App 패키지 이름
    restricted_package_name: "com.inbm.constructuremanagement",
    // App에게 전달할 데이터
    data: {
        link: 'http://www.naver.com',
        num2: 3000
    }
};

function pushMessage(){
    var fcm = new FCM(serverKey);
    fcm.send(push_data, function(err, res){

        if(err){
            console.error("-----" + err);
        }

        console.log(res);
    });

    

}

const TokenSchema = mongoose.Schema(
    {
        token : String
    }, {collection : 'Token'}
);

let Tokenmodel = mongoose.model('Token', TokenSchema);

app.post('/addtoken', (req, res) =>{
    controller.addToken(req,res);
})

controller.addToken = async (req, res) => {
    let tokenToAdd = Tokenmodel({
        token : req.body.token
    });
    try{
        const savedToken = await
        Tokenmodel.addToken(tokenToAdd);
        logger.info('Adding Token');
        res.send('added: ' + savedToken);
    }
    catch(err){
        logger.error('Error in getting token- '+ err);
        res.send('Got error in getAll');
    }

}

Tokenmodel.addToken = (tokenToAdd) =>{
    return tokenToAdd.save();
}

const PhotoSchema = mongoose.Schema(
    {
        path : [String],
        firstname : String,
        lastname : String
    }, {collection : 'Photo'}
); 

let Photomodel = mongoose.model('Photo', PhotoSchema);


app.post('/photo', upload.any(), function (req, res, next)  {
    // req.body는 텍스트 필드를 포함합니다.
    console.log(req.body.firstname);
    console.log(req.body.lastname);
    req.files.forEach( c=>{
        console.log(c.originalname + ":" + c.path);
 
    });



    res.send('test');
    
 
  })

app.post('/pic', upload.any(), (req, res)=> {
    console.log(req.body.firstname);
    console.log(req.body.lastname);
    req.files.forEach( c=>{
        console.log(c.originalname + " : " + c.path);
    });
    controller.addPhoto(req,res);

})

controller.addPhoto = async (req, res) => {
    var paths = new Array();

    req.files.forEach(c=>{
        
        paths.push(c.path);

    }) 
    let photoToAdd = Photomodel({
        path : paths,
        firstname : req.body.firstname,
        lastname : req.body.lastname
    });
    try{
        const savedPhoto = await
        Photomodel.addPhoto(photoToAdd);
        logger.info('Adding Photo');
        res.send('added: ' + savedPhoto);
    }
    catch(err){
        logger.error('Error in getting photo- '+ err);
        res.send('Got error in getAll');
    }
}

Photomodel.addPhoto = (photoToAdd) => {
    return photoToAdd.save();
}


app.listen(port, () => {
    logger.info('server started - ', port);
});
