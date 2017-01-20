var fs = require('fs-extra');

module.exports = function(context) {
	
    var target = context.opts.projectRoot+'/www/js/app.js';
    var source;
    
    if(context.opts.options.debug && context.opts.options.debug==true){
    	source = context.opts.projectRoot+'/www/js/app.debug.js';
    }else{
    	source = context.opts.projectRoot+'/www/js/app.release.js';
    }
    
    fs.copy(source, target, function(err){
    	if (err){
			console.error('Ops! copy');
			console.error(err);
		}
    });
	/*fs.removeSync(target);
	fs.readFile(source, 'utf8', function(err, data) {
		if(!err){
			fs.outputFile(target, data, function(err) {
				if (err){
					console.error('Ops! outputFile');
					console.error(err);
				}
			});
		}else{
			console.error('Ops! readFile');
			console.error(err);
		}
	});*/
};
