/**
* A method for hitter process.
*
* @return   mixed
*/
module.exports = {
    
    /**
    * Hit to specified or anything API.
    *
    * @param    mixed      data
    * @param    callable   func
    * @return   mixed
    */
    hitAPI: function(data)
    {
        try{
            var http = require('http');
            var req = http.request({
                'method': data.method,
                'hostname': data.hostname,
                'port': data.port,
                'path': data.path,
                'headers': data.headers
            }, function(res)
            {
                var chunks = [];

                res.on('data', function(chunk)
                {
                    chunks.push(chunk);
                });

                res.on('end', function()
                {
                    var body = Buffer.concat(chunks);

                    if(typeof data.callback !== 'undefined'
                    && typeof data.callback === 'function')
                    {
                        data.callback(JSON.parse(body.toString()));
                    }
                });
            });

            if(data.method !== 'GET')
            {
                req.write(JSON.stringify(data.body));
            }

            req.end();
        }catch(error){
            data.callback({
                status: 500,
                rc: 1,
                message: 'Internal Server Error - Check Core' + body.toString()
            });
        }

       
    },

    createToken: function(callback)
    {
        const unirest  = require('unirest'),
              moment   = require('moment');

        unirest.post('https://oauth.bahasakita.co.id/api/token')
        .headers({
            'Content-Type': 'application/x-www-form-urlencoded',            
            'Authorization':'Basic dmFzY29tbTp2QHNjb20yMDE4'
        })
        .send({
			'grant_type':'client_credentials',
			'scope':'SpeechTest'
		})
        .end(function (response) {
          if(response.error){
            console.log(response.error);
            console.log(response.raw_body);
            callback({
                status: 500,
                rc: 1,
                message: 'Internal Server Error - Check Core'
            });
          }else{                     
            callback(null, response.access_token);
          }
        });
    },

    hitIpManagement: function(data, params)
    {

        const async    = require('async'),
              moment   = require('moment'),
              unirest  = require('unirest');
        try {
            async.waterfall([
                function getToken(callback) {                  
                    module.exports.createToken(function(err,output){
                        if(err){
                            callback({
                                status: 500,
                                rc: 1,
                                message: 'Internal Server Error - Check Core'
                            });
                            return;
                        }else{
                            callback(null, output); 
                        }
                    })                                            
                },
                function send(token, callback) {
                    data.body.httpMethod = 'POST';
                    data.body.uriRelativePath = data.path;
                    unirest.post('https://apidev.bni.co.id:8066/emoney/transaction?access_token='+token)
                    .headers({
                        'Content-Type': 'application/json',
                    })
                    .send(data.body)
                    .end(function (response) {
                      if(response.error){
                        callback({
                            status: 500,
                            rc: 1,
                            message: 'Internal Server Error - Check Core'
                        });
                      }else{
                        callback(response.raw_body);
                      }
                    });
                },
            ],function(err,results){
                if(err){
                    data.callback(err);
                }
                else{
                    data.callback(results);
                }
            });
        } catch (e) {
            data.callback({
                status: 500,
                rc: 1,
                message: 'Internal Server Error - Check Core' + body.toString()
            });
        }
       
    }
};
