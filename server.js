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

var upload = multer({ dest: 'uploads/'})
var actorname;


const port = config.serverPort;
logger.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};

connectToDb();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev", { "stream": logger.stream }));

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
            answer : Number
        }],
        img : [{
            origin_name : String,
            path : String,
            latitude : Number,
            longtitude : Number
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
    console.log(req.body.quest)
    console.log(req.body.question)
    console.log(req.body.answer)
    var map = new Map();
    req.files.forEach(c=>{
        imgs.push({ origin_name : c.originalname, path : c.path, latitude : 0, longtitude : 0});
    })
    imgs.forEach(e=>{
        console.log(e.origin_name);
        console.log(e.path);
    })
    // req.body.quest.forEach(e=>{
    //     quests.push({ question : e.question, answer : e.answer});
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
        console.log("yes");
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
        console.log(actorname);
        pushMessage();
        res.send('added: ' + savedConstruct);
    }
    catch(err){
        logger.error('Error in getting construct- '+ err);
        res.send('Got error in getAll');
    }
}
Constructmodel.addConstruct = (constructToAdd) => {
    return constructToAdd.save();
}

var serverKey = 'AAAAD-S-xTQ:APA91bHgVqtORke4oGgGBr5KlmOOgIpEFrb5o3yM0JB9LliJomy7zeAn9pvgwHk_lcXCYiVlbbiw39B6sqiX2zPJVJv-CYr5hwyU-xMJEhS0up-0girqluh6sYDd19cQbCufv2T5HgXL';
var client_token = 'dur6pyaPCoY:APA91bGAuCvN9wxFZsPXrPIRJH0QXHkB2MS4715fBdSa-jv50Eqwgy49SFJDOnrvX0BRHiZrigfZVttDl8kCbUL82XhlPW_971LBusQADYXsAVkyLi2xL8rznnHwUuSwuk8cNYKVZ6kn';


var push_data = {
    // 수신대상
    to: client_token,
    // App이 실행중이지 않을 때 상태바 알림으로 등록할 내용
    notification: {
        title: "지우지마셈",
        body: "http://www.naver.com",
        sound: "default",
        //click_action: "FCM_PLUGIN_ACTIVITY",
        click_action: "http://www.naver.com",
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