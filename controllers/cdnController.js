
// External Library
const async = require('async');
const randomString = require('randomstring');
// Internal Library
const path = require('path');
const fs = require('fs');



/* upload cdn ( brian ) */
exports.uploadCDN = ( APP, req, callback ) =>{
    let { folder_name } = req.body;

    async.waterfall(
        [
            function param( callback ) {
                // Cek Parameter
                if ( folder_name ) {
                    callback( null, {} );
                } else {
                    callback({
                        code: "INVALID_REQUEST",
                        message: "Kesalahan parameter",
                        data: {}
                    });
                }
            },
            function cekFile( data, callback ) {
                try {
                    // Declare Variable
                    let { mv, name, mimetype } = req.files.file;
                    //let fileName = randomString.generate( 10 ) + path.extname( name );

                    data.mv = mv;
                    data.fileName = name;

                    callback( null, data );

                } catch ( err ) {

                    callback({
                        code: "INVALID_REQUEST",
                        message: "File tidak ada",
                        info: err
                    });
                }
            },
            function deleteFile( data, callback ) {
                let { fileName } = data;

                let listFile = fs.readdirSync( path.join( __dirname, `../public/cdn/${folder_name}` ) );
                let cekFile = listFile.filter( x => x == fileName );

                if ( cekFile.length > 0 ) {
                    fs.unlinkSync( path.join( __dirname, `../public/cdn/${folder_name}/`, fileName ) );

                    callback( null, data );
                } else {
                    callback( null, data );
                }    
            },
            function uploadFile( data, callback ) {
                // Declare Variable
                let { mv, fileName } = data;
                let directory = path.join( __dirname, `../public/cdn/${folder_name}/`, fileName );
                

                // Move file to directory
                mv( directory, ( err, result ) => {
                    if ( err ) {
                        callback({
                            code: "INVALID",
                            message: "Gagal upload file",
                            data: err
                        });
                    } else {
                        callback( null, {
                            code: "OK",
                            message: "Success file upload",
                            data: {
                                directory: `/cdn/${folder_name}/${fileName}`
                            }
                        });
                    }
                });
            }
        ],
        function ( err, result ) {
            if ( err ) return callback( err )

            return callback( null, result )
        }
    );
}