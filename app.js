require('dotenv').config()
const isProduction = (process.env.NODE_ENV === 'production');
const PORT = process.env.PORT || 8080;
const express = require('express');
var path = require('path');
const app = express();
var cors = require("cors");
// const cluster = require('cluster');
// const numCpus = require('os').cpus().length;
var cookieParser = require('cookie-parser')

// Start Mongo Connection.
require('./Models');

if (!isProduction) {
    console.log('Dev Mode');
    //disabled for testing
    // app.use(require('cors')({ credentials: true, origin: true }));
    //remove this line for production
    app.use(require('errorhandler')());
}

app.use(cors());

app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())
app.use(require('morgan')('dev'));
app.use(require('method-override')());
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', require('./Routes/index'));

// app.use('/staticContent', express.static('uploads'));

app.use(express.static("site"));

/// catch 404
app.get('*', function (req, res, next) {
    if (req.url.startsWith('/api'))
        return res.status(404).json({ error: 'Invalid URL' });
    res.sendFile(path.join(__dirname, "site", "index.html"));
});


// if (cluster.isMaster) {
//     for (let cpu = 0; cpu < numCpus; cpu++) {
//         cluster.fork();
//     }
//     cluster.on('exit', (worker, _, __) => {
//         console.log(`Worker ${worker.process.pid} Died!`);
//         cluster.fork();
//     });
// } else {
app.listen(PORT, () => console.log(`Server (${process.pid}) Started at ${PORT}`));
// }
