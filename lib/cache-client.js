var path = require('path');
var util = require("./util");
var fs = require('fs');

var cache = function(filename) {
    var $this = this;
    this.path = path.join(
        path.dirname(require.main.filename),
        filename
    );

    this.pathname = function(filename){
        return path.join($this.path, filename)
    };

    this.store = function(filename, content){
        return util.promise(function (resolve, reject) {
            fs.writeFile($this.pathname(filename), content, 'utf8', function(){
                $this.get(filename).then(resolve, reject);
            });
        });
    };

    this.get = function(filename){
        return util.promise(function (resolve, reject) {
            $this.exists(filename).then(function(){
                fs.readFile($this.pathname(filename), 'utf8', function(error, data){
                    if(error) reject(error);
                    else resolve(data);
                });
            }, reject);
        });
    };
    this.exists = function(filename){
        return util.promise(function (resolve, reject) {
            fs.exists($this.pathname( filename), function(exists) {
                if (exists) { resolve();}
                else { reject();}
            });
        });
    }
}

module.exports = cache;