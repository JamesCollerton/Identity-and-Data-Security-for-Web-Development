const logger = require('../../util/logger')

function handleError(err, req, res, next) {

    logger.info('Logging an error')
    logger.info(err)

    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');
    
    if (err.code === 'invalid_client') {
        var header = 'Bearer realm="book", error="invalid_token",' +
        'error_description="No access token provided"';
        res.set('WWW-Authenticate', header);
    }
    
    res.status(err.status).send({
        error: err.code,
        description: err.message
    });

}

module.exports = handleError;